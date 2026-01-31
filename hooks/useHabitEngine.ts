
import { useState, useEffect, useCallback } from 'react';
import { GameState, DayLog, Habit, PetColor, PlacedItem, PlacedPet, PetStage, RetiredPet, CalendarStyle, Goal, GoalPeriod, CompletedGoal } from '../types';
import { calculateLevel, calculateStreak, STAGE_THRESHOLDS } from '../utils/gameLogic';
import { getTodayString } from '../utils/dateUtils';
import { assignRandomPet } from '../utils/petData';
import { getDefaultUnlockedIcons, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { INITIAL_AREAS, DECORATION_ITEMS } from '../utils/worldData';
import { playUnlockSound } from '../utils/audio';
import { ACHIEVEMENTS, AchievementDef } from '../utils/achievementData';
import { calculateGoalReward, getGoalProgress, getPeriodStart, isGoalCompleted } from '../utils/goalLogic';

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
  },
  retiredPets: [],
  calendarStyle: 'handdrawn', // Default to the warm style
  selectedSound: 'thud', // Default sound
  unlockedAchievements: []
};

// Helper to calculate monthly count
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

// Helper to check for new unlocks
const checkUnlockableIcons = (habit: Habit, currentUnlocked: string[], monthlyCount: number): string[] => {
  const newUnlocked = [...currentUnlocked];
  
  const tryUnlock = (id: string) => {
    if (!newUnlocked.includes(id)) newUnlocked.push(id);
  };

  // Experience Unlocks
  if ((habit.totalExp / 10) >= 3) tryUnlock('feather');
  if (habit.currentLevel >= 10) tryUnlock('crown');

  // Streak Unlocks
  if (habit.currentStreak >= 3) tryUnlock('fire');
  if (habit.currentStreak >= 7) tryUnlock('zap');    // 7-day streak unlocks Zap icon
  if (habit.currentStreak >= 30) tryUnlock('trophy');
  if (habit.currentStreak >= 100) tryUnlock('diamond');

  // Frequency Unlocks
  if (monthlyCount >= 20) tryUnlock('anchor');

  return newUnlocked;
};

export const useHabitEngine = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Queue for displaying achievement toasts
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<AchievementDef[]>([]);

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
        let loadedUnlockedIcons = parsed.unlockedIcons || getDefaultUnlockedIcons();
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        Object.keys(updatedHabits).forEach(key => {
          const habit = updatedHabits[key];
          habit.currentStreak = calculateStreak(habit.logs, today);
          
          // Ensure stampColor exists (Migration)
          if (!habit.stampColor) {
              habit.stampColor = DEFAULT_STAMP_COLOR;
          }
          // Ensure generation exists (Migration)
          if (typeof habit.generation !== 'number') {
              habit.generation = 1;
          }

          // Check for retroactive unlocks based on recalculated streaks
          const monthlyCount = getHabitMonthlyCount(habit, currentYear, currentMonth);
          loadedUnlockedIcons = checkUnlockableIcons(habit, loadedUnlockedIcons, monthlyCount);
        });

        // Ensure new fields exist for existing users (Phase 3 & 4 & 5 & 6)
        const updatedState = {
           ...INITIAL_STATE, // Start with defaults
           ...parsed,        // Overwrite with saved data
           habits: updatedHabits,
           unlockedIcons: loadedUnlockedIcons,
           world: parsed.world ? { ...INITIAL_STATE.world, ...parsed.world } : INITIAL_STATE.world,
           retiredPets: parsed.retiredPets || [],
           calendarStyle: parsed.calendarStyle || 'handdrawn',
           selectedSound: parsed.selectedSound || 'thud',
           unlockedAchievements: parsed.unlockedAchievements || []
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary for initial load from localStorage
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
        // V1 to V2 migration - logged for debugging purposes
        // eslint-disable-next-line no-console
        console.log("Migrating from V1 to V2...");
        
        const newId = 'habit_' + Date.now();
        const defaultColor: PetColor = 'green';
        const assignedPet = assignRandomPet(defaultColor);

        // Convert V1 root state to a Habit object
        const migratedHabit: Habit = {
          id: newId,
          name: parsedV1.habitName || '我的習慣',
          stampIcon: parsedV1.stampIcon || 'star',
          stampColor: DEFAULT_STAMP_COLOR,
          petColor: defaultColor,
          petId: assignedPet,
          startDate: parsedV1.startDate || getTodayString(),
          logs: parsedV1.logs || {},
          totalExp: parsedV1.totalExp || 0,
          currentLevel: parsedV1.currentLevel || 1,
          currentStreak: parsedV1.currentStreak || 0,
          longestStreak: parsedV1.longestStreak || 0,
          generation: 1
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

  // --- Logic: Process Achievements ---
  const processAchievements = (currentState: GameState): GameState => {
      const newUnlockedIds: string[] = [];
      const unlockedDefs: AchievementDef[] = [];
      let bonusCoins = 0;

      ACHIEVEMENTS.forEach(achievement => {
          if (!currentState.unlockedAchievements.includes(achievement.id)) {
              if (achievement.condition(currentState)) {
                  newUnlockedIds.push(achievement.id);
                  unlockedDefs.push(achievement);
                  bonusCoins += achievement.rewardCoins;
              }
          }
      });

      if (newUnlockedIds.length > 0) {
          playUnlockSound();
          setNewlyUnlockedAchievements(prev => [...prev, ...unlockedDefs]);
          
          return {
              ...currentState,
              unlockedAchievements: [...currentState.unlockedAchievements, ...newUnlockedIds],
              coins: currentState.coins + bonusCoins
          };
      }
      
      return currentState;
  };

  // Create a new habit
  const addHabit = useCallback((name: string, icon: string, color: PetColor, stampColor: string = DEFAULT_STAMP_COLOR) => {
    const newId = 'habit_' + Date.now();
    const assignedPet = assignRandomPet(color);
    const today = getTodayString();

    const newHabit: Habit = {
      id: newId,
      name,
      stampIcon: icon,
      stampColor: stampColor,
      petColor: color,
      petId: assignedPet,
      startDate: today,
      logs: {},
      totalExp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      generation: 1
    };

    setGameState(prev => {
        const nextState = {
          ...prev,
          habits: {
            ...prev.habits,
            [newId]: newHabit
          },
          activeHabitId: newId,
          unlockedPets: Array.from(new Set([...prev.unlockedPets, assignedPet])),
          isOnboarded: true
        };
        return processAchievements(nextState);
    });
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

  const updateStampStyle = useCallback((icon: string, color: string) => {
    setGameState(prev => {
      if (!prev.activeHabitId) return prev;
      return {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: {
                ...prev.habits[prev.activeHabitId],
                stampIcon: icon,
                stampColor: color
            }
        }
      };
    });
  }, []);

  const setCalendarStyle = useCallback((style: CalendarStyle) => {
      setGameState(prev => ({
          ...prev,
          calendarStyle: style
      }));
  }, []);

  const setSoundEffect = useCallback((soundId: string) => {
      setGameState(prev => ({
          ...prev,
          selectedSound: soundId
      }));
  }, []);

  const stampToday = useCallback((x?: number, y?: number, rotation?: number) => {
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
          icon: currentHabit.stampIcon,
          color: currentHabit.stampColor,
          position: (x !== undefined && y !== undefined && rotation !== undefined) ? { x, y, rotation } : undefined
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

      // --- Coin Calculation with Legacy Bonus ---
      const baseCoin = 20;
      // 10% bonus per retired pet
      const multiplier = 1 + (prev.retiredPets.length * 0.1); 
      const earnedCoins = Math.floor(baseCoin * multiplier);

      const nextState = {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit
        },
        unlockedIcons: updatedUnlockedIcons,
        coins: prev.coins + earnedCoins
      };

      return processAchievements(nextState);
    });
  }, []);

  // --- Phase 4: Legacy / Retirement ---

  const retireHabit = useCallback((habitId: string) => {
      setGameState(prev => {
          const habit = prev.habits[habitId];
          if (!habit || habit.currentLevel < STAGE_THRESHOLDS.ADULT) return prev;

          const today = getTodayString();

          // 1. Create Retired Record
          const retiredPet: RetiredPet = {
              id: `retired_${Date.now()}`,
              originalHabitId: habit.id,
              petId: habit.petId,
              name: habit.name,
              retiredDate: today,
              generation: habit.generation || 1,
              bonusMultiplier: 0.1 // 10% bonus
          };

          // 2. Generate New Pet (Same Color Pool)
          const newPetId = assignRandomPet(habit.petColor);

          // 3. Reset Habit Stats (But keep logs and streaks!)
          // We reset Level and EXP.
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
              habits: {
                  ...prev.habits,
                  [habitId]: newHabit
              },
              retiredPets: [...prev.retiredPets, retiredPet],
              // Add the new pet to compendium if not already there
              unlockedPets: prev.unlockedPets.includes(newPetId) 
                  ? prev.unlockedPets 
                  : [...prev.unlockedPets, newPetId]
          };

          return processAchievements(nextState);
      });
  }, []);

  // --- Phase 3 Actions ---

  const buyDecoration = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = DECORATION_ITEMS.find(i => i.id === itemId);
      if (!item || prev.coins < item.price) return prev;

      const nextState = {
        ...prev,
        coins: prev.coins - item.price,
        inventory: [...prev.inventory, itemId]
      };
      
      return processAchievements(nextState);
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
       
       const nextState = {
          ...prev,
          coins: prev.coins - area.unlockCost,
          world: {
             ...prev.world,
             unlockedAreas: [...prev.world.unlockedAreas, areaId]
          }
       };

       return processAchievements(nextState);
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
          icon: currentHabit.stampIcon,
          color: currentHabit.stampColor,
          // Debug stamps use default center position
          position: { x: 50, y: 50, rotation: (Math.random() * 30 - 15) } 
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

      const nextState = {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit
        },
        unlockedIcons: updatedUnlockedIcons,
        coins: prev.coins + 20
      };

      return processAchievements(nextState);
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
            icon: currentHabit.stampIcon,
            color: currentHabit.stampColor,
            position: { x: 50, y: 50, rotation: (Math.random() * 30 - 15) }
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

      const nextState = {
        ...prev,
        habits: {
            ...prev.habits,
            [prev.activeHabitId]: updatedHabit
        },
        unlockedIcons: updatedUnlockedIcons,
        coins: prev.coins + (addedExp * 2) // 20 coins per stamp
      };

      return processAchievements(nextState);
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

  const importSaveData = useCallback((jsonData: string) => {
    try {
        const parsed = JSON.parse(jsonData);
        // Basic validation
        if (!parsed.habits || !parsed.world) {
            alert('檔案格式錯誤：找不到必要的遊戲資料');
            return false;
        }

        // Apply
        setGameState(parsed);
        alert('匯入成功！世界已更新。');
        return true;
    } catch (e) {
        console.error(e);
        alert('匯入失敗：檔案格式不正確');
        return false;
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
      setNewlyUnlockedAchievements(prev => prev.filter(a => a.id !== id));
  }, []);

  // --- Goal Management ---
  const addGoal = useCallback((habitId: string, period: GoalPeriod, targetDays: number) => {
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      habitId,
      period,
      targetDays,
      coinReward: calculateGoalReward(period, targetDays),
      createdAt: new Date().toISOString(),
    };

    setGameState(prev => ({
      ...prev,
      goals: [...(prev.goals || []), newGoal],
    }));
  }, []);

  const removeGoal = useCallback((goalId: string) => {
    setGameState(prev => ({
      ...prev,
      goals: (prev.goals || []).filter(g => g.id !== goalId),
    }));
  }, []);

  // Check and complete goals
  const checkGoalCompletion = useCallback((state: GameState): GameState => {
    const goals = state.goals || [];
    const completedGoals = state.completedGoals || [];
    let totalCoinsEarned = 0;
    const newCompletedGoals: CompletedGoal[] = [];

    for (const goal of goals) {
      const habit = state.habits[goal.habitId];
      if (!habit) continue;

      // Check if already completed this period
      if (isGoalCompleted(goal, habit, completedGoals)) continue;

      // Check if goal is met
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
  }, []);

  return {
    gameState,
    activeHabit: gameState.activeHabitId ? gameState.habits[gameState.activeHabitId] : null,
    isLoaded,
    addHabit,
    switchHabit,
    updateStampStyle,
    setCalendarStyle,
    setSoundEffect, // Exported setter
    stampToday,
    debugStampDate,
    debugStampRange,
    isTodayStamped,
    getMonthlyCount,
    resetProgress,
    importSaveData, 
    // Phase 3
    buyDecoration,
    placeDecoration,
    removeDecoration,
    placePetInArea,
    removePetFromArea,
    unlockArea,
    // Phase 4
    retireHabit,
    // Phase 6
    newlyUnlockedAchievements,
    dismissToast,
    // Phase 7: Goals
    addGoal,
    removeGoal,
    checkGoalCompletion,
  };
};
