import { describe, it, expect } from 'vitest';
import { calculateLevel, calculateStreak, getStageConfig, STAGE_THRESHOLDS } from '../utils/gameLogic';
import { PetStage, DayLog } from '../types';

describe('gameLogic', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 exp', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 2 for 10 exp', () => {
      expect(calculateLevel(10)).toBe(2);
    });

    it('should calculate level correctly (1 level per 10 exp)', () => {
      expect(calculateLevel(50)).toBe(6);
      expect(calculateLevel(99)).toBe(10);
      expect(calculateLevel(100)).toBe(11);
      expect(calculateLevel(290)).toBe(30);
    });

    it('should handle large exp values', () => {
      expect(calculateLevel(1000)).toBe(101);
    });
  });

  describe('calculateStreak', () => {
    const createLog = (date: string): DayLog => ({
      date,
      stamped: true,
      timestamp: Date.now(),
    });

    it('should return 0 for empty logs', () => {
      expect(calculateStreak({}, '2024-03-15')).toBe(0);
    });

    it('should return 1 when only today is stamped', () => {
      const logs = {
        '2024-03-15': createLog('2024-03-15'),
      };
      expect(calculateStreak(logs, '2024-03-15')).toBe(1);
    });

    it('should count consecutive days correctly', () => {
      const logs = {
        '2024-03-15': createLog('2024-03-15'),
        '2024-03-14': createLog('2024-03-14'),
        '2024-03-13': createLog('2024-03-13'),
      };
      expect(calculateStreak(logs, '2024-03-15')).toBe(3);
    });

    it('should break streak on missing day', () => {
      const logs = {
        '2024-03-15': createLog('2024-03-15'),
        '2024-03-14': createLog('2024-03-14'),
        // 2024-03-13 missing
        '2024-03-12': createLog('2024-03-12'),
      };
      expect(calculateStreak(logs, '2024-03-15')).toBe(2);
    });

    it('should count from yesterday if today not stamped', () => {
      const logs = {
        '2024-03-14': createLog('2024-03-14'),
        '2024-03-13': createLog('2024-03-13'),
        '2024-03-12': createLog('2024-03-12'),
      };
      expect(calculateStreak(logs, '2024-03-15')).toBe(3);
    });

    it('should handle month boundaries', () => {
      const logs = {
        '2024-03-01': createLog('2024-03-01'),
        '2024-02-29': createLog('2024-02-29'), // Leap year
        '2024-02-28': createLog('2024-02-28'),
      };
      expect(calculateStreak(logs, '2024-03-01')).toBe(3);
    });

    it('should handle year boundaries', () => {
      const logs = {
        '2024-01-01': createLog('2024-01-01'),
        '2023-12-31': createLog('2023-12-31'),
        '2023-12-30': createLog('2023-12-30'),
      };
      expect(calculateStreak(logs, '2024-01-01')).toBe(3);
    });
  });

  describe('STAGE_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(STAGE_THRESHOLDS.BABY).toBe(6);
      expect(STAGE_THRESHOLDS.CHILD).toBe(16);
      expect(STAGE_THRESHOLDS.ADULT).toBe(30);
    });
  });

  describe('getStageConfig', () => {
    it('should return EGG stage for levels 1-5', () => {
      expect(getStageConfig(1, 'green').stage).toBe(PetStage.EGG);
      expect(getStageConfig(5, 'green').stage).toBe(PetStage.EGG);
    });

    it('should return BABY stage for levels 6-15', () => {
      expect(getStageConfig(6, 'green').stage).toBe(PetStage.BABY);
      expect(getStageConfig(15, 'green').stage).toBe(PetStage.BABY);
    });

    it('should return CHILD stage for levels 16-29', () => {
      expect(getStageConfig(16, 'green').stage).toBe(PetStage.CHILD);
      expect(getStageConfig(29, 'green').stage).toBe(PetStage.CHILD);
    });

    it('should return ADULT stage for levels 30+', () => {
      expect(getStageConfig(30, 'green').stage).toBe(PetStage.ADULT);
      expect(getStageConfig(100, 'green').stage).toBe(PetStage.ADULT);
    });

    it('should include correct labels for each stage', () => {
      expect(getStageConfig(1, 'green').label).toBe('孵化期');
      expect(getStageConfig(6, 'green').label).toBe('幼年期');
      expect(getStageConfig(16, 'green').label).toBe('成長期');
      expect(getStageConfig(30, 'green').label).toBe('完全體');
    });
  });
});
