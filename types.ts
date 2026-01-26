// Define the structure of a daily log
export interface DayLog {
  date: string; // Format: YYYY-MM-DD
  stamped: boolean;
  timestamp: number;
  icon?: string; // Optional: The specific icon ID used for this day
}

export type PetColor = 'red' | 'blue' | 'green' | 'purple';

export interface PetDefinition {
  id: string;
  name: string;
  color: PetColor;
  stages: {
    egg: string;   // Lv 1-5
    baby: string;  // Lv 6-15
    child: string; // Lv 16-30
    adult: string; // Lv 30+
  };
  description: string;
}

// A single habit instance
export interface Habit {
  id: string;
  name: string;
  stampIcon: string;
  petColor: PetColor;
  petId: string; // Which specific pet from the pool was assigned
  startDate: string;
  logs: Record<string, DayLog>;
  totalExp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
}

// Define the main state of the user's progress
export interface GameState {
  habits: Record<string, Habit>; // Map of ID to Habit
  activeHabitId: string | null;
  unlockedPets: string[]; // List of Pet IDs encountered/unlocked (for compendium)
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
  // emoji is now dynamic based on the specific pet
  colorBg: string;
  description: string;
}
