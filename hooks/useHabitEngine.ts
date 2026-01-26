
import { useState, useEffect, useCallback } from 'react';
import { GameState, DayLog, Habit, PetColor, WorldState, PlacedItem, PlacedPet, PetStage } from '../types';
import { calculateLevel, calculateStreak } from '../utils/gameLogic';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet, getPetById } from '../utils/petData';
import { getDefaultUnlockedIcons } from '../utils/stampIcons';
import { INITIAL_AREAS, DECORATION_ITEMS } from '../utils/worldData';

const STORAGE_KEY = 'growday_save_v2'; 
const OLD_STORAGE_KEY = 'growday_save_v1';

const INITIAL_STATE: GameState = {
  habits: {},
  activeHabitId: null,
  unlockedPets: [],
  unlockedIcons: getDefaultUnlockedIcons(),
  isOnboarded: false,
  coins: 0,
  inventory: [],
  world: {
    unlockedAreas: ['home'],
    areas: JSON.parse(JSON.stringify(INITIAL_AREAS)) // Deep copy to avoid reference issues
  }
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

        // Ensure Phase 3 fields exist for existing users
        const updatedState = {
           ...INITIAL_STATE, // Start with defaults
           ...parsed,        // Overwrite with saved data
           habits: updatedHabits,
           // Explicitly merge world state if it exists partially or not at all
           world: parsed.world ? { ...INITIAL_STATE.world, ...parsed.world } : INITIAL_STATE.world
        };

        setGameState(updatedState);
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
          ...INITIAL_STATE,
          habits: { [newId]: migratedHabit },
          activeHabitId: newId,
          unlockedPets: [assignedPet],
          isOnboarded: true
        };

        setGameState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
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

  // Create a new habit
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
      activeHabitId: newId,
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

  // Helper to check for new unlocks
  const checkUnlockableIcons = (habit: Habit, currentUnlocked: string[], monthlyCount: number): string[] => {
    const newUnlocked = [...currentUnlocked];
    
    const tryUnlock = (id: string) => {
      if (!newUnlocked.includes(id)) newUnlocked.push(id);
    };

    if ((habit.totalExp / 10) >= 3) tryUnlock('feather');
    if (habit.currentStreak >= 3) tryUnlock('fire');
    if (habit.currentStreak >= 7) tryUnlock('zap');
    if (habit.currentStreak >= 30) tryUnlock('trophy');
    if (habit.currentStreak >= 100) tryUnlock('diamond');
    if (habit.currentLevel >= 10) tryUnlock('crown');
    if (monthlyCount >= 20) tryUnlock('anchor');

    return newUnlocked;
  };

  const getHabitMonthlyCount = (habit: Habit, year: number, month: number) => {
    let count = 0;
    Object.values(habit.logs).forEach((log: DayLog) => {
      const d = new Date(log.date);
      if (d.getFullYear() === year && d.getMonth() === month && log.stamped) {
        count++;
      }
    });
    return count;
  };

  const stampToday = useCallback(() => {
    const today = getTodayString();
    
    setGameState(prev => {
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
          icon: currentHabit.stampIcon
        }
      };

      const newStreak = calculateStreak(newLogs, today);
      const newLongestStreak = Math.max(currentHabit.longestStreak, newStreak);

      const updatedHabit = {
        ...currentHabit,
        logs: newLogs,
        totalExp: newExp,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak
      };

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyCount = getHabitMonthlyCount(updatedHabit, currentYear, currentMonth);
      const updatedUnlockedIcons = checkUnlockableIcons(updatedHabit, prev.unlockedIcons, monthlyCount);

      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit
        },
        unlockedIcons: updatedUnlockedIcons,
        coins: prev.coins + 20 // Earn 20 coins per stamp
      };
    });
  }, []);

  // --- Phase 3 Actions ---

  const buyDecoration = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = DECORATION_ITEMS.find(i => i.id === itemId);
      if (!item || prev.coins < item.price) return prev;

      return {
        ...prev,
        coins: prev.coins - item.price,
        inventory: [...prev.inventory, itemId]
      };
    });
  }, []);

  const placeDecoration = useCallback((areaId: string, itemId: string) => {
    setGameState(prev => {
      const area = prev.world.areas[areaId];
      if (!area) return prev;

      // Simple random placement for MVP or fixed slots. Let's do random coordinates 10-90%
      const newPlacedItem: PlacedItem = {
        id: Date.now().toString(),
        itemId,
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 40) + 40 // Keep them somewhat on the ground
      };

      return {
        ...prev,
        world: {
          ...prev.world,
          areas: {
            ...prev.world.areas,
            [areaId]: {
              ...area,
              placedItems: [...area.placedItems, newPlacedItem]
            }
          }
        }
      };
    });
  }, []);

  const removeDecoration = useCallback((areaId: string, instanceId: string) => {
    setGameState(prev => {
      const area = prev.world.areas[areaId];
      if (!area) return prev;

      return {
        ...prev,
        world: {
          ...prev.world,
          areas: {
            ...prev.world.areas,
            [areaId]: {
              ...area,
              placedItems: area.placedItems.filter(i => i.id !== instanceId)
            }
          }
        }
      };
    });
  }, []);

  const placePetInArea = useCallback((areaId: string, petId: string, stage: PetStage) => {
    setGameState(prev => {
        const area = prev.world.areas[areaId];
        if (!area) return prev;

        const newPlacedPet: PlacedPet = {
            id: Date.now().toString(),
            petId,
            stage,
            x: Math.floor(Math.random() * 80) + 10
        };

        return {
            ...prev,
            world: {
                ...prev.world,
                areas: {
                    ...prev.world.areas,
                    [areaId]: {
                        ...area,
                        placedPets: [...area.placedPets, newPlacedPet]
                    }
                }
            }
        };
    });
  }, []);

  const removePetFromArea = useCallback((areaId: string, instanceId: string) => {
     setGameState(prev => {
        const area = prev.world.areas[areaId];
        if (!area) return prev;
        
        return {
            ...prev,
            world: {
                ...prev.world,
                areas: {
                    ...prev.world.areas,
                    [areaId]: {
                        ...area,
                        placedPets: area.placedPets.filter(p => p.id !== instanceId)
                    }
                }
            }
        };
     });
  }, []);

  const unlockArea = useCallback((areaId: string) => {
    setGameState(prev => {
       const area = INITIAL_AREAS[areaId];
       if (!area || prev.coins < area.unlockCost) return prev;
       
       return {
          ...prev,
          coins: prev.coins - area.unlockCost,
          world: {
             ...prev.world,
             unlockedAreas: [...prev.world.unlockedAreas, areaId]
          }
       };
    });
  }, []);

  // -----------------------

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

      const updatedHabit = {
          ...currentHabit,
          logs: newLogs,
          totalExp: newExp,
          currentLevel: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak
      };

      const d = new Date(dateStr);
      const monthlyCount = getHabitMonthlyCount(updatedHabit, d.getFullYear(), d.getMonth());
      const updatedUnlockedIcons = checkUnlockableIcons(updatedHabit, prev.unlockedIcons, monthlyCount);

      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit
        },
        unlockedIcons: updatedUnlockedIcons,
        coins: prev.coins + 20
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

      const updatedHabit = {
          ...currentHabit,
          logs: newLogs,
          totalExp: newExp,
          currentLevel: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak
      };

      const updatedUnlockedIcons = checkUnlockableIcons(updatedHabit, prev.unlockedIcons, 0); 

      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit
        },
        unlockedIcons: updatedUnlockedIcons,
        coins: prev.coins + (addedExp * 2) // 20 coins per stamp
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
    return getHabitMonthlyCount(gameState.habits[gameState.activeHabitId], year, month);
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
    resetProgress,
    // Phase 3
    buyDecoration,
    placeDecoration,
    removeDecoration,
    placePetInArea,
    removePetFromArea,
    unlockArea
  };
};
