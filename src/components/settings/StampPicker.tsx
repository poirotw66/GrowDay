import React, { useState } from 'react';
import { Stamp, Sparkles, Lock, Check, ImagePlus, X as XIcon } from 'lucide-react';
import { STAMP_OPTIONS, STAMP_COLORS } from '../../utils/stampIcons';
import { useSettings } from '../../contexts/SettingsContext';
import { SectionDivider, CollapsibleSection } from './SettingsSection';
import CustomStampUploader from '../CustomStampUploader';
import type { CustomStamp } from '../../types';

export default function StampPicker() {
  const {
    gameState,
    activeHabit,
    updateStampStyle,
    onAddCustomStamp,
    onDeleteCustomStamp,
    userId = null,
    isFirebaseEnabled = false,
  } = useSettings();

  const [showStampStyle, setShowStampStyle] = useState(false);
  const [showCustomStampUploader, setShowCustomStampUploader] = useState(false);

  const handleAddCustomStamp = (stamp: CustomStamp) => {
    if (onAddCustomStamp) onAddCustomStamp(stamp);
    setShowCustomStampUploader(false);
  };

  const handleDeleteCustomStamp = (stampId: string) => {
    const stamp = gameState.customStamps?.[stampId];
    if (!stamp) return;
    const msg = `確定要刪除「${stamp.name}」嗎？此操作無法復原。`;
    if (window.confirm(msg) && onDeleteCustomStamp) onDeleteCustomStamp(stampId);
  };

  const customStampsCount = gameState.customStamps ? Object.keys(gameState.customStamps).length : 0;

  return (
    <>
      <SectionDivider label="打卡樣式" icon={<Stamp size={12} />} />
      <CollapsibleSection
        title="更換打卡樣式"
        icon={<Sparkles size={16} />}
        isOpen={showStampStyle}
        onToggle={() => setShowStampStyle(!showStampStyle)}
        badge={customStampsCount > 0 ? customStampsCount : undefined}
      >
        <div className="space-y-4">
          {onAddCustomStamp && (
            <button
              onClick={() => setShowCustomStampUploader(true)}
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              aria-label="上傳自訂印章"
            >
              <ImagePlus size={18} />
              上傳自訂印章
            </button>
          )}
          {gameState.customStamps && Object.keys(gameState.customStamps).length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                自訂印章
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Object.values(gameState.customStamps).map((stamp) => {
                  const customIconId = `custom:${stamp.id}`;
                  const isSelected = activeHabit.stampIcon === customIconId;
                  return (
                    <div key={stamp.id} className="relative group">
                      <button
                        onClick={() => updateStampStyle(customIconId, activeHabit.stampColor)}
                        className={`relative aspect-square flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'bg-slate-800 dark:bg-slate-200 shadow-md ring-2 ring-primary'
                            : 'bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500'
                        }`}
                        title={stamp.name}
                        aria-label={stamp.name}
                        aria-pressed={isSelected}
                      >
                        <img src={stamp.imageData} alt={stamp.name} className="w-full h-full object-contain p-1" />
                      </button>
                      {onDeleteCustomStamp && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomStamp(stamp.id);
                          }}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
                          aria-label={`刪除 ${stamp.name}`}
                        >
                          <XIcon size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              預設圖標
            </div>
            <div className="grid grid-cols-5 gap-2">
              {STAMP_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = activeHabit.stampIcon === option.id;
                const isUnlocked = gameState.unlockedIcons?.includes(option.id);
                return (
                  <button
                    key={option.id}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && updateStampStyle(option.id, activeHabit.stampColor)}
                    className={`relative aspect-square flex items-center justify-center rounded-lg transition-all duration-200 group cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                        : isUnlocked
                          ? 'bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-500 cursor-not-allowed'
                    }`}
                    title={isUnlocked ? option.label : option.unlockHint}
                    aria-label={isUnlocked ? option.label : option.unlockHint}
                    aria-pressed={isSelected}
                  >
                    <Icon size={18} fill={isSelected ? 'currentColor' : 'none'} />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-lg">
                        <Lock size={12} className="text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              顏色
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {STAMP_COLORS.map((color) => {
                const isSelected = activeHabit.stampColor === color.hex;
                return (
                  <button
                    key={color.id}
                    onClick={() => updateStampStyle(activeHabit.stampIcon, color.hex)}
                    className={`w-6 h-6 rounded-full transition-transform duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                      isSelected
                        ? 'scale-125 ring-2 ring-slate-300 dark:ring-slate-500 ring-offset-1 dark:ring-offset-slate-700'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.id}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check size={10} className="text-white mx-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CollapsibleSection>
      {showCustomStampUploader && onAddCustomStamp && (
        <CustomStampUploader
          onUpload={handleAddCustomStamp}
          onClose={() => setShowCustomStampUploader(false)}
          existingStamps={gameState.customStamps}
          userId={userId}
          isFirebaseEnabled={isFirebaseEnabled}
        />
      )}
    </>
  );
}
