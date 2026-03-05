/**
 * Central type exports. Game state and app-wide types live here;
 * domain types are split into habit, goal, world, stamp.
 */

export type { DayLog, PetColor, PetDefinition, RetiredPet, Habit, LevelConfig } from './habit';
export { PetStage } from './habit';

export type { GoalPeriod, Goal, CompletedGoal } from './goal';
export type { DecorationType, DecorationItem, PlacedItem, PlacedPet, AreaConfig, WorldState } from './world';
export type { CustomStamp } from './stamp';

export type CalendarStyle =
  | 'minimal'
  | 'handdrawn'
  | 'cny'
  | 'japanese'
  | 'american'
  | 'idol_magazine';

import type { Habit, RetiredPet } from './habit';
import type { Goal, CompletedGoal } from './goal';
import type { WorldState } from './world';
import type { CustomStamp } from './stamp';

export interface GameState {
  habits: Record<string, Habit>;
  activeHabitId: string | null;
  unlockedPets: string[];
  unlockedIcons: string[];
  isOnboarded: boolean;
  coins: number;
  inventory: string[];
  world: WorldState;
  retiredPets: RetiredPet[];
  calendarStyle: CalendarStyle;
  selectedSound: string;
  theme?: 'light' | 'dark' | 'system';
  unlockedAchievements: string[];
  goals?: Goal[];
  completedGoals?: CompletedGoal[];
  customStamps?: Record<string, CustomStamp>;
}
