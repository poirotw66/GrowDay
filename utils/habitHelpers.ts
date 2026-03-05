import { DayLog, Habit } from '../types';

/**
 * Count stamps in a habit for a given year/month.
 */
export function getHabitMonthlyCount(
  habit: Habit,
  year: number,
  month: number
): number {
  let count = 0;
  Object.values(habit.logs).forEach((log: DayLog) => {
    const d = new Date(log.date);
    if (d.getFullYear() === year && d.getMonth() === month && log.stamped) {
      count++;
    }
  });
  return count;
}

/**
 * Given current unlocked icon IDs and habit stats, return updated list of unlocked icon IDs.
 */
export function checkUnlockableIcons(
  habit: Habit,
  currentUnlocked: string[],
  monthlyCount: number
): string[] {
  const newUnlocked = [...currentUnlocked];

  const tryUnlock = (id: string) => {
    if (!newUnlocked.includes(id)) newUnlocked.push(id);
  };

  if (habit.totalExp / 10 >= 3) tryUnlock('feather');
  if (habit.currentLevel >= 10) tryUnlock('crown');
  if (habit.currentStreak >= 3) tryUnlock('fire');
  if (habit.currentStreak >= 7) tryUnlock('zap');
  if (habit.currentStreak >= 30) tryUnlock('trophy');
  if (habit.currentStreak >= 100) tryUnlock('diamond');
  if (monthlyCount >= 20) tryUnlock('anchor');

  return newUnlocked;
}
