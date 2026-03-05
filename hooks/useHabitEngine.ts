/**
 * Facade hook: composes useGameState, useAchievementToasts, useHabitActions, useWorldActions, usePetLogic
 * and exposes a single API for the app. This keeps the same public contract while logic lives in focused modules.
 */
import { useGameState } from '../store/useGameState';
import { useAchievementToasts } from './useAchievementToasts';
import { useHabitActions } from './useHabitActions';
import { useWorldActions } from './useWorldActions';
import { usePetLogic } from './usePetLogic';

export function useHabitEngine() {
  const {
    gameState,
    setGameState,
    activeHabit,
    isLoaded,
    syncStatus,
    syncHelpers,
  } = useGameState();

  const {
    newlyUnlockedAchievements,
    dismissToast,
    applyAchievements,
  } = useAchievementToasts();

  const habitActions = useHabitActions(
    gameState,
    setGameState,
    syncHelpers,
    applyAchievements
  );

  const worldActions = useWorldActions(
    setGameState,
    syncHelpers,
    applyAchievements
  );

  const { retireHabit } = usePetLogic(setGameState, applyAchievements);

  return {
    gameState,
    activeHabit,
    isLoaded,
    syncStatus,
    addHabit: habitActions.addHabit,
    switchHabit: habitActions.switchHabit,
    updateStampStyle: habitActions.updateStampStyle,
    setCalendarStyle: habitActions.setCalendarStyle,
    setSoundEffect: habitActions.setSoundEffect,
    stampToday: habitActions.stampToday,
    debugStampDate: habitActions.debugStampDate,
    debugStampRange: habitActions.debugStampRange,
    isTodayStamped: habitActions.isTodayStamped,
    getMonthlyCount: habitActions.getMonthlyCount,
    resetProgress: habitActions.resetProgress,
    importSaveData: habitActions.importSaveData,
    buyDecoration: worldActions.buyDecoration,
    placeDecoration: worldActions.placeDecoration,
    removeDecoration: worldActions.removeDecoration,
    placePetInArea: worldActions.placePetInArea,
    removePetFromArea: worldActions.removePetFromArea,
    unlockArea: worldActions.unlockArea,
    retireHabit,
    updatePetNickname: habitActions.updatePetNickname,
    renameHabit: habitActions.renameHabit,
    deleteHabit: habitActions.deleteHabit,
    newlyUnlockedAchievements,
    dismissToast,
    addGoal: habitActions.addGoal,
    removeGoal: habitActions.removeGoal,
    checkGoalCompletion: habitActions.checkGoalCompletion,
    addCustomStamp: habitActions.addCustomStamp,
    deleteCustomStamp: habitActions.deleteCustomStamp,
  };
}
