import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayString, getCalendarDays, formatMonthYear } from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('getTodayString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2024-03-15'));
      expect(getTodayString()).toBe('2024-03-15');
    });

    it('should pad single digit months and days', () => {
      vi.setSystemTime(new Date('2024-01-05'));
      expect(getTodayString()).toBe('2024-01-05');
    });

    it('should handle end of year', () => {
      vi.setSystemTime(new Date('2024-12-31'));
      expect(getTodayString()).toBe('2024-12-31');
    });
  });

  describe('getCalendarDays', () => {
    it('should return correct number of days for a month', () => {
      // March 2024 has 31 days
      const days = getCalendarDays(2024, 2); // month is 0-indexed
      const actualDays = days.filter(d => d !== null);
      expect(actualDays.length).toBe(31);
    });

    it('should handle February in leap year', () => {
      // 2024 is a leap year
      const days = getCalendarDays(2024, 1); // February
      const actualDays = days.filter(d => d !== null);
      expect(actualDays.length).toBe(29);
    });

    it('should handle February in non-leap year', () => {
      // 2023 is not a leap year
      const days = getCalendarDays(2023, 1); // February
      const actualDays = days.filter(d => d !== null);
      expect(actualDays.length).toBe(28);
    });

    it('should add padding nulls for days before first of month', () => {
      // January 2024 starts on Monday (day index 1)
      const days = getCalendarDays(2024, 0);
      expect(days[0]).toBe(null); // Sunday
      expect(days[1]).toBe('2024-01-01'); // Monday
    });

    it('should format dates correctly', () => {
      const days = getCalendarDays(2024, 0);
      const firstDay = days.find(d => d !== null);
      expect(firstDay).toBe('2024-01-01');
    });
  });

  describe('formatMonthYear', () => {
    it('should format month and year in zh-TW locale', () => {
      const result = formatMonthYear(2024, 0); // January 2024
      expect(result).toContain('2024');
      expect(result).toContain('1月');
    });

    it('should handle December correctly', () => {
      const result = formatMonthYear(2024, 11); // December 2024
      expect(result).toContain('2024');
      expect(result).toContain('12月');
    });
  });
});
