import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { SOUND_OPTIONS, playStampSound } from '../../utils/audio';
import { useSettings } from '../../contexts/SettingsContext';
import { useGameStore, selectCalendarStyle, selectSelectedSound } from '../../store/gameStateStore';
import { SectionDivider, CollapsibleSection } from './SettingsSection';
import type { CalendarStyle } from '../../types';

const CALENDAR_STYLES: { id: CalendarStyle; label: string }[] = [
  { id: 'minimal', label: '極簡風格' },
  { id: 'handdrawn', label: '手繪溫暖' },
  { id: 'cny', label: '新春禮節' },
  { id: 'japanese', label: '日式和風' },
  { id: 'american', label: '美式日記' },
];

export default function AppearanceSettings() {
  const { setCalendarStyle, setSoundEffect } = useSettings();
  const calendarStyle = useGameStore(selectCalendarStyle);
  const selectedSound = useGameStore(selectSelectedSound);
  const [showAppearance, setShowAppearance] = useState(false);

  return (
    <>
      <SectionDivider label="外觀與音效" icon={<Palette size={12} />} />
      <CollapsibleSection
        title="外觀設定"
        icon={<Palette size={16} />}
        isOpen={showAppearance}
        onToggle={() => setShowAppearance(!showAppearance)}
      >
        <div className="space-y-3">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              日曆風格
            </div>
            <div className="space-y-1">
              {CALENDAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCalendarStyle(style.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                    calendarStyle === style.id
                      ? 'bg-white dark:bg-slate-600 text-orange-500 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-700'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  aria-label={style.label}
                  aria-pressed={calendarStyle === style.id}
                >
                  {style.label}
                  {calendarStyle === style.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              打卡音效
            </div>
            <div className="space-y-1">
              {SOUND_OPTIONS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    setSoundEffect(sound.id);
                    playStampSound(sound.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                    selectedSound === sound.id
                      ? 'bg-white dark:bg-slate-600 text-indigo-500 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-700'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  aria-label={sound.label}
                  aria-pressed={selectedSound === sound.id}
                >
                  {sound.label}
                  {selectedSound === sound.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </>
  );
}
