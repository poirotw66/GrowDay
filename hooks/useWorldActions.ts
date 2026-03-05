import { useCallback } from 'react';
import { GameState, PlacedItem, PlacedPet, PetStage } from '../types';
import { DECORATION_ITEMS, INITIAL_AREAS } from '../utils/worldData';
import { setGameStateForUser } from '../firebase';
import type { SyncHelpers } from '../store/useGameState';

/**
 * World and decoration actions: buy, place, remove decorations; place/remove pets in areas; unlock areas.
 */
export function useWorldActions(
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  syncHelpers: SyncHelpers,
  applyAchievements: (state: GameState) => GameState
) {
  const { user, markManualSync, setPendingSync, setSyncStatus } = syncHelpers;

  const buyDecoration = useCallback(
    (itemId: string) => {
      setGameState((prev) => {
        const item = DECORATION_ITEMS.find((i) => i.id === itemId);
        if (!item || prev.coins < item.price) return prev;
        const nextState = {
          ...prev,
          coins: prev.coins - item.price,
          inventory: [...prev.inventory, itemId],
        };
        const finalState = applyAchievements(nextState);
        if (user) {
          setPendingSync(true);
          markManualSync();
          setGameStateForUser(user.uid, finalState)
            .then(() => setPendingSync(false))
            .catch((e) => {
              console.error('Firestore save failed', e);
              setSyncStatus('error');
            });
        }
        return finalState;
      });
    },
    [
      user,
      markManualSync,
      setPendingSync,
      setSyncStatus,
      applyAchievements,
      setGameState,
    ]
  );

  const placeDecoration = useCallback(
    (areaId: string, itemId: string) => {
      setGameState((prev) => {
        const area = prev.world.areas[areaId];
        if (!area) return prev;
        const newPlacedItem: PlacedItem = {
          id: Date.now().toString(),
          itemId,
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 40) + 40,
        };
        return {
          ...prev,
          world: {
            ...prev.world,
            areas: {
              ...prev.world.areas,
              [areaId]: {
                ...area,
                placedItems: [...area.placedItems, newPlacedItem],
              },
            },
          },
        };
      });
    },
    [setGameState]
  );

  const removeDecoration = useCallback(
    (areaId: string, instanceId: string) => {
      setGameState((prev) => {
        const area = prev.world.areas[areaId];
        if (!area) return prev;
        return {
          ...prev,
          world: {
            ...prev.world,
            areas: {
              ...prev.world.areas,
              [areaId]: {
                ...area,
                placedItems: area.placedItems.filter((i) => i.id !== instanceId),
              },
            },
          },
        };
      });
    },
    [setGameState]
  );

  const placePetInArea = useCallback(
    (areaId: string, petId: string, stage: PetStage) => {
      setGameState((prev) => {
        const area = prev.world.areas[areaId];
        if (!area) return prev;
        const newPlacedPet: PlacedPet = {
          id: Date.now().toString(),
          petId,
          stage,
          x: Math.floor(Math.random() * 80) + 10,
        };
        return {
          ...prev,
          world: {
            ...prev.world,
            areas: {
              ...prev.world.areas,
              [areaId]: {
                ...area,
                placedPets: [...area.placedPets, newPlacedPet],
              },
            },
          },
        };
      });
    },
    [setGameState]
  );

  const removePetFromArea = useCallback(
    (areaId: string, instanceId: string) => {
      setGameState((prev) => {
        const area = prev.world.areas[areaId];
        if (!area) return prev;
        return {
          ...prev,
          world: {
            ...prev.world,
            areas: {
              ...prev.world.areas,
              [areaId]: {
                ...area,
                placedPets: area.placedPets.filter((p) => p.id !== instanceId),
              },
            },
          },
        };
      });
    },
    [setGameState]
  );

  const unlockArea = useCallback(
    (areaId: string) => {
      setGameState((prev) => {
        const area = INITIAL_AREAS[areaId];
        if (!area || prev.coins < area.unlockCost) return prev;
        const nextState = {
          ...prev,
          coins: prev.coins - area.unlockCost,
          world: {
            ...prev.world,
            unlockedAreas: [...prev.world.unlockedAreas, areaId],
          },
        };
        return applyAchievements(nextState);
      });
    },
    [applyAchievements, setGameState]
  );

  return {
    buyDecoration,
    placeDecoration,
    removeDecoration,
    placePetInArea,
    removePetFromArea,
    unlockArea,
  };
}
