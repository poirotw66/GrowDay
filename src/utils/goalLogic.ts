import { Goal, GoalPeriod, Habit } from '../types';

// Goal reward calculation
export function calculateGoalReward(period: GoalPeriod, targetDays: number): number {
  const baseReward = period === 'weekly' ? 10 : 30;
  const multiplier = Math.ceil(targetDays / 3);
  return baseReward * multiplier;
}

// Get the start date of current period
export function getPeriodStart(period: GoalPeriod, date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  if (period === 'weekly') {
    // Start of week (Sunday)
    const day = start.getDay();
    start.setDate(start.getDate() - day);
  } else {
    // Start of month
    start.setDate(1);
  }
  
  return start;
}

// Get the end date of current period
export function getPeriodEnd(period: GoalPeriod, date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  if (period === 'weekly') {
    // End of week (Saturday)
    const day = end.getDay();
    end.setDate(end.getDate() + (6 - day));
  } else {
    // End of month
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
  }
  
  return end;
}

// Count stamps in a period
export function countStampsInPeriod(
  habit: Habit,
  periodStart: Date,
  periodEnd: Date
): number {
  let count = 0;
  const logs = Object.values(habit.logs);
  
  for (const log of logs) {
    if (!log.stamped) continue;
    
    const logDate = new Date(log.date);
    logDate.setHours(12, 0, 0, 0); // Normalize to noon to avoid timezone issues
    
    if (logDate >= periodStart && logDate <= periodEnd) {
      count++;
    }
  }
  
  return count;
}

// Check if a goal is completed
export function isGoalCompleted(
  goal: Goal,
  habit: Habit,
  completedGoals: { goalId: string; periodStart: string }[]
): boolean {
  const periodStart = getPeriodStart(goal.period);
  const periodStartStr = periodStart.toISOString().split('T')[0];
  
  // Check if already completed in this period
  return completedGoals.some(
    cg => cg.goalId === goal.id && cg.periodStart === periodStartStr
  );
}

// Get progress for a goal
export function getGoalProgress(goal: Goal, habit: Habit): { current: number; target: number; percentage: number } {
  const periodStart = getPeriodStart(goal.period);
  const periodEnd = getPeriodEnd(goal.period);
  const current = countStampsInPeriod(habit, periodStart, periodEnd);
  const target = goal.targetDays;
  const percentage = Math.min(100, Math.round((current / target) * 100));
  
  return { current, target, percentage };
}

// Get days remaining in period
export function getDaysRemainingInPeriod(period: GoalPeriod): number {
  const now = new Date();
  const end = getPeriodEnd(period);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end.getTime() - now.getTime()) / msPerDay);
}

// Get period label
export function getPeriodLabel(period: GoalPeriod): string {
  const now = new Date();
  
  if (period === 'weekly') {
    const start = getPeriodStart(period);
    const end = getPeriodEnd(period);
    return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
  } else {
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  }
}

// Default goal presets
export const GOAL_PRESETS: { period: GoalPeriod; targetDays: number; label: string }[] = [
  { period: 'weekly', targetDays: 3, label: '每週 3 天' },
  { period: 'weekly', targetDays: 5, label: '每週 5 天' },
  { period: 'weekly', targetDays: 7, label: '每週 7 天（全勤）' },
  { period: 'monthly', targetDays: 15, label: '每月 15 天' },
  { period: 'monthly', targetDays: 20, label: '每月 20 天' },
  { period: 'monthly', targetDays: 28, label: '每月 28 天' },
];
