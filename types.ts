
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

// --- PHASE 3: DECORATION & WORLD ---

export type DecorationType = 'background' | 'floor' | 'furniture' | 'plant';

export interface DecorationItem {
  id: string;
  name: string;
  price: number;
  type: DecorationType;
  emoji: string; // Simple emoji representation for MVP
  description: string;
}

export interface PlacedItem {
  id: string; // unique instance id
  itemId: string; // decoration item id
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface PlacedPet {
  id: string; // unique instance id
  petId: string; // The species ID (e.g., 'fire_dragon')
  stage: PetStage; // The visual stage
  x: number; // percentage
}

export interface AreaConfig {
  id: string;
  name: string;
  description: string;
  unlockCost: number; // Coins to unlock
  backgroundClass: string; // Tailwind class for background
  placedItems: PlacedItem[];
  placedPets: PlacedPet[];
}

export interface WorldState {
  unlockedAreas: string[]; // List of area IDs
  areas: Record<string, AreaConfig>; // State of each area
}

// ------------------------------------

// Define the main state of the user's progress
export interface GameState {
  habits: Record<string, Habit>; // Map of ID to Habit
  activeHabitId: string | null;
  unlockedPets: string[]; // List of Pet IDs encountered/unlocked (for compendium)
  unlockedIcons: string[]; // List of Stamp IDs unlocked by achievements
  isOnboarded: boolean;
  
  // Phase 3
  coins: number;
  inventory: string[]; // List of Item IDs owned
  world: WorldState;
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
