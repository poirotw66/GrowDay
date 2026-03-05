import React, { createContext, useContext, useMemo } from 'react';
import { GameState, Habit, CalendarStyle, CustomStamp } from '../types';

export interface SettingsContextValue {
  gameState: GameState;
  activeHabit: Habit;
  onExportData: () => void;
  onImportClick: () => void;
  onShowHallOfFame: () => void;
  onResetProgress: () => void;
  updateStampStyle: (icon: string, color: string) => void;
  setCalendarStyle: (style: CalendarStyle) => void;
  setSoundEffect: (soundId: string) => void;
  updatePetNickname: (habitId: string, petNickname: string) => void;
  renameHabit: (habitId: string, newName: string) => void;
  deleteHabit: (habitId: string) => void;
  onCloseSettings: () => void;
  isFirebaseEnabled?: boolean;
  userId?: string | null;
  onAddCustomStamp?: (stamp: CustomStamp) => void;
  onDeleteCustomStamp?: (stampId: string) => void;
  debugDate: string;
  setDebugDate: (date: string) => void;
  debugStartDate: string;
  setDebugStartDate: (date: string) => void;
  debugEndDate: string;
  setDebugEndDate: (date: string) => void;
  onDebugStamp: (e: React.FormEvent) => void;
  onDebugRangeStamp: (e: React.FormEvent) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  value,
  children,
}: {
  value: SettingsContextValue;
  children: React.ReactNode;
}) {
  const memoValue = useMemo(() => value, [
    value.gameState,
    value.activeHabit,
    value.onExportData,
    value.onImportClick,
    value.onShowHallOfFame,
    value.onResetProgress,
    value.updateStampStyle,
    value.setCalendarStyle,
    value.setSoundEffect,
    value.updatePetNickname,
    value.renameHabit,
    value.deleteHabit,
    value.onCloseSettings,
    value.isFirebaseEnabled,
    value.userId,
    value.onAddCustomStamp,
    value.onDeleteCustomStamp,
    value.debugDate,
    value.setDebugDate,
    value.debugStartDate,
    value.setDebugStartDate,
    value.debugEndDate,
    value.setDebugEndDate,
    value.onDebugStamp,
    value.onDebugRangeStamp,
  ]);
  return (
    <SettingsContext.Provider value={memoValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
