// Define the structure of a daily log
export interface DayLog {
  date: string; // Format: YYYY-MM-DD
  stamped: boolean;
  timestamp: number;
}

// Define the main state of the user's progress
export interface GameState {
  habitName: string;
  startDate: string;
  logs: Record<string, DayLog>; // Map of date string to log
  totalExp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  isOnboarded: boolean;
}

// Define the visual stages of the pet
export enum PetStage {
  EGG = 'EGG',       // Lv 1-5
  BABY = 'BABY',     // Lv 6-15
  CHILD = 'CHILD',   // Lv 16-30
  ADULT = 'ADULT',   // Lv 30+
}

export interface LevelConfig {
  stage: PetStage;
  label: string;
  emoji: string;
  colorBg: string;
  description: string;
}
