/**
 * World, decoration, and area types.
 */

import type { PetStage } from './habit';

export type DecorationType = 'background' | 'floor' | 'furniture' | 'plant';

export interface DecorationItem {
  id: string;
  name: string;
  price: number;
  type: DecorationType;
  emoji: string;
  description: string;
}

export interface PlacedItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
}

export interface PlacedPet {
  id: string;
  petId: string;
  stage: PetStage;
  x: number;
}

export interface AreaConfig {
  id: string;
  name: string;
  description: string;
  unlockCost: number;
  backgroundClass: string;
  placedItems: PlacedItem[];
  placedPets: PlacedPet[];
}

export interface WorldState {
  unlockedAreas: string[];
  areas: Record<string, AreaConfig>;
}
