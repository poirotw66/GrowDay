import React, { useState } from 'react';
import { GameState, Habit, CalendarStyle, CustomStamp } from '../types';
import { STAMP_OPTIONS, STAMP_COLORS } from '../utils/stampIcons';
import { SOUND_OPTIONS, playStampSound } from '../utils/audio';
import { 
  RefreshCw, FlaskConical, Check, CalendarRange, 
  Stamp, Lock, Medal, Palette, ChevronRight, Volume2, 
  Download, Upload, User, Pencil, Trash2, ImagePlus, X as XIcon,
  Settings2, Sparkles, Database, AlertTriangle, Cloud, Eye, RefreshCcw
} from 'lucide-react';
import CustomStampUploader from './CustomStampUploader';
import { getGameStateForUser, setGameStateForUser } from '../firebase';

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
  userId?: string | null;
  onAddCustomStamp?: (stamp: CustomStamp) => void;
  onDeleteCustomStamp?: (stampId: string) => void;
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

// Section divider component
const SectionDivider: React.FC<{ label: string; icon?: React.ReactNode }> = ({ label, icon }) => (
  <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3 first:mt-0">
    {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
    {label}
  </div>
);

// Collapsible section wrapper
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string | number;
}> = ({ title, icon, isOpen, onToggle, children, badge }) => (
  <>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight
        size={16}
        className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
      />
    </button>
      {isOpen && (
      <div className="bg-slate-50 dark:bg-slate-700 p-3 m-2 rounded-xl border border-slate-100 dark:border-slate-600 transition-all duration-200">
        {children}
      </div>
    )}
  </>
);

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
  userId = null,
  onAddCustomStamp,
  onDeleteCustomStamp,
  debugDate,
  setDebugDate,
  debugStartDate,
  setDebugStartDate,
  debugEndDate,
  setDebugEndDate,
  onDebugStamp,
  onDebugRangeStamp,
}) => {
  // State management - grouped by section
  const [showHabitSettings, setShowHabitSettings] = useState(false);
  const [showStampStyle, setShowStampStyle] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showCustomStampUploader, setShowCustomStampUploader] = useState(false);
  
  // Firebase debug state
  const [firebaseData, setFirebaseData] = useState<unknown>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);
  const [showFirebaseDebug, setShowFirebaseDebug] = useState(false);
  
  // Form state
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

  const handleAddCustomStamp = (stamp: CustomStamp) => {
    if (onAddCustomStamp) {
      onAddCustomStamp(stamp);
    }
    setShowCustomStampUploader(false);
  };

  const handleDeleteCustomStamp = (stampId: string) => {
    const stamp = gameState.customStamps?.[stampId];
    if (!stamp) return;
    
    const msg = `確定要刪除「${stamp.name}」嗎？此操作無法復原。`;
    if (window.confirm(msg) && onDeleteCustomStamp) {
      onDeleteCustomStamp(stampId);
    }
  };

  const customStampsCount = gameState.customStamps ? Object.keys(gameState.customStamps).length : 0;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 w-80 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 overflow-hidden max-h-[80vh] overflow-y-auto z-50 scrollbar-hide">
      
      {/* Section 1: Current Habit Settings */}
      <SectionDivider label="當前習慣" icon={<Settings2 size={12} />} />
      
      <CollapsibleSection
        title="習慣設定"
        icon={<Pencil size={16} />}
        isOpen={showHabitSettings}
        onToggle={() => setShowHabitSettings(!showHabitSettings)}
      >
        <div className="space-y-3">
          {/* Habit Name */}
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

          {/* Pet Nickname */}
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

          {/* Delete Habit */}
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

      {/* Section 2: Stamp Style */}
      <SectionDivider label="打卡樣式" icon={<Stamp size={12} />} />
      
      <CollapsibleSection
        title="更換打卡樣式"
        icon={<Sparkles size={16} />}
        isOpen={showStampStyle}
        onToggle={() => setShowStampStyle(!showStampStyle)}
        badge={customStampsCount > 0 ? customStampsCount : undefined}
      >
        <div className="space-y-4">
          {/* Upload Custom Stamp Button */}
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

          {/* Custom Stamps */}
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
                        className={`
                          relative aspect-square flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer overflow-hidden
                          ${
                            isSelected
                              ? 'bg-slate-800 dark:bg-slate-200 shadow-md ring-2 ring-primary'
                              : 'bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500'
                          }
                        `}
                        title={stamp.name}
                        aria-label={stamp.name}
                        aria-pressed={isSelected}
                      >
                        <img
                          src={stamp.imageData}
                          alt={stamp.name}
                          className="w-full h-full object-contain p-1"
                        />
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

          {/* Built-in Icons */}
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
          </div>

          {/* Colors */}
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

      {/* Section 3: Appearance & Sound */}
      <SectionDivider label="外觀與音效" icon={<Palette size={12} />} />
      
      <CollapsibleSection
        title="外觀設定"
        icon={<Palette size={16} />}
        isOpen={showAppearance}
        onToggle={() => setShowAppearance(!showAppearance)}
      >
        <div className="space-y-3">
          {/* Calendar Style */}
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
          </div>

          {/* Sound Effect */}
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
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4: Data Management */}
      <SectionDivider label="資料管理" icon={<Database size={12} />} />
      
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
        <div className="px-4 py-2 mb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            若您曾選擇「不登入，直接使用」，可隨時在頂部按「Google 登入」以將本機資料同步到 Google 帳號。
          </p>
        </div>
      )}

      {/* Section 5: Other Features */}
      <SectionDivider label="其他功能" icon={<Sparkles size={12} />} />
      
      <button
        onClick={onShowHallOfFame}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors duration-200 font-medium mb-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
        aria-label="榮譽殿堂"
      >
        <Medal size={16} />
        榮譽殿堂 (退休紀錄)
      </button>

      {/* Reset Button */}
      <button
        onClick={onResetProgress}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors duration-200 font-medium mb-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-inset"
        aria-label="重置所有資料"
      >
        <AlertTriangle size={16} />
        重置所有資料
      </button>

      {/* Firebase Debug Section */}
      {isFirebaseEnabled && userId && (
        <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
          <div className="px-4 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Database size={12} />
            Firebase 同步調試
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600">
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  setIsLoadingFirebase(true);
                  setFirebaseError(null);
                  try {
                    const data = await getGameStateForUser(userId);
                    setFirebaseData(data);
                    if (!data) {
                      setFirebaseError('Firestore 中沒有找到資料');
                    }
                  } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    setFirebaseError(errorMsg);
                    console.error('Firebase 查詢失敗:', e);
                  } finally {
                    setIsLoadingFirebase(false);
                  }
                }}
                disabled={isLoadingFirebase}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
                aria-label="查詢 Firestore 資料"
              >
                <Eye size={14} />
                {isLoadingFirebase ? '查詢中...' : '查詢 Firestore 資料'}
              </button>
              
              <button
                onClick={async () => {
                  setIsLoadingFirebase(true);
                  setFirebaseError(null);
                  try {
                    await setGameStateForUser(userId, gameState);
                    setFirebaseData(gameState);
                    alert('資料已成功上傳到 Firestore！');
                  } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    setFirebaseError(errorMsg);
                    console.error('Firebase 上傳失敗:', e);
                    alert(`上傳失敗: ${errorMsg}`);
                  } finally {
                    setIsLoadingFirebase(false);
                  }
                }}
                disabled={isLoadingFirebase}
                className="w-full flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/70 text-green-600 dark:text-green-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset"
                aria-label="手動上傳到 Firestore"
              >
                <Cloud size={14} />
                {isLoadingFirebase ? '上傳中...' : '手動上傳到 Firestore'}
              </button>
              
              {firebaseError && (
                <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">錯誤：</p>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">{firebaseError}</p>
                </div>
              )}
              
              {firebaseData && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowFirebaseDebug(!showFirebaseDebug)}
                    className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded transition-colors duration-200 cursor-pointer"
                  >
                    <span className="font-medium">查看 Firestore 資料</span>
                    <ChevronRight
                      size={12}
                      className={`transition-transform duration-200 ${showFirebaseDebug ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {showFirebaseDebug && (
                    <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <pre className="text-[10px] text-slate-600 dark:text-slate-400 overflow-auto max-h-48 font-mono">
                        {JSON.stringify(firebaseData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">本地資料摘要：</p>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>習慣數量: {Object.keys(gameState.habits).length}</p>
                  <p>活躍習慣: {gameState.activeHabitId || '無'}</p>
                  <p>金幣: {gameState.coins}</p>
                  <p>自訂印章: {gameState.customStamps ? Object.keys(gameState.customStamps).length : 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Debug Section */}
      {isFirebaseEnabled && userId && (
        <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
          <div className="px-4 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Database size={12} />
            Firebase 同步調試
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600">
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  setIsLoadingFirebase(true);
                  setFirebaseError(null);
                  try {
                    const data = await getGameStateForUser(userId);
                    setFirebaseData(data);
                    if (!data) {
                      setFirebaseError('Firestore 中沒有找到資料');
                    }
                  } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    setFirebaseError(errorMsg);
                    console.error('Firebase 查詢失敗:', e);
                  } finally {
                    setIsLoadingFirebase(false);
                  }
                }}
                disabled={isLoadingFirebase}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
                aria-label="查詢 Firestore 資料"
              >
                <Eye size={14} />
                {isLoadingFirebase ? '查詢中...' : '查詢 Firestore 資料'}
              </button>
              
              <button
                onClick={async () => {
                  setIsLoadingFirebase(true);
                  setFirebaseError(null);
                  try {
                    await setGameStateForUser(userId, gameState);
                    setFirebaseData(gameState);
                    alert('資料已成功上傳到 Firestore！');
                  } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    setFirebaseError(errorMsg);
                    console.error('Firebase 上傳失敗:', e);
                    alert(`上傳失敗: ${errorMsg}`);
                  } finally {
                    setIsLoadingFirebase(false);
                  }
                }}
                disabled={isLoadingFirebase}
                className="w-full flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/70 text-green-600 dark:text-green-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset"
                aria-label="手動上傳到 Firestore"
              >
                <Cloud size={14} />
                {isLoadingFirebase ? '上傳中...' : '手動上傳到 Firestore'}
              </button>
              
              {firebaseError && (
                <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">錯誤：</p>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">{firebaseError}</p>
                </div>
              )}
              
              {firebaseData && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowFirebaseDebug(!showFirebaseDebug)}
                    className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded transition-colors duration-200 cursor-pointer"
                  >
                    <span className="font-medium">查看 Firestore 資料</span>
                    <ChevronRight
                      size={12}
                      className={`transition-transform duration-200 ${showFirebaseDebug ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {showFirebaseDebug && (
                    <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <pre className="text-[10px] text-slate-600 dark:text-slate-400 overflow-auto max-h-48 font-mono">
                        {JSON.stringify(firebaseData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">本地資料摘要：</p>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>習慣數量: {Object.keys(gameState.habits).length}</p>
                  <p>活躍習慣: {gameState.activeHabitId || '無'}</p>
                  <p>金幣: {gameState.coins}</p>
                  <p>自訂印章: {gameState.customStamps ? Object.keys(gameState.customStamps).length : 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Tools Section */}
      <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
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

      {/* Custom Stamp Uploader Modal */}
      {showCustomStampUploader && onAddCustomStamp && (
        <CustomStampUploader
          onUpload={handleAddCustomStamp}
          onClose={() => setShowCustomStampUploader(false)}
          existingStamps={gameState.customStamps}
          userId={userId}
          isFirebaseEnabled={isFirebaseEnabled}
        />
      )}
    </div>
  );
};

export default SettingsDropdown;
