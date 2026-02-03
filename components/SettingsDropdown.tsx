import React, { useState } from 'react';
import { GameState, Habit, CalendarStyle } from '../types';
import { STAMP_OPTIONS, STAMP_COLORS } from '../utils/stampIcons';
import { SOUND_OPTIONS, playStampSound } from '../utils/audio';
import { 
  RefreshCw, FlaskConical, Check, CalendarRange, 
  Stamp, Lock, Medal, Palette, ChevronRight, Volume2, 
  Download, Upload, User, Pencil, Trash2 
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
  updatePetNickname: (habitId: string, petNickname: string) => void;
  renameHabit: (habitId: string, newName: string) => void;
  deleteHabit: (habitId: string) => void;
  onCloseSettings: () => void;
  isFirebaseEnabled?: boolean;
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
  updatePetNickname,
  renameHabit,
  deleteHabit,
  onCloseSettings,
  isFirebaseEnabled = false,
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
  const [habitNameEdit, setHabitNameEdit] = useState(activeHabit.name);
  const [petNicknameEdit, setPetNicknameEdit] = useState(activeHabit.petNickname ?? '');

  // Keep local edits in sync when activeHabit or dropdown opens
  React.useEffect(() => {
    if (isOpen) {
      setHabitNameEdit(activeHabit.name);
      setPetNicknameEdit(activeHabit.petNickname ?? '');
    }
  }, [isOpen, activeHabit.name, activeHabit.petNickname]);

  const handleSaveHabitName = () => {
    const trimmed = habitNameEdit.trim();
    if (trimmed && trimmed !== activeHabit.name) renameHabit(activeHabit.id, trimmed);
  };

  const handleSavePetNickname = () => {
    const val = petNicknameEdit.trim();
    if (val !== (activeHabit.petNickname ?? '')) updatePetNickname(activeHabit.id, val);
  };

  const handleDeleteHabit = () => {
    const habitCount = Object.keys(gameState.habits).length;
    if (habitCount <= 1) return;
    const msg = `確定要刪除「${activeHabit.name}」與其所有打卡紀錄嗎？此操作無法復原。`;
    if (window.confirm(msg)) {
      deleteHabit(activeHabit.id);
      onCloseSettings();
    }
  };

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
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-3 rounded-xl transition-colors duration-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          aria-label="匯出備份"
        >
          <Download size={18} />
          匯出備份
        </button>
        <button
          onClick={onImportClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-3 rounded-xl transition-colors duration-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          aria-label="匯入備份"
        >
          <Upload size={18} />
          匯入備份
        </button>
      </div>

      {isFirebaseEnabled && (
        <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
          若您曾選擇「不登入，直接使用」，可隨時在頂部按「Google 登入」以將本機資料同步到 Google 帳號。
        </p>
      )}

      {/* Settings Section */}
      <div className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 mt-2">
        設定
      </div>

      {/* Current habit / pet settings */}
      <div className="px-2 mb-2">
        <div className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          當前習慣／精靈設定
        </div>
        <div className="space-y-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-600">
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <Pencil size={12} />
              習慣名稱
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={habitNameEdit}
                onChange={(e) => setHabitNameEdit(e.target.value)}
                onBlur={handleSaveHabitName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveHabitName()}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                placeholder="習慣名稱"
              />
              <button
                type="button"
                onClick={handleSaveHabitName}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                aria-label="儲存習慣名稱"
              >
                儲存
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <User size={12} />
              精靈暱稱（選填，顯示在精靈卡片上）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={petNicknameEdit}
                onChange={(e) => setPetNicknameEdit(e.target.value)}
                onBlur={handleSavePetNickname}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePetNickname()}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                placeholder="精靈暱稱"
              />
              <button
                type="button"
                onClick={handleSavePetNickname}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
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
      </div>

      {/* Sound Settings */}
      <button
        onClick={() => setShowSoundSelector(!showSoundSelector)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 font-medium mb-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        aria-label="打卡音效"
        aria-expanded={showSoundSelector}
      >
        <div className="flex items-center gap-3">
          <Volume2 size={16} />
          打卡音效
        </div>
        <ChevronRight
          size={16}
          className={`transition-transform duration-200 ${showSoundSelector ? 'rotate-90' : ''}`}
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
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                gameState.selectedSound === sound.id
                  ? 'bg-white dark:bg-slate-600 text-indigo-500 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-700'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              aria-label={sound.label}
              aria-pressed={gameState.selectedSound === sound.id}
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
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        aria-label="日曆外觀風格"
        aria-expanded={showStyleSelector}
      >
        <div className="flex items-center gap-3">
          <Palette size={16} />
          日曆外觀風格
        </div>
        <ChevronRight
          size={16}
          className={`transition-transform duration-200 ${showStyleSelector ? 'rotate-90' : ''}`}
        />
      </button>

      {showStyleSelector && (
        <div className="bg-slate-50 dark:bg-slate-700 p-2 m-2 rounded-xl border border-slate-100 dark:border-slate-600 space-y-1">
          {CALENDAR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setCalendarStyle(style.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                gameState.calendarStyle === style.id
                  ? 'bg-white dark:bg-slate-600 text-orange-500 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-700'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              aria-label={style.label}
              aria-pressed={gameState.calendarStyle === style.id}
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
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors duration-200 font-medium mb-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
        aria-label="榮譽殿堂"
      >
        <Medal size={16} />
        榮譽殿堂 (退休紀錄)
      </button>

      {/* Change Icon Toggle */}
      <button
        onClick={() => setShowIconSelector(!showIconSelector)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        aria-label="更換打卡樣式"
        aria-expanded={showIconSelector}
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
                    relative aspect-square flex items-center justify-center rounded-lg transition-all duration-200 group cursor-pointer
                    ${
                      isSelected
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md'
                        : isUnlocked
                        ? 'bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-500 cursor-not-allowed'
                    }
                  `}
                  title={isUnlocked ? option.label : option.unlockHint}
                  aria-label={isUnlocked ? option.label : option.unlockHint}
                  aria-pressed={isSelected}
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
      )}

      {/* Reset Button */}
      <button
        onClick={onResetProgress}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors duration-200 font-medium mb-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-inset"
        aria-label="重置所有資料"
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
              className="bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-600 dark:text-amber-400 p-2 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
              aria-label="單日補簽"
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
              className="w-full mt-1 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-600 dark:text-amber-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
              aria-label="執行區間打卡"
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
