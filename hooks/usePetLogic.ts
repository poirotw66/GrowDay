import { useCallback } from 'react';
import { GameState, Habit, RetiredPet } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet } from '../utils/petData';
import { STAGE_THRESHOLDS } from '../utils/gameLogic';
import { playUnlockSound } from '../utils/audio';

/**
 * Pet-specific actions: retirement (legacy). Nickname is in useHabitActions.
 * This hook only handles retireHabit (level-based pet retirement and new pet assignment).
 */
export function usePetLogic(
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  applyAchievements: (state: GameState) => GameState
) {
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
