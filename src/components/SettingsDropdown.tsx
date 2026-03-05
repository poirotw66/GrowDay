import React from 'react';
import HabitSettingsSection from './settings/HabitSettingsSection';
import StampPicker from './settings/StampPicker';
import AppearanceSettings from './settings/AppearanceSettings';
import DataManagement from './settings/DataManagement';
import DebugTools from './settings/DebugTools';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings panel composed of atomic sections. All section components use useSettings() for data and handlers.
 */
const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ isOpen, onClose: _onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 w-80 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 overflow-hidden max-h-[80vh] overflow-y-auto z-50 scrollbar-hide">
      <HabitSettingsSection />
      <StampPicker />
      <AppearanceSettings />
      <DataManagement />
      <DebugTools />
    </div>
  );
};

export default SettingsDropdown;
