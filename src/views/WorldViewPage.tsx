import React from 'react';
import WorldView from '../components/WorldView';
import AchievementToast from '../components/AchievementToast';
import type { GameState, PetStage } from '../types';
import type { Achievement } from '../utils/achievementData';

export interface WorldViewPageProps {
  gameState: GameState;
  newlyUnlockedAchievements: Achievement[];
  onDismissToast: (achievementId: string) => void;
  onBack: () => void;
  buyDecoration: (id: string) => void;
  placeDecoration: (areaId: string, itemId: string) => void;
  removeDecoration: (areaId: string, instanceId: string) => void;
  placePetInArea: (areaId: string, petId: string, stage: PetStage) => void;
  removePetFromArea: (areaId: string, instanceId: string) => void;
  unlockArea: (areaId: string) => void;
}

export function WorldViewPage({
  gameState,
  newlyUnlockedAchievements,
  onDismissToast,
  onBack,
  buyDecoration,
  placeDecoration,
  removeDecoration,
  placePetInArea,
  removePetFromArea,
  unlockArea,
}: WorldViewPageProps) {
  const hasNewAchievement = newlyUnlockedAchievements.length > 0;
  const latestAchievement = hasNewAchievement ? newlyUnlockedAchievements[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white p-4 lg:p-8 relative flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl p-4 lg:p-8 min-h-[90vh] transition-colors duration-300">
        <WorldView
          gameState={gameState}
          onBack={onBack}
          buyDecoration={buyDecoration}
          placeDecoration={placeDecoration}
          removeDecoration={removeDecoration}
          placePetInArea={placePetInArea}
          removePetFromArea={removePetFromArea}
          unlockArea={unlockArea}
        />
      </div>

      {latestAchievement && (
        <AchievementToast achievement={latestAchievement} onDismiss={() => onDismissToast(latestAchievement.id)} />
      )}
    </div>
  );
}

export default WorldViewPage;

