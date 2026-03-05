import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ModalState {
  showAddModal: boolean;
  showCompendium: boolean;
  showHallOfFame: boolean;
  showAchievements: boolean;
  showStatsChart: boolean;
  showReminder: boolean;
  showGoals: boolean;
  showShareCard: boolean;
}

export interface ModalActions {
  openAddModal: () => void;
  closeAddModal: () => void;
  openCompendium: () => void;
  closeCompendium: () => void;
  openHallOfFame: () => void;
  closeHallOfFame: () => void;
  openAchievements: () => void;
  closeAchievements: () => void;
  openStatsChart: () => void;
  closeStatsChart: () => void;
  openReminder: () => void;
  closeReminder: () => void;
  openGoals: () => void;
  closeGoals: () => void;
  openShareCard: () => void;
  closeShareCard: () => void;
}

export type ModalContextValue = ModalState & ModalActions;

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const value: ModalContextValue = {
    showAddModal,
    showCompendium,
    showHallOfFame,
    showAchievements,
    showStatsChart,
    showReminder,
    showGoals,
    showShareCard,
    openAddModal: useCallback(() => setShowAddModal(true), []),
    closeAddModal: useCallback(() => setShowAddModal(false), []),
    openCompendium: useCallback(() => setShowCompendium(true), []),
    closeCompendium: useCallback(() => setShowCompendium(false), []),
    openHallOfFame: useCallback(() => setShowHallOfFame(true), []),
    closeHallOfFame: useCallback(() => setShowHallOfFame(false), []),
    openAchievements: useCallback(() => setShowAchievements(true), []),
    closeAchievements: useCallback(() => setShowAchievements(false), []),
    openStatsChart: useCallback(() => setShowStatsChart(true), []),
    closeStatsChart: useCallback(() => setShowStatsChart(false), []),
    openReminder: useCallback(() => setShowReminder(true), []),
    closeReminder: useCallback(() => setShowReminder(false), []),
    openGoals: useCallback(() => setShowGoals(true), []),
    closeGoals: useCallback(() => setShowGoals(false), []),
    openShareCard: useCallback(() => setShowShareCard(true), []),
    closeShareCard: useCallback(() => setShowShareCard(false), []),
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
