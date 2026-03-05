/**
 * Shared constants and migration for game state. Used by gameStateStore and useGameState
 * to avoid circular dependencies.
 */
import type {
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

export const STORAGE_KEY = 'growday_save_v2';
export const OLD_STORAGE_KEY = 'growday_save_v1';
export const PENDING_SYNC_KEY = 'growday_pending_sync';

export function setPendingSync(pending: boolean): void {
  if (typeof localStorage === 'undefined') return;
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
  calendarStyle: 'idol_magazine',
  selectedSound: 'thud',
  unlockedAchievements: [],
};

/**
 * Apply migration and recalc to parsed state (shared by localStorage and Firestore).
 */
export function applyMigration(parsed: Record<string, unknown>): GameState {
  const today = getTodayString();
  const updatedHabits = { ...(parsed.habits as Record<string, Habit>) };
  const habitIds = Object.keys(updatedHabits);
  let loadedUnlockedIcons =
    (parsed.unlockedIcons as string[]) || getDefaultUnlockedIcons();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  habitIds.forEach((key) => {
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
  const parsedIsOnboarded = (parsed.isOnboarded as boolean | undefined) ?? false;

  return {
    ...INITIAL_STATE,
    ...parsed,
    habits: updatedHabits,
    unlockedIcons: loadedUnlockedIcons,
    // If there is at least one habit in the save, we always consider onboarding complete.
    // This fixes older saves (or remote data) that never set isOnboarded but already have habits,
    // which would otherwise cause the app to show the onboarding flow again after login.
    isOnboarded: habitIds.length > 0 ? true : parsedIsOnboarded,
    world: (parsed.world as GameState['world'])
      ? { ...INITIAL_STATE.world, ...(parsed.world as object) }
      : INITIAL_STATE.world,
    retiredPets: (parsed.retiredPets as RetiredPet[]) || [],
    calendarStyle: (parsed.calendarStyle as CalendarStyle) || 'idol_magazine',
    selectedSound: (parsed.selectedSound as string) || 'thud',
    unlockedAchievements: (parsed.unlockedAchievements as string[]) || [],
  } as GameState;
}

/** Migrate V1 save format to GameState (for useGameState local load only). */
export function migrateV1ToV2(parsedV1: Record<string, unknown>): GameState {
  const defaultColor: PetColor = 'green';
  const assignedPet = assignRandomPet(defaultColor);
  const migratedHabit: Habit = {
    id: 'habit_' + Date.now(),
    name: (parsedV1.habitName as string) || '我的習慣',
    stampIcon: (parsedV1.stampIcon as string) || 'star',
    stampColor: DEFAULT_STAMP_COLOR,
    petColor: defaultColor,
    petId: assignedPet,
    startDate: (parsedV1.startDate as string) || getTodayString(),
    logs: (parsedV1.logs as Habit['logs']) || {},
    totalExp: (parsedV1.totalExp as number) || 0,
    currentLevel: (parsedV1.currentLevel as number) || 1,
    currentStreak: (parsedV1.currentStreak as number) || 0,
    longestStreak: (parsedV1.longestStreak as number) || 0,
    generation: 1,
  };
  return {
    ...INITIAL_STATE,
    habits: { [migratedHabit.id]: migratedHabit },
    activeHabitId: migratedHabit.id,
    unlockedPets: [assignedPet],
    isOnboarded: true,
  };
}
