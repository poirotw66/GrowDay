/**
 * Habit, log, and pet-related types.
 */

export interface DayLog {
  date: string; // YYYY-MM-DD
  stamped: boolean;
  timestamp: number;
  icon?: string;
  color?: string;
  position?: {
    x: number;
    y: number;
    rotation: number;
  };
}

export type PetColor = 'red' | 'blue' | 'green' | 'purple';

export interface PetDefinition {
  id: string;
  name: string;
  color: PetColor;
  stages: {
    egg: string;
    baby: string;
    child: string;
    adult: string;
  };
  description: string;
}

export interface RetiredPet {
  id: string;
  originalHabitId: string;
  petId: string;
  name: string;
  retiredDate: string;
  generation: number;
  bonusMultiplier: number;
}

export interface Habit {
  id: string;
  name: string;
  stampIcon: string;
  stampColor: string;
  petColor: PetColor;
  petId: string;
  startDate: string;
  logs: Record<string, DayLog>;
  totalExp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  generation: number;
  petNickname?: string;
}

export enum PetStage {
  EGG = 'EGG',
  BABY = 'BABY',
  CHILD = 'CHILD',
  ADULT = 'ADULT',
}

export interface LevelConfig {
  stage: PetStage;
  label: string;
  colorBg: string;
  description: string;
}
