import { GameState } from '../types';
import { ACHIEVEMENTS, AchievementDef } from '../utils/achievementData';

/**
 * Pure function: evaluate achievement conditions and return new state plus any newly unlocked achievements.
 * Caller is responsible for playing sound and pushing unlockedDefs to toast queue.
 */
export function processAchievements(state: GameState): {
  newState: GameState;
  unlockedDefs: AchievementDef[];
} {
  const newUnlockedIds: string[] = [];
  const unlockedDefs: AchievementDef[] = [];
  let bonusCoins = 0;

  ACHIEVEMENTS.forEach((achievement) => {
    if (!state.unlockedAchievements.includes(achievement.id)) {
      if (achievement.condition(state)) {
        newUnlockedIds.push(achievement.id);
        unlockedDefs.push(achievement);
        bonusCoins += achievement.rewardCoins;
      }
    }
  });

  if (newUnlockedIds.length === 0) {
    return { newState: state, unlockedDefs: [] };
  }

  return {
    newState: {
      ...state,
      unlockedAchievements: [...state.unlockedAchievements, ...newUnlockedIds],
      coins: state.coins + bonusCoins,
    },
    unlockedDefs,
  };
}
