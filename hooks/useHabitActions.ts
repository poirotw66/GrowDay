import { useCallback } from 'react';
import {
  GameState,
  Habit,
  PetColor,
  CalendarStyle,
  Goal,
  GoalPeriod,
  CompletedGoal,
  CustomStamp,
} from '../types';
import { calculateLevel, calculateStreak } from '../utils/gameLogic';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet } from '../utils/petData';
import { DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import {
  calculateGoalReward,
  getGoalProgress,
  getPeriodStart,
  isGoalCompleted,
} from '../utils/goalLogic';
import { getHabitMonthlyCount, checkUnlockableIcons } from '../utils/habitHelpers';
import { setGameStateForUser } from '../firebase';
import {
  deleteCustomStampFromStorage,
  isStorageAvailable,
} from '../utils/firebaseStorage';
import { playUnlockSound } from '../utils/audio';
import { applyMigration, INITIAL_STATE, STORAGE_KEY, OLD_STORAGE_KEY } from '../store/useGameState';
import type { SyncHelpers } from '../store/useGameState';

export function useHabitActions(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  syncHelpers: SyncHelpers,
  applyAchievements: (state: GameState) => GameState
) {
  const { user, markManualSync, setSyncStatus, setPendingSync } = syncHelpers;

  const addHabit = useCallback(
    (
      name: string,
      icon: string,
      color: PetColor,
      stampColor: string = DEFAULT_STAMP_COLOR
    ) => {
      const newId = 'habit_' + Date.now();
      const assignedPet = assignRandomPet(color);
      const today = getTodayString();
      const newHabit: Habit = {
        id: newId,
        name,
        stampIcon: icon,
        stampColor,
        petColor: color,
        petId: assignedPet,
        startDate: today,
        logs: {},
        totalExp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        generation: 1,
      };
      setGameState((prev) => {
        const nextState = {
          ...prev,
          habits: { ...prev.habits, [newId]: newHabit },
          activeHabitId: newId,
          unlockedPets: Array.from(
            new Set([...prev.unlockedPets, assignedPet])
          ),
          isOnboarded: true,
        };
        const finalState = applyAchievements(nextState);
        if (user) {
          setPendingSync(true);
          markManualSync();
          setGameStateForUser(user.uid, finalState)
            .then(() => setPendingSync(false))
            .catch((e) => console.error('Firestore save failed', e));
        }
        return finalState;
      });
    },
    [user, markManualSync, setPendingSync, applyAchievements, setGameState]
  );

  const switchHabit = useCallback(
    (habitId: string) => {
      setGameState((prev) => {
        if (!prev.habits[habitId]) return prev;
        return { ...prev, activeHabitId: habitId };
      });
    },
    [setGameState]
  );

  const updateStampStyle = useCallback(
    (icon: string, color: string) => {
      setGameState((prev) => {
        if (!prev.activeHabitId) return prev;
        return {
          ...prev,
          habits: {
            ...prev.habits,
            [prev.activeHabitId]: {
              ...prev.habits[prev.activeHabitId],
              stampIcon: icon,
              stampColor: color,
            },
          },
        };
      });
    },
    [setGameState]
  );

  const updatePetNickname = useCallback(
    (habitId: string, petNickname: string) => {
      setGameState((prev) => {
        if (!prev.habits[habitId]) return prev;
        return {
          ...prev,
          habits: {
            ...prev.habits,
            [habitId]: {
              ...prev.habits[habitId],
              petNickname: petNickname.trim() || undefined,
            },
          },
        };
      });
    },
    [setGameState]
  );

  const renameHabit = useCallback(
    (habitId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      setGameState((prev) => {
        if (!prev.habits[habitId]) return prev;
        return {
          ...prev,
          habits: {
            ...prev.habits,
            [habitId]: { ...prev.habits[habitId], name: trimmed },
          },
        };
      });
    },
    [setGameState]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      setGameState((prev) => {
        const habitIds = Object.keys(prev.habits);
        if (habitIds.length <= 1) return prev;
        if (!prev.habits[habitId]) return prev;
        const nextHabits = { ...prev.habits };
        delete nextHabits[habitId];
        let nextActiveId = prev.activeHabitId;
        if (prev.activeHabitId === habitId) {
          const remaining = habitIds.filter((id) => id !== habitId);
          nextActiveId = remaining[0] ?? null;
        }
        const nextGoals = (prev.goals ?? []).filter(
          (g) => g.habitId !== habitId
        );
        const nextState: GameState = {
          ...prev,
          habits: nextHabits,
          activeHabitId: nextActiveId,
          goals: nextGoals,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // ignore
        }
        if (user) {
          setSyncStatus('syncing');
          setPendingSync(true);
          markManualSync();
          setGameStateForUser(user.uid, nextState)
            .then(() => {
              setPendingSync(false);
              setSyncStatus('synced');
              setTimeout(() => setSyncStatus('idle'), 2000);
            })
            .catch((e) => {
              console.error('Firestore save failed', e);
              setSyncStatus('error');
            });
        }
        return nextState;
      });
    },
    [
      user,
      markManualSync,
      setSyncStatus,
      setPendingSync,
      setGameState,
    ]
  );

  const setCalendarStyle = useCallback(
    (style: CalendarStyle) => {
      setGameState((prev) => ({ ...prev, calendarStyle: style }));
    },
    [setGameState]
  );

  const setSoundEffect = useCallback(
    (soundId: string) => {
      setGameState((prev) => ({ ...prev, selectedSound: soundId }));
    },
    [setGameState]
  );

  const addCustomStamp = useCallback(
    (stamp: CustomStamp) => {
      setGameState((prev) => {
        const customStamps = prev.customStamps || {};
        const nextState = {
          ...prev,
          customStamps: { ...customStamps, [stamp.id]: stamp },
        };
        if (user) {
          setPendingSync(true);
          markManualSync();
          setGameStateForUser(user.uid, nextState)
            .then(() => setPendingSync(false))
            .catch((e) => {
              console.error('Firestore save failed', e);
              setSyncStatus('error');
            });
        }
        return nextState;
      });
    },
    [
      user,
      markManualSync,
      setPendingSync,
      setSyncStatus,
      setGameState,
    ]
  );

  const deleteCustomStamp = useCallback(
    (stampId: string) => {
      setGameState((prev) => {
        const customStamps = prev.customStamps || {};
        if (!customStamps[stampId]) return prev;
        const stampToDelete = customStamps[stampId];
        const nextCustomStamps = { ...customStamps };
        delete nextCustomStamps[stampId];
        const customIconId = `custom:${stampId}`;
        const habitsUsingStamp = Object.values(prev.habits).filter(
          (h) => h.stampIcon === customIconId
        );
        const nextHabits = { ...prev.habits };
        if (habitsUsingStamp.length > 0) {
          habitsUsingStamp.forEach((habit) => {
            nextHabits[habit.id] = {
              ...habit,
              stampIcon: 'star',
            };
          });
        }
        const nextState: GameState = {
          ...prev,
          customStamps: nextCustomStamps,
          habits: nextHabits,
        };
        if (
          user &&
          stampToDelete.storageType === 'firebase' &&
          isStorageAvailable()
        ) {
          deleteCustomStampFromStorage(user.uid, stampId).catch((e) => {
            console.warn('Failed to delete stamp from Storage:', e);
          });
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // ignore
        }
        if (user) {
          setPendingSync(true);
          markManualSync();
          setGameStateForUser(user.uid, nextState)
            .then(() => {
              setPendingSync(false);
              setSyncStatus('synced');
              setTimeout(() => setSyncStatus('idle'), 2000);
            })
            .catch((e) => {
              console.error('Firestore save failed', e);
              setSyncStatus('error');
            });
        }
        return nextState;
      });
    },
    [
      user,
      markManualSync,
      setSyncStatus,
      setPendingSync,
      setGameState,
    ]
  );

  const stampToday = useCallback(
    (x?: number, y?: number, rotation?: number) => {
      const today = getTodayString();
      setGameState((prev) => {
        if (!prev.activeHabitId) return prev;
        const currentHabit = prev.habits[prev.activeHabitId];
        if (!currentHabit) return prev;
        if (currentHabit.logs[today]?.stamped) return prev;

        const newExp = currentHabit.totalExp + 10;
        const newLevel = calculateLevel(newExp);
        const newLogs = {
          ...currentHabit.logs,
          [today]: {
            date: today,
            stamped: true,
            timestamp: Date.now(),
            icon: currentHabit.stampIcon,
            color: currentHabit.stampColor,
            position:
              x !== undefined && y !== undefined && rotation !== undefined
                ? { x, y, rotation }
                : undefined,
          },
        };
        const newStreak = calculateStreak(newLogs, today);
        const newLongestStreak = Math.max(
          currentHabit.longestStreak,
          newStreak
        );
        const updatedHabit = {
          ...currentHabit,
          logs: newLogs,
          totalExp: newExp,
          currentLevel: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
        };
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyCount = getHabitMonthlyCount(
          updatedHabit,
          currentYear,
          currentMonth
        );
        const updatedUnlockedIcons = checkUnlockableIcons(
          updatedHabit,
          prev.unlockedIcons,
          monthlyCount
        );
        const baseCoin = 20;
        const multiplier = 1 + prev.retiredPets.length * 0.1;
        const earnedCoins = Math.floor(baseCoin * multiplier);
        const nextState = {
          ...prev,
          habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit,
          },
          unlockedIcons: updatedUnlockedIcons,
          coins: prev.coins + earnedCoins,
        };
        const finalState = applyAchievements(nextState);
        if (user) {
          setPendingSync(true);
          markManualSync();
          setGameStateForUser(user.uid, finalState)
            .then(() => setPendingSync(false))
            .catch((e) => console.error('Firestore save failed', e));
        }
        return finalState;
      });
    },
    [
      user,
      markManualSync,
      setPendingSync,
      applyAchievements,
      setGameState,
    ]
  );

  const debugStampDate = useCallback(
    (dateStr: string) => {
      setGameState((prev) => {
        if (!prev.activeHabitId) return prev;
        const currentHabit = prev.habits[prev.activeHabitId];
        if (currentHabit.logs[dateStr]?.stamped) return prev;
        const newExp = currentHabit.totalExp + 10;
        const newLevel = calculateLevel(newExp);
        const newLogs = {
          ...currentHabit.logs,
          [dateStr]: {
            date: dateStr,
            stamped: true,
            timestamp: Date.now(),
            icon: currentHabit.stampIcon,
            color: currentHabit.stampColor,
            position: {
              x: 50,
              y: 50,
              rotation: Math.random() * 30 - 15,
            },
          },
        };
        const today = getTodayString();
        const newStreak = calculateStreak(newLogs, today);
        const newLongestStreak = Math.max(
          currentHabit.longestStreak,
          newStreak
        );
        const updatedHabit = {
          ...currentHabit,
          logs: newLogs,
          totalExp: newExp,
          currentLevel: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
        };
        const d = new Date(dateStr);
        const monthlyCount = getHabitMonthlyCount(
          updatedHabit,
          d.getFullYear(),
          d.getMonth()
        );
        const updatedUnlockedIcons = checkUnlockableIcons(
          updatedHabit,
          prev.unlockedIcons,
          monthlyCount
        );
        const nextState = {
          ...prev,
          habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit,
          },
          unlockedIcons: updatedUnlockedIcons,
          coins: prev.coins + 20,
        };
        return applyAchievements(nextState);
      });
    },
    [applyAchievements, setGameState]
  );

  const debugStampRange = useCallback(
    (startDateStr: string, endDateStr: string) => {
      setGameState((prev) => {
        if (!prev.activeHabitId) return prev;
        const currentHabit = prev.habits[prev.activeHabitId];
        const newLogs = { ...currentHabit.logs };
        let addedExp = 0;
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        for (
          let d = new Date(start);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split('T')[0];
          if (!newLogs[dateStr]?.stamped) {
            newLogs[dateStr] = {
              date: dateStr,
              stamped: true,
              timestamp: Date.now(),
              icon: currentHabit.stampIcon,
              color: currentHabit.stampColor,
              position: {
                x: 50,
                y: 50,
                rotation: Math.random() * 30 - 15,
              },
            };
            addedExp += 10;
          }
        }
        if (addedExp === 0) return prev;
        const newExp = currentHabit.totalExp + addedExp;
        const newLevel = calculateLevel(newExp);
        const today = getTodayString();
        const newStreak = calculateStreak(newLogs, today);
        const newLongestStreak = Math.max(
          currentHabit.longestStreak,
          newStreak
        );
        const updatedHabit = {
          ...currentHabit,
          logs: newLogs,
          totalExp: newExp,
          currentLevel: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
        };
        const updatedUnlockedIcons = checkUnlockableIcons(
          updatedHabit,
          prev.unlockedIcons,
          0
        );
        const nextState = {
          ...prev,
          habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit,
          },
          unlockedIcons: updatedUnlockedIcons,
          coins: prev.coins + addedExp * 2,
        };
        return applyAchievements(nextState);
      });
    },
    [applyAchievements, setGameState]
  );

  const isTodayStamped = useCallback(() => {
    const today = getTodayString();
    if (!gameState.activeHabitId) return false;
    return !!gameState.habits[gameState.activeHabitId]?.logs[today]?.stamped;
  }, [gameState]);

  const getMonthlyCount = useCallback(
    (year: number, month: number) => {
      if (!gameState.activeHabitId) return 0;
      return getHabitMonthlyCount(
        gameState.habits[gameState.activeHabitId],
        year,
        month
      );
    },
    [gameState]
  );

  const resetProgress = useCallback(() => {
    if (
      confirm(
        '你確定要刪除所有資料嗎？所有的精靈與世界都將消失。'
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(OLD_STORAGE_KEY);
      setGameState(INITIAL_STATE);
      window.location.reload();
    }
  }, [setGameState]);

  const importSaveData = useCallback(
    (jsonData: string): boolean => {
      try {
        const parsed = JSON.parse(jsonData);
        if (!parsed.habits || !parsed.world) {
          alert('檔案格式錯誤：找不到必要的遊戲資料');
          return false;
        }
        const migrated = applyMigration(parsed as Record<string, unknown>);
        setGameState(migrated);
        alert('匯入成功！世界已更新。');
        return true;
      } catch (e) {
        console.error(e);
        alert('匯入失敗：檔案格式不正確');
        return false;
      }
    },
    [setGameState]
  );

  const addGoal = useCallback(
    (habitId: string, period: GoalPeriod, targetDays: number) => {
      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        habitId,
        period,
        targetDays,
        coinReward: calculateGoalReward(period, targetDays),
        createdAt: new Date().toISOString(),
      };
      setGameState((prev) => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal],
      }));
    },
    [setGameState]
  );

  const removeGoal = useCallback((goalId: string) => {
    setGameState((prev) => ({
      ...prev,
      goals: (prev.goals || []).filter((g) => g.id !== goalId),
    }));
  }, [setGameState]);

  const checkGoalCompletion = useCallback(
    (state: GameState): GameState => {
      const goals = state.goals || [];
      const completedGoals = state.completedGoals || [];
      let totalCoinsEarned = 0;
      const newCompletedGoals: CompletedGoal[] = [];
      for (const goal of goals) {
        const habit = state.habits[goal.habitId];
        if (!habit) continue;
        if (isGoalCompleted(goal, habit, completedGoals)) continue;
        const progress = getGoalProgress(goal, habit);
        if (progress.current >= progress.target) {
          const periodStart = getPeriodStart(goal.period);
          newCompletedGoals.push({
            goalId: goal.id,
            completedAt: new Date().toISOString(),
            periodStart: periodStart.toISOString().split('T')[0],
          });
          totalCoinsEarned += goal.coinReward;
        }
      }
      if (newCompletedGoals.length > 0) {
        playUnlockSound();
        return {
          ...state,
          completedGoals: [...completedGoals, ...newCompletedGoals],
          coins: state.coins + totalCoinsEarned,
        };
      }
      return state;
    },
    []
  );

  return {
    addHabit,
    switchHabit,
    updateStampStyle,
    setCalendarStyle,
    setSoundEffect,
    updatePetNickname,
    renameHabit,
    deleteHabit,
    addCustomStamp,
    deleteCustomStamp,
    stampToday,
    debugStampDate,
    debugStampRange,
    isTodayStamped,
    getMonthlyCount,
    resetProgress,
    importSaveData,
    addGoal,
    removeGoal,
    checkGoalCompletion,
  };
}
