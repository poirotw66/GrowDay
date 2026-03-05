import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import PetDisplay from '../components/PetDisplay';
import CalendarView from '../components/CalendarView';
import OverallCalendarView from '../components/OverallCalendarView';
import StatsBar from '../components/StatsBar';
import AchievementToast from '../components/AchievementToast';
import ModalLayer from '../components/ModalLayer';
import AppNavbar from '../components/AppNavbar';
import { useModal, ModalProvider } from '../contexts/ModalContext';
import { SettingsProvider, SettingsContextValue } from '../contexts/SettingsContext';
import { playStampSound } from '../utils/audio';
import type { GameState } from '../types';
import type { Habit } from '../types/habit';
import type { Achievement } from '../utils/achievementData';
import type { CustomStamp } from '../types';
import type { CalendarStyle } from '../types';

export interface MainHabitViewProps {
  gameState: GameState;
  activeHabit: Habit;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  newlyUnlockedAchievements: Achievement[];
  isFirebaseEnabled: boolean;
  user: { uid: string; photoURL?: string | null; displayName?: string | null; email?: string | null } | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  signInLoading: boolean;
  onDismissToast: (achievementId: string) => void;
  onGoToWorld: () => void;
  onSwitchHabit: (id: string) => void;
  onRetireHabit: (habitId: string) => void;
  onResetProgress: () => void;
  onExportData: (gameState: GameState) => void;
  onImportData: (content: string) => boolean;
  updateStampStyle: (icon: string, color: string) => void;
  setCalendarStyle: (style: CalendarStyle) => void;
  setSoundEffect: (soundId: string) => void;
  updatePetNickname: (habitId: string, petNickname: string) => void;
  renameHabit: (habitId: string, newName: string) => void;
  deleteHabit: (habitId: string) => void;
  addCustomStamp: (stamp: CustomStamp) => void;
  deleteCustomStamp: (stampId: string) => void;
  stampToday: () => void;
  isTodayStamped: () => boolean;
  getMonthlyCount: (year: number, monthIndex: number) => number;
  debugStampDate: (date: string) => void;
  debugStampRange: (start: string, end: string) => void;
}

interface SettingsProviderWithModalProps {
  value: Omit<SettingsContextValue, 'onShowHallOfFame'>;
  setShowSettings: (open: boolean) => void;
  children: React.ReactNode;
}

function SettingsProviderWithModal({ value, setShowSettings, children }: SettingsProviderWithModalProps) {
  const modal = useModal();
  const valueWithHall: SettingsContextValue = useMemo(
    () => ({
      ...value,
      onShowHallOfFame: () => {
        modal.openHallOfFame();
        setShowSettings(false);
      },
    }),
    [value, modal, setShowSettings],
  );

  return <SettingsProvider value={valueWithHall}>{children}</SettingsProvider>;
}

export function MainHabitView({
  gameState,
  activeHabit,
  syncStatus,
  newlyUnlockedAchievements,
  isFirebaseEnabled,
  user,
  signInWithGoogle,
  signOut,
  signInLoading,
  onDismissToast,
  onGoToWorld,
  onSwitchHabit,
  onRetireHabit,
  onResetProgress,
  onExportData,
  onImportData,
  updateStampStyle,
  setCalendarStyle,
  setSoundEffect,
  updatePetNickname,
  renameHabit,
  deleteHabit,
  addCustomStamp,
  deleteCustomStamp,
  stampToday,
  isTodayStamped,
  getMonthlyCount,
  debugStampDate,
  debugStampRange,
}: MainHabitViewProps) {
  const [justStamped, setJustStamped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [userImageError, setUserImageError] = useState<Record<string, boolean>>({});
  const [calendarMode, setCalendarMode] = useState<'single' | 'overall'>('single');
  const [debugDate, setDebugDate] = useState('');
  const [debugStartDate, setDebugStartDate] = useState('');
  const [debugEndDate, setDebugEndDate] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStamp = useCallback(() => {
    const selectedSound = gameState.selectedSound || 'pop';
    playStampSound(selectedSound);
    stampToday();
    setJustStamped(true);
    setTimeout(() => setJustStamped(false), 2000);
  }, [gameState.selectedSound, stampToday]);

  const handleExportData = useCallback(() => {
    onExportData(gameState);
  }, [gameState, onExportData]);

  const handleImportClick = useCallback(() => {
    if (confirm('匯入備份將會覆蓋目前的進度，確定要繼續嗎？')) {
      fileInputRef.current?.click();
    }
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return;
        const success = onImportData(e.target.result as string);
        if (success) {
          setShowSettings(false);
        }
      };

      reader.readAsText(file);
      event.target.value = '';
    },
    [onImportData],
  );

  const handleDebugStamp = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!debugDate) return;
      debugStampDate(debugDate);
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 2000);
      alert(`已成功模擬 ${debugDate} 的打卡紀錄！`);
    },
    [debugDate, debugStampDate],
  );

  const handleDebugRangeStamp = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!debugStartDate || !debugEndDate) return;
      if (new Date(debugStartDate) > new Date(debugEndDate)) {
        alert('開始日期不能晚於結束日期');
        return;
      }
      debugStampRange(debugStartDate, debugEndDate);
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 2000);
      alert(`已成功模擬 ${debugStartDate} 至 ${debugEndDate} 的區間打卡！`);
    },
    [debugStartDate, debugEndDate, debugStampRange],
  );

  const currentMonthCount = useMemo(
    () => getMonthlyCount(new Date().getFullYear(), new Date().getMonth()),
    [getMonthlyCount],
  );

  const handleSetCalendarModeSingle = useCallback(() => setCalendarMode('single'), []);
  const handleSetCalendarModeOverall = useCallback(() => setCalendarMode('overall'), []);
  const handleToggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);
  const handleCloseMoreMenu = useCallback(() => setShowMoreMenu(false), []);

  const latestAchievement = newlyUnlockedAchievements.length > 0 ? newlyUnlockedAchievements[0] : null;

  const settingsValue: SettingsContextValue = {
    gameState,
    activeHabit,
    onExportData: handleExportData,
    onImportClick: handleImportClick,
    onShowHallOfFame: () => undefined,
    onResetProgress,
    updateStampStyle,
    setCalendarStyle,
    setSoundEffect,
    updatePetNickname,
    renameHabit,
    deleteHabit,
    onCloseSettings: handleCloseSettings,
    isFirebaseEnabled,
    userId: user?.uid ?? null,
    onAddCustomStamp: addCustomStamp,
    onDeleteCustomStamp: deleteCustomStamp,
    debugDate,
    setDebugDate,
    debugStartDate,
    setDebugStartDate,
    debugEndDate,
    setDebugEndDate,
    onDebugStamp: handleDebugStamp,
    onDebugRangeStamp: handleDebugRangeStamp,
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900 font-sans text-ink dark:text-white p-4 lg:p-8 relative transition-colors duration-300">
      {syncStatus === 'error' && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-950/60 dark:text-red-100 shadow-sm">
            <p className="font-semibold">雲端同步發生錯誤</p>
            <p className="mt-1">
              目前畫面顯示的是本機儲存的資料，最新進度可能尚未成功備份到雲端。
              請稍後檢查網路連線或重新整理頁面後再試一次。
            </p>
          </div>
        </div>
      )}

      {latestAchievement && (
        <AchievementToast achievement={latestAchievement} onDismiss={() => onDismissToast(latestAchievement.id)} />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      <ModalProvider>
        <SettingsProviderWithModal value={settingsValue} setShowSettings={setShowSettings}>
          <ModalLayer />

          <AppNavbar
            showSettings={showSettings}
            onToggleSettings={handleToggleSettings}
            onCloseSettings={handleCloseSettings}
            syncStatus={syncStatus}
            user={user}
            isFirebaseEnabled={isFirebaseEnabled}
            signInWithGoogle={signInWithGoogle}
            signOut={signOut}
            signInLoading={signInLoading}
            userImageError={userImageError}
            setUserImageError={setUserImageError}
            showMoreMenu={showMoreMenu}
            onCloseMoreMenu={handleCloseMoreMenu}
            setShowMoreMenu={setShowMoreMenu}
            onGoToWorld={onGoToWorld}
            gameState={gameState}
            onSwitchHabit={onSwitchHabit}
          />

          <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            <section className="lg:col-span-4 flex flex-col gap-3 lg:gap-4 order-2 lg:order-1">
              <PetDisplay
                habit={activeHabit}
                justStamped={justStamped}
                className="w-full shadow-lg border border-slate-100 dark:border-slate-700 flex-shrink-0"
                onRetire={onRetireHabit}
              />
              <div className="flex-shrink-0">
                <StatsBar habit={activeHabit} monthlyCount={currentMonthCount} />
              </div>
            </section>

            <section className="lg:col-span-8 flex flex-col gap-3 lg:gap-4 order-1 lg:order-2">
              <div className="flex justify-end px-2 flex-shrink-0 z-10">
                <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex gap-1 shadow-inner">
                  <button
                    onClick={handleSetCalendarModeSingle}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                      calendarMode === 'single'
                        ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-sm'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    aria-label="單項日曆"
                    aria-pressed={calendarMode === 'single'}
                  >
                    <CalendarIcon size={14} /> 單項
                  </button>
                  <button
                    onClick={handleSetCalendarModeOverall}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                      calendarMode === 'overall'
                        ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-sm'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    aria-label="整體日曆"
                    aria-pressed={calendarMode === 'overall'}
                  >
                    <LayoutGrid size={14} /> 整體
                  </button>
                </div>
              </div>

              <div className="relative min-h-[540px] rounded-[2rem] overflow-hidden bg-surface dark:bg-slate-800 border border-primary/10 dark:border-slate-700 shadow-lg transition-shadow duration-200 hover:shadow-xl">
                <div
                  className="absolute inset-0 pointer-events-none z-0 dark:hidden"
                  style={{
                    backgroundImage: 'radial-gradient(rgb(20, 184, 166, 0.12) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
                  style={{
                    backgroundImage: 'radial-gradient(rgb(71, 85, 105) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                  aria-hidden
                />
                <div className="relative z-10 flex flex-col p-3 md:p-5">
                  {calendarMode === 'single' ? (
                    <CalendarView
                      habit={activeHabit}
                      onStamp={handleStamp}
                      isTodayStamped={isTodayStamped()}
                      style={gameState.calendarStyle}
                      selectedSound={gameState.selectedSound}
                      gameState={gameState}
                    />
                  ) : (
                    <OverallCalendarView habits={gameState.habits} style={gameState.calendarStyle} />
                  )}
                </div>
              </div>
            </section>
          </main>
        </SettingsProviderWithModal>
      </ModalProvider>
    </div>
  );
}

export default MainHabitView;

