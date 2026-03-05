import { useState, useCallback } from 'react';
import { GameState } from '../types';
import { AchievementDef } from '../utils/achievementData';
import { processAchievements } from '../services/achievementService';
import { playUnlockSound } from '../utils/audio';

/**
 * Manages the queue of newly unlocked achievements for toast display.
 * Exposes applyAchievements: given a state, run achievement checks, push any new unlocks to the queue, return new state.
 */
export function useAchievementToasts(): {
  newlyUnlockedAchievements: AchievementDef[];
  dismissToast: (id: string) => void;
  applyAchievements: (state: GameState) => GameState;
} {
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<
    AchievementDef[]
  >([]);

  const dismissToast = useCallback((id: string) => {
    setNewlyUnlockedAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const applyAchievements = useCallback((state: GameState): GameState => {
    const { newState, unlockedDefs } = processAchievements(state);
    if (unlockedDefs.length > 0) {
      playUnlockSound();
      setNewlyUnlockedAchievements((prev) => [...prev, ...unlockedDefs]);
    }
    return newState;
  }, []);

  return {
    newlyUnlockedAchievements,
    dismissToast,
    applyAchievements,
  };
}
