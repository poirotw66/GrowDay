import { useState, useEffect, useRef } from 'react';
import {
  GameState,
  Habit,
  PetColor,
  RetiredPet,
  CalendarStyle,
} from '../types';
import { calculateStreak } from '../utils/gameLogic';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet } from '../utils/petData';
import { getDefaultUnlockedIcons, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { INITIAL_AREAS } from '../utils/worldData';
import { getHabitMonthlyCount, checkUnlockableIcons } from '../utils/habitHelpers';
import { useAuth } from '../contexts/AuthContext';
import { getGameStateForUser, setGameStateForUser } from '../firebase';
import {
  migrateStampsToFirebase,
  isStorageAvailable,
} from '../utils/firebaseStorage';

const STORAGE_KEY = 'growday_save_v2';
const OLD_STORAGE_KEY = 'growday_save_v1';
const PENDING_SYNC_KEY = 'growday_pending_sync';

export function setPendingSync(pending: boolean): void {
  if (pending) localStorage.setItem(PENDING_SYNC_KEY, '1');
  else localStorage.removeItem(PENDING_SYNC_KEY);
}

export const INITIAL_STATE: GameState = {
  habits: {},
  activeHabitId: null,
  unlockedPets: [],
  unlockedIcons: getDefaultUnlockedIcons(),
  isOnboarded: false,
  coins: 0,
  inventory: [],
  world: {
    unlockedAreas: ['home'],
    areas: JSON.parse(JSON.stringify(INITIAL_AREAS)),
  },
  retiredPets: [],
  calendarStyle: 'handdrawn',
  selectedSound: 'thud',
  unlockedAchievements: [],
};

/**
 * Apply migration and recalc to parsed state (shared by localStorage and Firestore).
 */
export function applyMigration(parsed: Record<string, unknown>): GameState {
  const today = getTodayString();
  const updatedHabits = { ...(parsed.habits as Record<string, Habit>) };
  let loadedUnlockedIcons =
    (parsed.unlockedIcons as string[]) || getDefaultUnlockedIcons();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  Object.keys(updatedHabits).forEach((key) => {
    const habit = updatedHabits[key];
    habit.currentStreak = calculateStreak(habit.logs, today);
    if (!habit.stampColor) habit.stampColor = DEFAULT_STAMP_COLOR;
    if (typeof habit.generation !== 'number') habit.generation = 1;
    const monthlyCount = getHabitMonthlyCount(
      habit,
      currentYear,
      currentMonth
    );
    loadedUnlockedIcons = checkUnlockableIcons(
      habit,
      loadedUnlockedIcons,
      monthlyCount
    );
  });
  return {
    ...INITIAL_STATE,
    ...parsed,
    habits: updatedHabits,
    unlockedIcons: loadedUnlockedIcons,
    world: (parsed.world as GameState['world'])
      ? { ...INITIAL_STATE.world, ...(parsed.world as object) }
      : INITIAL_STATE.world,
    retiredPets: (parsed.retiredPets as RetiredPet[]) || [],
    calendarStyle: (parsed.calendarStyle as CalendarStyle) || 'handdrawn',
    selectedSound: (parsed.selectedSound as string) || 'thud',
    unlockedAchievements: (parsed.unlockedAchievements as string[]) || [],
  } as GameState;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncHelpers {
  user: ReturnType<typeof useAuth>['user'];
  markManualSync: () => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPendingSync: (pending: boolean) => void;
}

/**
 * Core game state and persistence (localStorage + Firestore).
 * Exposes syncHelpers for action hooks that perform immediate Firestore sync.
 */
export function useGameState(): {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  activeHabit: Habit | null;
  isLoaded: boolean;
  syncStatus: SyncStatus;
  syncHelpers: SyncHelpers;
  gameStateRef: React.MutableRefObject<GameState>;
} {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const { user, authLoading } = useAuth();
  const gameStateRef = useRef(gameState);
  const lastManualSyncRef = useRef<number>(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  function markManualSync(): void {
    lastManualSyncRef.current = Date.now();
  }

  const syncHelpers: SyncHelpers = {
    user,
    markManualSync,
    setSyncStatus,
    setPendingSync,
  };

  // Load from localStorage on mount when not waiting for auth or when no user
  useEffect(() => {
    if (authLoading) return;
    if (user) return;

    const savedV2 = localStorage.getItem(STORAGE_KEY);
    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2) as Record<string, unknown>;
        const updatedState = applyMigration(parsed);
        setGameState(updatedState);
        setIsLoaded(true);
        return;
      } catch (e) {
        console.error('Failed to load V2 save', e);
      }
    }

    const savedV1 = localStorage.getItem(OLD_STORAGE_KEY);
    if (savedV1) {
      try {
        const parsedV1 = JSON.parse(savedV1);
        const newId = 'habit_' + Date.now();
        const defaultColor: PetColor = 'green';
        const assignedPet = assignRandomPet(defaultColor);
        const migratedHabit: Habit = {
          id: newId,
          name: parsedV1.habitName || '我的習慣',
          stampIcon: parsedV1.stampIcon || 'star',
          stampColor: DEFAULT_STAMP_COLOR,
          petColor: defaultColor,
          petId: assignedPet,
          startDate: parsedV1.startDate || getTodayString(),
          logs: parsedV1.logs || {},
          totalExp: parsedV1.totalExp || 0,
          currentLevel: parsedV1.currentLevel || 1,
          currentStreak: parsedV1.currentStreak || 0,
          longestStreak: parsedV1.longestStreak || 0,
          generation: 1,
        };
        const newState: GameState = {
          ...INITIAL_STATE,
          habits: { [newId]: migratedHabit },
          activeHabitId: newId,
          unlockedPets: [assignedPet],
          isOnboarded: true,
        };
        setGameState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (e) {
        console.error('Failed to migrate V1 save', e);
      }
    }

    setIsLoaded(true);
  }, [authLoading, user]);

  // When user is set: load from Firestore or upload local state
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setSyncStatus('syncing');
        const remote = await getGameStateForUser(user.uid);
        if (cancelled) return;
        const hasPendingSync =
          typeof localStorage !== 'undefined' &&
          localStorage.getItem(PENDING_SYNC_KEY);
        const local = localStorage.getItem(STORAGE_KEY);

        if (remote && typeof remote === 'object' && !hasPendingSync) {
          const updatedState = applyMigration(
            remote as Record<string, unknown>
          );
          if (
            isStorageAvailable() &&
            updatedState.customStamps
          ) {
            const base64Count = Object.values(
              updatedState.customStamps
            ).filter((s) => s.storageType === 'base64').length;
            if (base64Count > 0) {
              const migratedStamps = await migrateStampsToFirebase(
                updatedState.customStamps,
                user.uid
              );
              updatedState.customStamps = migratedStamps;
              if (!cancelled) {
                await setGameStateForUser(user.uid, updatedState);
              }
            }
          }
          setGameState(updatedState);
          if (!cancelled) {
            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);
          }
        } else if (hasPendingSync && local) {
          const parsed = JSON.parse(local) as Record<string, unknown>;
          const updated = applyMigration(parsed);
          if (isStorageAvailable() && updated.customStamps) {
            const migratedStamps = await migrateStampsToFirebase(
              updated.customStamps,
              user.uid
            );
            updated.customStamps = migratedStamps;
          }
          setGameState(updated);
          if (!cancelled) {
            await setGameStateForUser(user.uid, updated);
            if (!cancelled) {
              setPendingSync(false);
              setSyncStatus('synced');
              setTimeout(() => setSyncStatus('idle'), 2000);
            }
          }
        } else if (
          hasPendingSync &&
          !local &&
          remote &&
          typeof remote === 'object'
        ) {
          const updatedState = applyMigration(
            remote as Record<string, unknown>
          );
          if (
            isStorageAvailable() &&
            updatedState.customStamps
          ) {
            const base64Count = Object.values(
              updatedState.customStamps
            ).filter((s) => s.storageType === 'base64').length;
            if (base64Count > 0) {
              const migratedStamps = await migrateStampsToFirebase(
                updatedState.customStamps,
                user.uid
              );
              updatedState.customStamps = migratedStamps;
              if (!cancelled) {
                await setGameStateForUser(user.uid, updatedState);
              }
            }
          }
          setGameState(updatedState);
          setPendingSync(false);
          if (!cancelled) {
            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);
          }
        } else if (local) {
          const parsed = JSON.parse(local) as Record<string, unknown>;
          const updated = applyMigration(parsed);
          if (isStorageAvailable() && updated.customStamps) {
            const migratedStamps = await migrateStampsToFirebase(
              updated.customStamps,
              user.uid
            );
            updated.customStamps = migratedStamps;
          }
          setGameState(updated);
          if (!cancelled) {
            await setGameStateForUser(user.uid, updated);
            if (!cancelled) {
              setSyncStatus('synced');
              setTimeout(() => setSyncStatus('idle'), 2000);
            }
          }
        } else if (remote && typeof remote === 'object') {
          const updatedState = applyMigration(
            remote as Record<string, unknown>
          );
          if (
            isStorageAvailable() &&
            updatedState.customStamps
          ) {
            const base64Count = Object.values(
              updatedState.customStamps
            ).filter((s) => s.storageType === 'base64').length;
            if (base64Count > 0) {
              const migratedStamps = await migrateStampsToFirebase(
                updatedState.customStamps,
                user.uid
              );
              updatedState.customStamps = migratedStamps;
              if (!cancelled) {
                await setGameStateForUser(user.uid, updatedState);
              }
            }
          }
          setGameState(updatedState);
          if (!cancelled) {
            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);
          }
        } else {
          if (!cancelled) {
            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);
          }
        }
      } catch (e) {
        console.error('Firestore load/save failed', e);
        if (!cancelled) {
          setSyncStatus('error');
          if (e instanceof Error) {
            console.error('Error details:', {
              message: e.message,
              stack: e.stack,
              name: e.name,
            });
          }
        }
      }
      if (!cancelled) setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSyncStatus('idle');
      setPendingSync(false);
    }
  }, [user]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  // Debounced save to Firestore
  useEffect(() => {
    if (!user || !isLoaded) return;
    const t = setTimeout(() => {
      const timeSinceManualSync =
        Date.now() - lastManualSyncRef.current;
      if (timeSinceManualSync < 2000) return;
      setSyncStatus('syncing');
      setPendingSync(true);
      setGameStateForUser(user.uid, gameStateRef.current)
        .then(() => {
          setPendingSync(false);
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2000);
        })
        .catch((e) => {
          console.error('Firestore save failed', e);
          setSyncStatus('error');
        });
    }, 1500);
    return () => clearTimeout(t);
  }, [gameState, isLoaded, user]);

  const activeHabit =
    gameState.activeHabitId != null
      ? gameState.habits[gameState.activeHabitId] ?? null
      : null;

  return {
    gameState,
    setGameState,
    activeHabit,
    isLoaded,
    syncStatus,
    syncHelpers,
    gameStateRef,
  };
}

export { STORAGE_KEY, OLD_STORAGE_KEY };
