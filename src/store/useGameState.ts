/**
 * Core game state and persistence. Uses Zustand store (localStorage via persist);
 * Firestore sync runs here as a subscriber to auth + store.
 */
import { useState, useEffect, useRef } from 'react';
import type { GameState, Habit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getGameStateForUser, setGameStateForUser } from '../firebase';
import {
  migrateStampsToFirebase,
  isStorageAvailable,
} from '../utils/firebaseStorage';
import {
  STORAGE_KEY,
  OLD_STORAGE_KEY,
  PENDING_SYNC_KEY,
  applyMigration,
  INITIAL_STATE,
  migrateV1ToV2,
} from './gameStateInit';
import {
  useGameStore,
  useRehydrationStore,
  selectGameState,
  selectSetGameState,
} from './gameStateStore';

export function setPendingSync(pending: boolean): void {
  if (pending) localStorage.setItem(PENDING_SYNC_KEY, '1');
  else localStorage.removeItem(PENDING_SYNC_KEY);
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncHelpers {
  user: ReturnType<typeof useAuth>['user'];
  markManualSync: () => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPendingSync: (pending: boolean) => void;
}

export { INITIAL_STATE, applyMigration, STORAGE_KEY, OLD_STORAGE_KEY };

/**
 * Hook: game state from Zustand store (persisted to localStorage).
 * Firestore sync is handled here; components can use useGameStore(selector) for fine-grained re-renders.
 */
export function useGameState(): {
  gameState: GameState;
  setGameState: (next: GameState | ((prev: GameState) => GameState)) => void;
  activeHabit: Habit | null;
  isLoaded: boolean;
  syncStatus: SyncStatus;
  syncHelpers: SyncHelpers;
  gameStateRef: React.MutableRefObject<GameState>;
} {
  const gameState = useGameStore(selectGameState);
  const setGameState = useGameStore(selectSetGameState);
  const rehydrated = useRehydrationStore((s) => s.rehydrated);

  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const { user, authLoading } = useAuth();
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const syncHelpers: SyncHelpers = {
    user,
    markManualSync: () => {},
    setSyncStatus,
    setPendingSync,
  };

  // When no user: after rehydration, run V1 migration if needed and mark loaded
  useEffect(() => {
    if (authLoading || user || !rehydrated) return;
    const state = useGameStore.getState().gameState;
    const hasV2 = Object.keys(state.habits).length > 0 || state.isOnboarded;
    if (hasV2) {
      setIsLoaded(true);
      return;
    }
    const savedV1 = localStorage.getItem(OLD_STORAGE_KEY);
    if (savedV1) {
      try {
        const parsedV1 = JSON.parse(savedV1) as Record<string, unknown>;
        const migrated = migrateV1ToV2(parsedV1);
        setGameState(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch (e) {
        console.error('Failed to migrate V1 save', e);
      }
    }
    setIsLoaded(true);
  }, [authLoading, user, rehydrated, setGameState]);

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

  // Single source of sync: any store change triggers debounced upload to Firestore
  useEffect(() => {
    if (!user || !isLoaded) return;
    const t = setTimeout(() => {
      setSyncStatus('syncing');
      setPendingSync(true);
      const state = useGameStore.getState().gameState;
      setGameStateForUser(user.uid, state)
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
