import { useCallback } from 'react';
import { GameState, Habit, RetiredPet } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet } from '../utils/petData';
import { STAGE_THRESHOLDS } from '../utils/gameLogic';
import { playUnlockSound } from '../utils/audio';
import { useGameStore, selectSetGameState } from '../store/gameStateStore';

/**
 * Self-contained pet actions. Writes to Zustand store; Firestore sync is handled in useGameState.
 */
export function usePetLogic(
  applyAchievements: (state: GameState) => GameState
) {
  const setGameState = useGameStore(selectSetGameState);
  const retireHabit = useCallback(
    (habitId: string) => {
      setGameState((prev) => {
        const habit = prev.habits[habitId];
        if (!habit || habit.currentLevel < STAGE_THRESHOLDS.ADULT) return prev;

        const today = getTodayString();
        const retiredPet: RetiredPet = {
          id: `retired_${Date.now()}`,
          originalHabitId: habit.id,
          petId: habit.petId,
          name: habit.name,
          retiredDate: today,
          generation: habit.generation || 1,
          bonusMultiplier: 0.1,
        };
        const newPetId = assignRandomPet(habit.petColor);
        const newHabit: Habit = {
          ...habit,
          petId: newPetId,
          totalExp: 0,
          currentLevel: 1,
          generation: (habit.generation || 1) + 1,
        };
        playUnlockSound();

        const nextState = {
          ...prev,
          habits: { ...prev.habits, [habitId]: newHabit },
          retiredPets: [...prev.retiredPets, retiredPet],
          unlockedPets: prev.unlockedPets.includes(newPetId)
            ? prev.unlockedPets
            : [...prev.unlockedPets, newPetId],
        };
        return applyAchievements(nextState);
      });
    },
    [applyAchievements, setGameState]
  );

  return { retireHabit };
}
