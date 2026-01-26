import { useState, useEffect, useCallback } from 'react';
import { GameState, DayLog } from '../types';
import { calculateLevel, calculateStreak } from '../utils/gameLogic';
import { getTodayString } from '../utils/dateUtils';

const STORAGE_KEY = 'growday_save_v1';

const INITIAL_STATE: GameState = {
  habitName: '',
  startDate: getTodayString(),
  logs: {},
  totalExp: 0,
  currentLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  isOnboarded: false,
};

export const useHabitEngine = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recalculate streak on load to ensure accuracy with passing time
        const today = getTodayString();
        const currentStreak = calculateStreak(parsed.logs, today);
        
        setGameState({
          ...parsed,
          currentStreak,
        });
      } catch (e) {
        console.error("Failed to load save", e);
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

  const setHabitName = useCallback((name: string) => {
    setGameState(prev => ({
      ...prev,
      habitName: name,
      isOnboarded: true
    }));
  }, []);

  const stampToday = useCallback(() => {
    const today = getTodayString();
    
    setGameState(prev => {
      // Prevent double stamping
      if (prev.logs[today]?.stamped) return prev;

      const newExp = prev.totalExp + 10; // 10 EXP per stamp
      const newLevel = calculateLevel(newExp);
      
      const newLogs = {
        ...prev.logs,
        [today]: {
          date: today,
          stamped: true,
          timestamp: Date.now()
        }
      };

      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(prev.longestStreak, newStreak);

      return {
        ...prev,
        logs: newLogs,
        totalExp: newExp,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak
      };
    });
  }, []);

  // Debug function to stamp any specific date
  const debugStampDate = useCallback((dateStr: string) => {
    setGameState(prev => {
      // If already stamped, do nothing
      if (prev.logs[dateStr]?.stamped) return prev;

      const newExp = prev.totalExp + 10;
      const newLevel = calculateLevel(newExp);
      
      const newLogs = {
        ...prev.logs,
        [dateStr]: {
          date: dateStr,
          stamped: true,
          timestamp: Date.now()
        }
      };

      // We still calculate streak relative to "Real Today"
      const today = getTodayString();
      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(prev.longestStreak, newStreak);

      return {
        ...prev,
        logs: newLogs,
        totalExp: newExp,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak
      };
    });
  }, []);

  // Debug function to stamp a range of dates
  const debugStampRange = useCallback((startDateStr: string, endDateStr: string) => {
    setGameState(prev => {
      const newLogs = { ...prev.logs };
      let addedExp = 0;
      
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      
      // Loop from start to end
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Only stamp if not already stamped
        if (!newLogs[dateStr]?.stamped) {
          newLogs[dateStr] = {
            date: dateStr,
            stamped: true,
            timestamp: Date.now()
          };
          addedExp += 10;
        }
      }

      if (addedExp === 0) return prev; // No changes made

      const newExp = prev.totalExp + addedExp;
      const newLevel = calculateLevel(newExp);
      
      const today = getTodayString();
      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(prev.longestStreak, newStreak);

      return {
        ...prev,
        logs: newLogs,
        totalExp: newExp,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak
      };
    });
  }, []);

  const isTodayStamped = useCallback(() => {
    const today = getTodayString();
    return !!gameState.logs[today]?.stamped;
  }, [gameState.logs]);

  // Count stamped days in the current month (for stats)
  const getMonthlyCount = useCallback((year: number, month: number) => {
    let count = 0;
    Object.values(gameState.logs).forEach((log: DayLog) => {
      const d = new Date(log.date);
      if (d.getFullYear() === year && d.getMonth() === month && log.stamped) {
        count++;
      }
    });
    return count;
  }, [gameState.logs]);

  const resetProgress = useCallback(() => {
      if(confirm("你確定要刪除你的世界嗎？此操作無法復原，你的夥伴將會消失。")){
          localStorage.removeItem(STORAGE_KEY);
          setGameState(INITIAL_STATE);
          window.location.reload();
      }
  }, []);

  return {
    gameState,
    isLoaded,
    setHabitName,
    stampToday,
    debugStampDate,
    debugStampRange,
    isTodayStamped,
    getMonthlyCount,
    resetProgress
  };
};
