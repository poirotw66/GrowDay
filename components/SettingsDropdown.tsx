import React, { useState } from 'react';
import { GameState, Habit, CalendarStyle } from '../types';
import { STAMP_OPTIONS, STAMP_COLORS } from '../utils/stampIcons';
import { SOUND_OPTIONS, playStampSound } from '../utils/audio';
import { 
  RefreshCw, FlaskConical, Check, CalendarRange, 
  Stamp, Lock, Medal, Palette, ChevronRight, Volume2, 
  Download, Upload 
} from 'lucide-react';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  activeHabit: Habit;
  onExportData: () => void;
  onImportClick: () => void;
  onShowHallOfFame: () => void;
  onResetProgress: () => void;
  updateStampStyle: (icon: string, color: string) => void;
  setCalendarStyle: (style: CalendarStyle) => void;
  setSoundEffect: (soundId: string) => void;
  // Debug props
  debugDate: string;
  setDebugDate: (date: string) => void;
  debugStartDate: string;
  setDebugStartDate: (date: string) => void;
  debugEndDate: string;
  setDebugEndDate: (date: string) => void;
  onDebugStamp: (e: React.FormEvent) => void;
  onDebugRangeStamp: (e: React.FormEvent) => void;
}

const CALENDAR_STYLES: { id: CalendarStyle; label: string }[] = [
  { id: 'minimal', label: '極簡風格' },
  { id: 'handdrawn', label: '手繪溫暖' },
  { id: 'cny', label: '新春禮節' },
  { id: 'japanese', label: '日式和風' },
  { id: 'american', label: '美式日記' },
];

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  isOpen,
  onClose: _onClose,
  gameState,
  activeHabit,
  onExportData,
  onImportClick,
  onShowHallOfFame,
  onResetProgress,
  updateStampStyle,
  setCalendarStyle,
  setSoundEffect,
  debugDate,
  setDebugDate,
  debugStartDate,
  setDebugStartDate,
  debugEndDate,
  setDebugEndDate,
  onDebugStamp,
  onDebugRangeStamp,
}) => {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showSoundSelector, setShowSoundSelector] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 w-80 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 overflow-hidden max-h-[80vh] overflow-y-auto z-50">
      {/* Data Management Section */}
      <div className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
        資料管理
      </div>

      <div className="flex gap-2 px-2 mb-2">
        <button
          onClick={onExportData}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-3 rounded-xl transition-colors text-slate-600 dark:text-slate-300 text-xs font-bold"
        >
          <Download size={18} />
          匯出備份
        </button>
        <button
          onClick={onImportClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-3 rounded-xl transition-colors text-slate-600 dark:text-slate-300 text-xs font-bold"
        >
          <Upload size={18} />
          匯入備份
        </button>
      </div>

      {/* Settings Section */}
      <div className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 mt-2">
        設定
      </div>

      {/* Sound Settings */}
      <button
        onClick={() => setShowSoundSelector(!showSoundSelector)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium mb-1"
      >
        <div className="flex items-center gap-3">
          <Volume2 size={16} />
          打卡音效
        </div>
        <ChevronRight
          size={16}
          className={`transition-transform ${showSoundSelector ? 'rotate-90' : ''}`}
        />
      </button>

      {showSoundSelector && (
        <div className="bg-slate-50 dark:bg-slate-700 p-2 m-2 rounded-xl border border-slate-100 dark:border-slate-600 space-y-1">
          {SOUND_OPTIONS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => {
                setSoundEffect(sound.id);
                playStampSound(sound.id);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center ${
                gameState.selectedSound === sound.id
                  ? 'bg-white dark:bg-slate-600 text-indigo-500 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-700'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {sound.label}
              {gameState.selectedSound === sound.id && <Check size={14} />}
            </button>
          ))}
        </div>
      )}

      {/* Calendar Style Selector */}
      <button
        onClick={() => setShowStyleSelector(!showStyleSelector)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
      >
        <div className="flex items-center gap-3">
          <Palette size={16} />
          日曆外觀風格
        </div>
        <ChevronRight
          size={16}
          className={`transition-transform ${showStyleSelector ? 'rotate-90' : ''}`}
        />
      </button>

      {showStyleSelector && (
        <div className="bg-slate-50 dark:bg-slate-700 p-2 m-2 rounded-xl border border-slate-100 dark:border-slate-600 space-y-1">
          {CALENDAR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setCalendarStyle(style.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center ${
                gameState.calendarStyle === style.id
                  ? 'bg-white dark:bg-slate-600 text-orange-500 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-700'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {style.label}
              {gameState.calendarStyle === style.id && <Check size={14} />}
            </button>
          ))}
        </div>
      )}

      {/* Hall of Fame */}
      <button
        onClick={onShowHallOfFame}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors font-medium mb-1"
      >
        <Medal size={16} />
        榮譽殿堂 (退休紀錄)
      </button>

      {/* Change Icon Toggle */}
      <button
        onClick={() => setShowIconSelector(!showIconSelector)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
      >
        <Stamp size={16} />
        更換打卡樣式
      </button>

      {/* Icon Selector Grid */}
      {showIconSelector && (
        <div className="bg-slate-50 dark:bg-slate-700 p-3 m-2 rounded-xl border border-slate-100 dark:border-slate-600">
          {/* Icons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {STAMP_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = activeHabit.stampIcon === option.id;
              const isUnlocked = gameState.unlockedIcons?.includes(option.id);

              return (
                <button
                  key={option.id}
                  disabled={!isUnlocked}
                  onClick={() =>
                    isUnlocked && updateStampStyle(option.id, activeHabit.stampColor)
                  }
                  className={`
                    relative aspect-square flex items-center justify-center rounded-lg transition-all group
                    ${
                      isSelected
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                        : isUnlocked
                        ? 'bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-500 cursor-not-allowed'
                    }
                  `}
                  title={isUnlocked ? option.label : option.unlockHint}
                >
                  <Icon size={18} fill={isSelected ? 'currentColor' : 'none'} />

                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-lg">
                      <Lock size={12} className="text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Colors */}
          <div className="flex flex-wrap gap-2 justify-center border-t border-slate-200 dark:border-slate-600 pt-3">
            {STAMP_COLORS.map((color) => {
              const isSelected = activeHabit.stampColor === color.hex;
              return (
                <button
                  key={color.id}
                  onClick={() => updateStampStyle(activeHabit.stampIcon, color.hex)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    isSelected
                      ? 'scale-125 ring-2 ring-slate-300 dark:ring-slate-500 ring-offset-1 dark:ring-offset-slate-700'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Check size={10} className="text-white mx-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onResetProgress}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors font-medium mb-1"
      >
        <RefreshCw size={16} />
        重置所有資料
      </button>

      {/* Developer Tools Section */}
      <div className="border-t border-slate-100 dark:border-slate-700 my-2 pt-2">
        <div className="px-4 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <FlaskConical size={12} />
          開發者測試 (當前習慣)
        </div>

        {/* Single Date Stamp */}
        <form onSubmit={onDebugStamp} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">單日補簽：</p>
          <div className="flex gap-2">
            <input
              type="date"
              required
              value={debugDate}
              onChange={(e) => setDebugDate(e.target.value)}
              className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-600 dark:text-amber-400 p-2 rounded-lg transition-colors"
            >
              <Check size={14} />
            </button>
          </div>
        </form>

        {/* Range Stamp */}
        <form onSubmit={onDebugRangeStamp} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1">
            <CalendarRange size={12} />
            區間補簽：
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 w-8">開始</span>
              <input
                type="date"
                required
                value={debugStartDate}
                onChange={(e) => setDebugStartDate(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 w-8">結束</span>
              <input
                type="date"
                required
                value={debugEndDate}
                onChange={(e) => setDebugEndDate(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-1 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-600 dark:text-amber-400 p-2 rounded-lg transition-colors text-xs font-bold"
            >
              執行區間打卡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsDropdown;
