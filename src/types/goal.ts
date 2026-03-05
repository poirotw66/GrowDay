/**
 * Goal system types.
 */

export type GoalPeriod = 'weekly' | 'monthly';

export interface Goal {
  id: string;
  habitId: string;
  period: GoalPeriod;
  targetDays: number;
  coinReward: number;
  createdAt: string;
}

export interface CompletedGoal {
  goalId: string;
  completedAt: string;
  periodStart: string;
}
