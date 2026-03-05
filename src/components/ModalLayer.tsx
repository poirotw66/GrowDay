import React from 'react';
import Onboarding from './Onboarding';
import Compendium from './Compendium';
import HallOfFame from './HallOfFame';
import AchievementList from './AchievementList';
import StatsChart from './StatsChart';
import ReminderSettingsComponent from './ReminderSettings';
import GoalSettings from './GoalSettings';
import ShareCard from './ShareCard';
import { GameState, Habit, PetColor, RetiredPet, GoalPeriod } from '../types';

export interface ModalLayerProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  addHabit: (name: string, icon: string, color: PetColor, stampColor?: string) => void;
  showCompendium: boolean;
  onCloseCompendium: () => void;
  unlockedPetIds: string[];
  showHallOfFame: boolean;
  onCloseHallOfFame: () => void;
  retiredPets: RetiredPet[];
  showAchievements: boolean;
  onCloseAchievements: () => void;
  unlockedAchievementIds: string[];
  showStatsChart: boolean;
  onCloseStatsChart: () => void;
  activeHabit: Habit | null;
  showReminder: boolean;
  onCloseReminder: () => void;
  showGoals: boolean;
  onCloseGoals: () => void;
  goals: GameState['goals'];
  completedGoals: GameState['completedGoals'];
  addGoal: (habitId: string, period: GoalPeriod, targetDays: number) => void;
  removeGoal: (goalId: string) => void;
  showShareCard: boolean;
  onCloseShareCard: () => void;
  gameState: GameState;
}

/**
 * Renders all overlay modals (Add habit, Compendium, Hall of Fame, Achievements, Stats, Reminder, Goals, Share).
 */
export default function ModalLayer({
  showAddModal,
  setShowAddModal,
  addHabit,
  showCompendium,
  onCloseCompendium,
  unlockedPetIds,
  showHallOfFame,
  onCloseHallOfFame,
  retiredPets,
  showAchievements,
  onCloseAchievements,
  unlockedAchievementIds,
  showStatsChart,
  onCloseStatsChart,
  activeHabit,
  showReminder,
  onCloseReminder,
  showGoals,
  onCloseGoals,
  goals,
  completedGoals,
  addGoal,
  removeGoal,
  showShareCard,
  onCloseShareCard,
  gameState,
}: ModalLayerProps) {
  return (
    <>
      {showAddModal && (
        <Onboarding
          onComplete={(name, icon, color, stampColor) => {
            addHabit(name, icon, color, stampColor);
            setShowAddModal(false);
          }}
          isAddingNew={true}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showCompendium && (
        <Compendium
          unlockedPetIds={unlockedPetIds}
          onClose={onCloseCompendium}
        />
      )}

      {showHallOfFame && (
        <HallOfFame retiredPets={retiredPets} onClose={onCloseHallOfFame} />
      )}

      {showAchievements && (
        <AchievementList
          unlockedIds={unlockedAchievementIds}
          onClose={onCloseAchievements}
        />
      )}

      {showStatsChart && activeHabit && (
        <StatsChart habit={activeHabit} onClose={onCloseStatsChart} />
      )}

      {showReminder && (
        <ReminderSettingsComponent
          habitName={activeHabit?.name}
          onClose={onCloseReminder}
        />
      )}

      {showGoals && activeHabit && (
        <GoalSettings
          habit={activeHabit}
          goals={goals || []}
          completedGoals={completedGoals || []}
          onAddGoal={addGoal}
          onRemoveGoal={removeGoal}
          onClose={onCloseGoals}
        />
      )}

      {showShareCard && activeHabit && (
        <ShareCard
          habit={activeHabit}
          gameState={gameState}
          onClose={onCloseShareCard}
        />
      )}
    </>
  );
}
