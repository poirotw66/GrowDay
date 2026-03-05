import React from 'react';
import Onboarding from './Onboarding';
import Compendium from './Compendium';
import HallOfFame from './HallOfFame';
import AchievementList from './AchievementList';
import StatsChart from './StatsChart';
import ReminderSettingsComponent from './ReminderSettings';
import GoalSettings from './GoalSettings';
import ShareCard from './ShareCard';
import { useModal } from '../contexts/ModalContext';
import { useHabitEngine } from '../hooks/useHabitEngine';

/**
 * Renders all overlay modals. Reads visibility from ModalContext and data/actions from useHabitEngine.
 * No props – avoids prop drilling.
 */
export default function ModalLayer() {
  const modal = useModal();
  const {
    gameState,
    activeHabit,
    addHabit,
    addGoal,
    removeGoal,
  } = useHabitEngine();

  return (
    <>
      {modal.showAddModal && (
        <Onboarding
          onComplete={(name, icon, color, stampColor) => {
            addHabit(name, icon, color, stampColor);
            modal.closeAddModal();
          }}
          isAddingNew={true}
          onCancel={modal.closeAddModal}
        />
      )}

      {modal.showCompendium && (
        <Compendium
          unlockedPetIds={gameState.unlockedPets}
          onClose={modal.closeCompendium}
        />
      )}

      {modal.showHallOfFame && (
        <HallOfFame retiredPets={gameState.retiredPets} onClose={modal.closeHallOfFame} />
      )}

      {modal.showAchievements && (
        <AchievementList
          unlockedIds={gameState.unlockedAchievements}
          onClose={modal.closeAchievements}
        />
      )}

      {modal.showStatsChart && activeHabit && (
        <StatsChart habit={activeHabit} onClose={modal.closeStatsChart} />
      )}

      {modal.showReminder && (
        <ReminderSettingsComponent
          habitName={activeHabit?.name}
          onClose={modal.closeReminder}
        />
      )}

      {modal.showGoals && activeHabit && (
        <GoalSettings
          habit={activeHabit}
          goals={gameState.goals || []}
          completedGoals={gameState.completedGoals || []}
          onAddGoal={addGoal}
          onRemoveGoal={removeGoal}
          onClose={modal.closeGoals}
        />
      )}

      {modal.showShareCard && activeHabit && (
        <ShareCard
          habit={activeHabit}
          gameState={gameState}
          onClose={modal.closeShareCard}
        />
      )}
    </>
  );
}
