
import { useState, useEffect, useCallback } from 'react';
import { GameState, DayLog, Habit, PetColor } from '../types';
import { calculateLevel, calculateStreak } from '../utils/gameLogic';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet } from '../utils/petData';

const STORAGE_KEY = 'growday_save_v2'; // Changed version to v2
const OLD_STORAGE_KEY = 'growday_save_v1';

const INITIAL_STATE: GameState = {
  habits: {},
  activeHabitId: null,
  unlockedPets: [],
  isOnboarded: false,
};

export const useHabitEngine = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    // 1. Try loading V2
    const savedV2 = localStorage.getItem(STORAGE_KEY);
    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2);
        
        // Recalculate streaks for all habits
        const today = getTodayString();
        const updatedHabits = { ...parsed.habits };
        
        Object.keys(updatedHabits).forEach(key => {
          const habit = updatedHabits[key];
          habit.currentStreak = calculateStreak(habit.logs, today);
        });

        setGameState({
          ...parsed,
          habits: updatedHabits
        });
        setIsLoaded(true);
        return;
      } catch (e) {
        console.error("Failed to load V2 save", e);
      }
    }

    // 2. If V2 not found, check for V1 (Migration)
    const savedV1 = localStorage.getItem(OLD_STORAGE_KEY);
    if (savedV1) {
      try {
        const parsedV1 = JSON.parse(savedV1);
        console.log("Migrating from V1 to V2...");
        
        const newId = 'habit_' + Date.now();
        const defaultColor: PetColor = 'green';
        const assignedPet = assignRandomPet(defaultColor);

        // Convert V1 root state to a Habit object
        const migratedHabit: Habit = {
          id: newId,
          name: parsedV1.habitName || '我的習慣',
          stampIcon: parsedV1.stampIcon || 'star',
          petColor: defaultColor,
          petId: assignedPet,
          startDate: parsedV1.startDate || getTodayString(),
          logs: parsedV1.logs || {},
          totalExp: parsedV1.totalExp || 0,
          currentLevel: parsedV1.currentLevel || 1,
          currentStreak: parsedV1.currentStreak || 0,
          longestStreak: parsedV1.longestStreak || 0
        };

        const newState: GameState = {
          habits: { [newId]: migratedHabit },
          activeHabitId: newId,
          unlockedPets: [assignedPet],
          isOnboarded: true
        };

        setGameState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        // Optional: localStorage.removeItem(OLD_STORAGE_KEY); 
      } catch (e) {
        console.error("Failed to migrate V1 save", e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  // Create a new habit (used in onboarding or adding new goals)
  const addHabit = useCallback((name: string, icon: string, color: PetColor) => {
    const newId = 'habit_' + Date.now();
    const assignedPet = assignRandomPet(color);
    const today = getTodayString();

    const newHabit: Habit = {
      id: newId,
      name,
      stampIcon: icon,
      petColor: color,
      petId: assignedPet,
      startDate: today,
      logs: {},
      totalExp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0
    };

    setGameState(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [newId]: newHabit
      },
      activeHabitId: newId, // Switch to new habit immediately
      unlockedPets: Array.from(new Set([...prev.unlockedPets, assignedPet])),
      isOnboarded: true
    }));
  }, []);

  const switchHabit = useCallback((habitId: string) => {
    setGameState(prev => {
        if (!prev.habits[habitId]) return prev;
        return {
            ...prev,
            activeHabitId: habitId
        };
    });
  }, []);

  const updateStampIcon = useCallback((icon: string) => {
    setGameState(prev => {
      if (!prev.activeHabitId) return prev;
      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: {
                ...prev.habits[prev.activeHabitId],
                stampIcon: icon
            }
        }
      };
    });
  }, []);

  const stampToday = useCallback(() => {
    const today = getTodayString();
    
    setGameState(prev => {
      if (!prev.activeHabitId) return prev;
      
      const currentHabit = prev.habits[prev.activeHabitId];
      if (!currentHabit) return prev;

      // Prevent double stamping
      if (currentHabit.logs[today]?.stamped) return prev;

      const newExp = currentHabit.totalExp + 10;
      const newLevel = calculateLevel(newExp);
      
      const newLogs = {
        ...currentHabit.logs,
        [today]: {
          date: today,
          stamped: true,
          timestamp: Date.now(),
          icon: currentHabit.stampIcon
        }
      };

      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(currentHabit.longestStreak, newStreak);

      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: {
                ...currentHabit,
                logs: newLogs,
                totalExp: newExp,
                currentLevel: newLevel,
                currentStreak: newStreak,
                longestStreak: newLongestStreak
            }
        }
      };
    });
  }, []);

  // Debug functions modified to target active habit
  const debugStampDate = useCallback((dateStr: string) => {
    setGameState(prev => {
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
          icon: currentHabit.stampIcon
        }
      };

      const today = getTodayString();
      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(currentHabit.longestStreak, newStreak);

      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: {
                ...currentHabit,
                logs: newLogs,
                totalExp: newExp,
                currentLevel: newLevel,
                currentStreak: newStreak,
                longestStreak: newLongestStreak
            }
        }
      };
    });
  }, []);

  const debugStampRange = useCallback((startDateStr: string, endDateStr: string) => {
    setGameState(prev => {
      if (!prev.activeHabitId) return prev;
      const currentHabit = prev.habits[prev.activeHabitId];

      const newLogs = { ...currentHabit.logs };
      let addedExp = 0;
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!newLogs[dateStr]?.stamped) {
          newLogs[dateStr] = {
            date: dateStr,
            stamped: true,
            timestamp: Date.now(),
            icon: currentHabit.stampIcon
          };
          addedExp += 10;
        }
      }

      if (addedExp === 0) return prev;

      const newExp = currentHabit.totalExp + addedExp;
      const newLevel = calculateLevel(newExp);
      
      const today = getTodayString();
      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(currentHabit.longestStreak, newStreak);

      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: {
                ...currentHabit,
                logs: newLogs,
                totalExp: newExp,
                currentLevel: newLevel,
                currentStreak: newStreak,
                longestStreak: newLongestStreak
            }
        }
      };
    });
  }, []);

  const isTodayStamped = useCallback(() => {
    const today = getTodayString();
    if (!gameState.activeHabitId) return false;
    return !!gameState.habits[gameState.activeHabitId]?.logs[today]?.stamped;
  }, [gameState]);

  const getMonthlyCount = useCallback((year: number, month: number) => {
    if (!gameState.activeHabitId) return 0;
    const currentHabit = gameState.habits[gameState.activeHabitId];
    
    let count = 0;
    Object.values(currentHabit.logs).forEach((log: DayLog) => {
      const d = new Date(log.date);
      if (d.getFullYear() === year && d.getMonth() === month && log.stamped) {
        count++;
      }
    });
    return count;
  }, [gameState]);

  const resetProgress = useCallback(() => {
      if(confirm("你確定要刪除所有資料嗎？所有的精靈與世界都將消失。")){
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(OLD_STORAGE_KEY);
          setGameState(INITIAL_STATE);
          window.location.reload();
      }
  }, []);

  return {
    gameState,
    activeHabit: gameState.activeHabitId ? gameState.habits[gameState.activeHabitId] : null,
    isLoaded,
    addHabit,
    switchHabit,
    updateStampIcon,
    stampToday,
    debugStampDate,
    debugStampRange,
    isTodayStamped,
    getMonthlyCount,
    resetProgress
  };
};
