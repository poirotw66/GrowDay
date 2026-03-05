import React, { useState, useEffect } from 'react';
import { Settings2, Pencil, User, Trash2 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { SectionDivider, CollapsibleSection } from './SettingsSection';

export default function HabitSettingsSection() {
  const {
    gameState,
    activeHabit,
    renameHabit,
    updatePetNickname,
    deleteHabit,
    onCloseSettings,
  } = useSettings();

  const [showHabitSettings, setShowHabitSettings] = useState(false);
  const [habitNameEdit, setHabitNameEdit] = useState(activeHabit.name);
  const [petNicknameEdit, setPetNicknameEdit] = useState(activeHabit.petNickname ?? '');

  useEffect(() => {
    setHabitNameEdit(activeHabit.name);
    setPetNicknameEdit(activeHabit.petNickname ?? '');
  }, [activeHabit.name, activeHabit.petNickname]);

  const handleSaveHabitName = () => {
    const trimmed = habitNameEdit.trim();
    if (trimmed && trimmed !== activeHabit.name) renameHabit(activeHabit.id, trimmed);
  };

  const handleSavePetNickname = () => {
    const val = petNicknameEdit.trim();
    if (val !== (activeHabit.petNickname ?? '')) updatePetNickname(activeHabit.id, val);
  };

  const handleDeleteHabit = () => {
    if (Object.keys(gameState.habits).length <= 1) return;
    const msg = `確定要刪除「${activeHabit.name}」與其所有打卡紀錄嗎？此操作無法復原。`;
    if (window.confirm(msg)) {
      deleteHabit(activeHabit.id);
      onCloseSettings();
    }
  };

  return (
    <>
      <SectionDivider label="當前習慣" icon={<Settings2 size={12} />} />
      <CollapsibleSection
        title="習慣設定"
        icon={<Pencil size={16} />}
        isOpen={showHabitSettings}
        onToggle={() => setShowHabitSettings(!showHabitSettings)}
      >
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              習慣名稱
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={habitNameEdit}
                onChange={(e) => setHabitNameEdit(e.target.value)}
                onBlur={handleSaveHabitName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveHabitName()}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                placeholder="習慣名稱"
              />
              <button
                type="button"
                onClick={handleSaveHabitName}
                className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light text-xs font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                aria-label="儲存習慣名稱"
              >
                儲存
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <User size={12} />
              精靈暱稱（選填）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={petNicknameEdit}
                onChange={(e) => setPetNicknameEdit(e.target.value)}
                onBlur={handleSavePetNickname}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePetNickname()}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                placeholder="精靈暱稱"
              />
              <button
                type="button"
                onClick={handleSavePetNickname}
                className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light text-xs font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                aria-label="儲存精靈暱稱"
              >
                儲存
              </button>
            </div>
          </div>
          {Object.keys(gameState.habits).length > 1 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={handleDeleteHabit}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-inset"
                aria-label="刪除此習慣"
              >
                <Trash2 size={14} />
                刪除此習慣
              </button>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </>
  );
}
