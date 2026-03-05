/**
 * Zustand store for GameState. Persists to localStorage with migration on rehydrate.
 * Use selectors so components only re-render when their slice changes.
 */
import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { GameState } from '../types';
import { INITIAL_STATE, applyMigration, STORAGE_KEY } from './gameStateInit';

/** Tracks when persist has rehydrated so useGameState can set isLoaded. */
export const useRehydrationStore = create<{ rehydrated: boolean }>(() => ({
  rehydrated: false,
}));

function createMigratingStorage(): StateStorage {
  return {
    getItem: (name: string): string | null => {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const migrated = applyMigration(parsed);
        return JSON.stringify(migrated);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
    },
  };
}

interface GameStateSlice {
  gameState: GameState;
  setGameState: (next: GameState | ((prev: GameState) => GameState)) => void;
}

export const useGameStore = create<GameStateSlice>()(
  persist(
    (set) => ({
      gameState: INITIAL_STATE,
      setGameState: (next) =>
        set((state) => ({
          gameState: typeof next === 'function' ? next(state.gameState) : next,
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createMigratingStorage()),
      partialize: (state) => ({ gameState: state.gameState }),
      onRehydrateStorage: () => () => {
        useRehydrationStore.setState({ rehydrated: true });
      },
    }
  )
);

/** Selectors for fine-grained subscriptions (fewer re-renders). */
export const selectGameState = (s: GameStateSlice) => s.gameState;
export const selectSetGameState = (s: GameStateSlice) => s.setGameState;
export const selectCalendarStyle = (s: GameStateSlice) => s.gameState.calendarStyle;
export const selectActiveHabitId = (s: GameStateSlice) => s.gameState.activeHabitId;
export const selectHabits = (s: GameStateSlice) => s.gameState.habits;
export const selectActiveHabit = (s: GameStateSlice) => {
  const id = s.gameState.activeHabitId;
  return id != null ? s.gameState.habits[id] ?? null : null;
};
export const selectSelectedSound = (s: GameStateSlice) => s.gameState.selectedSound;
export const selectUnlockedPets = (s: GameStateSlice) => s.gameState.unlockedPets;
export const selectRetiredPets = (s: GameStateSlice) => s.gameState.retiredPets;
export const selectUnlockedAchievements = (s: GameStateSlice) =>
  s.gameState.unlockedAchievements;
export const selectGoals = (s: GameStateSlice) => s.gameState.goals;
export const selectCompletedGoals = (s: GameStateSlice) => s.gameState.completedGoals;
export const selectCustomStamps = (s: GameStateSlice) => s.gameState.customStamps;
export const selectIsOnboarded = (s: GameStateSlice) => s.gameState.isOnboarded;
