import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../utils/achievementData';
import { GameState, Habit, RetiredPet } from '../types';

// Helper to create a minimal game state for testing
const createMockState = (overrides: Partial<GameState> = {}): GameState => ({
  habits: {},
  activeHabitId: null,
  unlockedPets: [],
  unlockedIcons: [],
  isOnboarded: false,
  coins: 0,
  inventory: [],
  world: {
    unlockedAreas: ['home'],
    areas: {},
  },
  retiredPets: [],
  calendarStyle: 'handdrawn',
  selectedSound: 'thud',
  unlockedAchievements: [],
  ...overrides,
});

describe('achievementData', () => {
  describe('Achievement definitions', () => {
    it('should have unique IDs', () => {
      const ids = ACHIEVEMENTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have positive reward coins', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.rewardCoins).toBeGreaterThan(0);
      });
    });

    it('should have valid condition functions', () => {
      const mockState = createMockState();
      ACHIEVEMENTS.forEach(achievement => {
        expect(typeof achievement.condition).toBe('function');
        // Should not throw
        expect(() => achievement.condition(mockState)).not.toThrow();
      });
    });
  });

  describe('Achievement conditions', () => {
    it('streak_3: should unlock at 3 day streak', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'streak_3')!;
      
      const noStreak = createMockState({
        habits: {
          h1: { longestStreak: 2 } as Partial<Habit> as Habit,
        },
      });
      expect(achievement.condition(noStreak)).toBe(false);

      const withStreak = createMockState({
        habits: {
          h1: { longestStreak: 3 } as Partial<Habit> as Habit,
        },
      });
      expect(achievement.condition(withStreak)).toBe(true);
    });

    it('wealth_100: should unlock at 100 coins', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'wealth_100')!;
      
      expect(achievement.condition(createMockState({ coins: 99 }))).toBe(false);
      expect(achievement.condition(createMockState({ coins: 100 }))).toBe(true);
      expect(achievement.condition(createMockState({ coins: 150 }))).toBe(true);
    });

    it('wealth_1000: should unlock at 1000 coins', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'wealth_1000')!;
      
      expect(achievement.condition(createMockState({ coins: 999 }))).toBe(false);
      expect(achievement.condition(createMockState({ coins: 1000 }))).toBe(true);
    });

    it('pet_collector_5: should unlock with 5 pets', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'pet_collector_5')!;
      
      expect(achievement.condition(createMockState({ 
        unlockedPets: ['a', 'b', 'c', 'd'] 
      }))).toBe(false);
      
      expect(achievement.condition(createMockState({ 
        unlockedPets: ['a', 'b', 'c', 'd', 'e'] 
      }))).toBe(true);
    });

    it('shopper_1: should unlock with first inventory item', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'shopper_1')!;
      
      expect(achievement.condition(createMockState({ inventory: [] }))).toBe(false);
      expect(achievement.condition(createMockState({ inventory: ['item1'] }))).toBe(true);
    });

    it('explorer_2: should unlock with 2 areas', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'explorer_2')!;
      
      expect(achievement.condition(createMockState({
        world: { unlockedAreas: ['home'], areas: {} },
      }))).toBe(false);
      
      expect(achievement.condition(createMockState({
        world: { unlockedAreas: ['home', 'forest'], areas: {} },
      }))).toBe(true);
    });

    it('legacy_1: should unlock with first retired pet', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'legacy_1')!;
      
      expect(achievement.condition(createMockState({ retiredPets: [] }))).toBe(false);
      expect(achievement.condition(createMockState({ 
        retiredPets: [{ id: 'r1' } as Partial<RetiredPet> as RetiredPet] 
      }))).toBe(true);
    });
  });
});
