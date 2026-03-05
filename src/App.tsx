import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useHabitEngine } from './hooks/useHabitEngine';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import PetDisplay from './components/PetDisplay';
import CalendarView from './components/CalendarView';
import OverallCalendarView from './components/OverallCalendarView';
import Onboarding from './components/Onboarding';
import StatsBar from './components/StatsBar';
import WorldView from './components/WorldView';
import HallOfFame from './components/HallOfFame';
import AchievementList from './components/AchievementList';
import AchievementToast from './components/AchievementToast';
import StatsChart from './components/StatsChart';
import ReminderSettingsComponent from './components/ReminderSettings';
import GoalSettings from './components/GoalSettings';
import ShareCard from './components/ShareCard';
import EntryChoice, { getGuestChoiceStored } from './components/EntryChoice';
import ModalLayer from './components/ModalLayer';
import AppNavbar from './components/AppNavbar';
import { Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import { playStampSound } from './utils/audio';
import { startReminderChecker, stopReminderChecker, sendDailyReminder, getReminderSettings } from './utils/notifications';

function App() {
  const { user, signInWithGoogle, signOut, isFirebaseEnabled, signInLoading, signInError } = useAuth();
  const {
    gameState,
    activeHabit,
    isLoaded,
    addHabit, 
    switchHabit,
    updateStampStyle,
    setCalendarStyle,
    setSoundEffect,
    stampToday, 
    debugStampDate,
    debugStampRange,
    isTodayStamped, 
    getMonthlyCount,
    resetProgress,
    importSaveData,
    // Phase 3
    buyDecoration,
    placeDecoration,
    removeDecoration,
    placePetInArea,
    removePetFromArea,
    unlockArea,
    // Phase 4
    retireHabit,
    updatePetNickname,
    renameHabit,
    deleteHabit,
    // Phase 6
    newlyUnlockedAchievements,
    dismissToast,
    // Phase 7: Goals
    addGoal,
    removeGoal,
    syncStatus,
    // Phase 8: Custom Stamps
    addCustomStamp,
    deleteCustomStamp,
  } = useHabitEngine();

  const [justStamped, setJustStamped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [choseGuest, setChoseGuest] = useState(false);
  const [userImageError, setUserImageError] = useState<Record<string, boolean>>({});

  useTheme(); // Ensures theme is applied (e.g. class on document)
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'habits' | 'world'>('habits');
  // Calendar Toggle State
  const [calendarMode, setCalendarMode] = useState<'single' | 'overall'>('single');

  // Debug states
  const [debugDate, setDebugDate] = useState('');
  const [debugStartDate, setDebugStartDate] = useState('');
  const [debugEndDate, setDebugEndDate] = useState('');

  // Start reminder checker on mount
  useEffect(() => {
    startReminderChecker(() => {
      const settings = getReminderSettings();
      if (settings.enabled && activeHabit) {
        sendDailyReminder(activeHabit.name);
      }
    });
    return () => stopReminderChecker();
  }, [activeHabit]);

  // All useCallback hooks MUST be defined before any early returns
  const handleStamp = useCallback(() => {
    playStampSound(gameState?.selectedSound || 'pop');
    stampToday();
    setJustStamped(true);
    setTimeout(() => setJustStamped(false), 2000);
  }, [gameState?.selectedSound, stampToday]);

  const handleExportData = useCallback(() => {
    if (!gameState) return;
    const dataStr = JSON.stringify(gameState);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growday_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [gameState]);

  const handleImportClick = useCallback(() => {
      if (confirm('匯入備份將會覆蓋目前的進度，確定要繼續嗎？')) {
          fileInputRef.current?.click();
      }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          if (event.target?.result) {
              const success = importSaveData(event.target.result as string);
              if (success) {
                  setShowSettings(false);
              }
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  }, [importSaveData]);

  const handleDebugStamp = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (debugDate) {
      debugStampDate(debugDate);
      setJustStamped(true); 
      setTimeout(() => setJustStamped(false), 2000);
      alert(`已成功模擬 ${debugDate} 的打卡紀錄！`);
    }
  }, [debugDate, debugStampDate]);

  const handleDebugRangeStamp = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (debugStartDate && debugEndDate) {
      if (new Date(debugStartDate) > new Date(debugEndDate)) {
        alert("開始日期不能晚於結束日期");
        return;
      }
      debugStampRange(debugStartDate, debugEndDate);
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 2000);
      alert(`已成功模擬 ${debugStartDate} 至 ${debugEndDate} 的區間打卡！`);
    }
  }, [debugStartDate, debugEndDate, debugStampRange]);

  const currentMonthCount = useMemo(() => 
    getMonthlyCount(new Date().getFullYear(), new Date().getMonth()),
    [getMonthlyCount]
  );

  // Memoized callbacks for child components
  const handleSwitchHabit = useCallback((id: string) => switchHabit(id), [switchHabit]);
  const handleOpenAddModal = useCallback(() => setShowAddModal(true), []);
  const handleOpenCompendium = useCallback(() => setShowCompendium(true), []);
  const handleCloseCompendium = useCallback(() => setShowCompendium(false), []);
  const handleCloseHallOfFame = useCallback(() => setShowHallOfFame(false), []);
  const handleCloseAchievements = useCallback(() => setShowAchievements(false), []);
  const handleShowAchievements = useCallback(() => setShowAchievements(true), []);
  const handleOpenStatsChart = useCallback(() => setShowStatsChart(true), []);
  const handleCloseStatsChart = useCallback(() => setShowStatsChart(false), []);
  const handleOpenReminder = useCallback(() => setShowReminder(true), []);
  const handleCloseReminder = useCallback(() => setShowReminder(false), []);
  const handleOpenGoals = useCallback(() => setShowGoals(true), []);
  const handleCloseGoals = useCallback(() => setShowGoals(false), []);
  const handleOpenShareCard = useCallback(() => setShowShareCard(true), []);
  const handleCloseShareCard = useCallback(() => setShowShareCard(false), []);
  const handleGoToWorld = useCallback(() => setCurrentView('world'), []);
  const handleToggleSettings = useCallback(() => setShowSettings(prev => !prev), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);
  const handleShowHallOfFame = useCallback(() => { setShowHallOfFame(true); setShowSettings(false); }, []);
  const handleDismissToast = useCallback(() => {
    if (newlyUnlockedAchievements.length > 0) {
      dismissToast(newlyUnlockedAchievements[0].id);
    }
  }, [newlyUnlockedAchievements, dismissToast]);
  const handleBackFromWorld = useCallback(() => setCurrentView('habits'), []);
  const handleSetCalendarModeSingle = useCallback(() => setCalendarMode('single'), []);
  const handleSetCalendarModeOverall = useCallback(() => setCalendarMode('overall'), []);
  const handleCloseMoreMenu = useCallback(() => setShowMoreMenu(false), []);

  // Early returns AFTER all hooks
  if (!isLoaded) return <div className="h-screen w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium">載入中...</div>;

  // Entry choice: Google login or continue as guest (only when Firebase enabled and user not signed in)
  if (isFirebaseEnabled && !user && !choseGuest && !getGuestChoiceStored()) {
    return (
      <EntryChoice
        onSignIn={signInWithGoogle}
        onContinueAsGuest={() => setChoseGuest(true)}
        signInLoading={signInLoading}
        signInError={signInError}
      />
    );
  }

  // Initial Onboarding (if no habits exist)
  if (!gameState.isOnboarded) {
    return <Onboarding onComplete={(name, icon, color, stampColor) => addHabit(name, icon, color, stampColor)} />;
  }

  // Safety check
  if (!activeHabit) {
      return <div className="dark:bg-slate-900 dark:text-white">Loading habit...</div>;
  }

  // --- WORLD VIEW RENDER ---
  if (currentView === 'world') {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white p-4 lg:p-8 relative flex flex-col items-center transition-colors duration-300">
              <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl p-4 lg:p-8 min-h-[90vh] transition-colors duration-300">
                  <WorldView 
                      gameState={gameState}
                      onBack={handleBackFromWorld}
                      buyDecoration={buyDecoration}
                      placeDecoration={placeDecoration}
                      removeDecoration={removeDecoration}
                      placePetInArea={placePetInArea}
                      removePetFromArea={removePetFromArea}
                      unlockArea={unlockArea}
                  />
              </div>

              {/* Toast Notification Layer (World View) */}
              {newlyUnlockedAchievements.length > 0 && (
                  <AchievementToast 
                      achievement={newlyUnlockedAchievements[0]} 
                      onDismiss={handleDismissToast} 
                  />
              )}
          </div>
      );
  }

  // --- MAIN HABIT VIEW RENDER ---
  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900 font-sans text-ink dark:text-white p-4 lg:p-8 relative transition-colors duration-300">
      
      {/* Toast Notification Layer */}
      {newlyUnlockedAchievements.length > 0 && (
          <AchievementToast 
              achievement={newlyUnlockedAchievements[0]} 
              onDismiss={handleDismissToast} 
          />
      )}

      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      <SettingsProvider
        value={{
          gameState,
          activeHabit: activeHabit!,
          onExportData: handleExportData,
          onImportClick: handleImportClick,
          onShowHallOfFame: handleShowHallOfFame,
          onResetProgress: resetProgress,
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
        }}
      >
        <ModalLayer
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          addHabit={addHabit}
          showCompendium={showCompendium}
          onCloseCompendium={handleCloseCompendium}
          unlockedPetIds={gameState.unlockedPets}
          showHallOfFame={showHallOfFame}
          onCloseHallOfFame={handleCloseHallOfFame}
          retiredPets={gameState.retiredPets}
          showAchievements={showAchievements}
          onCloseAchievements={handleCloseAchievements}
          unlockedAchievementIds={gameState.unlockedAchievements}
          showStatsChart={showStatsChart}
          onCloseStatsChart={handleCloseStatsChart}
          activeHabit={activeHabit}
          showReminder={showReminder}
          onCloseReminder={handleCloseReminder}
          showGoals={showGoals}
          onCloseGoals={handleCloseGoals}
          goals={gameState.goals}
          completedGoals={gameState.completedGoals}
          addGoal={addGoal}
          removeGoal={removeGoal}
          showShareCard={showShareCard}
          onCloseShareCard={handleCloseShareCard}
          gameState={gameState}
        />

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
          onOpenReminder={handleOpenReminder}
          onOpenGoals={handleOpenGoals}
          onOpenStatsChart={handleOpenStatsChart}
          onOpenShareCard={handleOpenShareCard}
          onShowAchievements={handleShowAchievements}
          showMoreMenu={showMoreMenu}
          onCloseMoreMenu={handleCloseMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
          onGoToWorld={handleGoToWorld}
          gameState={gameState}
          onSwitchHabit={handleSwitchHabit}
          onOpenAddModal={handleOpenAddModal}
          onOpenCompendium={handleOpenCompendium}
        />

      {/* Main Content Grid: Calendar gets enough space to show fully (no scroll container). Page scrolls when needed. */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column: Pet + Stats (4 columns on desktop) */}
        <section className="lg:col-span-4 flex flex-col gap-3 lg:gap-4 order-2 lg:order-1">
          <PetDisplay 
            habit={activeHabit} 
            justStamped={justStamped} 
            className="w-full shadow-lg border border-slate-100 dark:border-slate-700 flex-shrink-0"
            onRetire={retireHabit}
          />
          <div className="flex-shrink-0">
            <StatsBar habit={activeHabit} monthlyCount={currentMonthCount} />
          </div>
        </section>

        {/* Right Column: Calendar (8 columns) – enough space for full calendar, no scroll */}
        <section className="lg:col-span-8 flex flex-col gap-3 lg:gap-4 order-1 lg:order-2">
          {/* Calendar Toggle */}
          <div className="flex justify-end px-2 flex-shrink-0 z-10">
              <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex gap-1 shadow-inner">
                  <button 
                     onClick={handleSetCalendarModeSingle}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${calendarMode === 'single' ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'}`}
                     aria-label="單項日曆"
                     aria-pressed={calendarMode === 'single'}
                  >
                      <CalendarIcon size={14} /> 單項
                  </button>
                  <button 
                     onClick={handleSetCalendarModeOverall}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${calendarMode === 'overall' ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'}`}
                     aria-label="整體日曆"
                     aria-pressed={calendarMode === 'overall'}
                  >
                      <LayoutGrid size={14} /> 整體
                  </button>
              </div>
          </div>

          {/* Calendar: design system surface + primary accent; min-height so full calendar fits */}
          <div className="relative min-h-[540px] rounded-[2rem] overflow-hidden bg-surface dark:bg-slate-800 border border-primary/10 dark:border-slate-700 shadow-lg transition-shadow duration-200 hover:shadow-xl">
            {/* Dot grid – light: subtle teal tint */}
            <div
              className="absolute inset-0 pointer-events-none z-0 dark:hidden"
              style={{ backgroundImage: 'radial-gradient(rgb(20, 184, 166, 0.12) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              aria-hidden
            />
            {/* Dot grid background – dark theme */}
            <div
              className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
              style={{ backgroundImage: 'radial-gradient(rgb(71, 85, 105) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
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
                <OverallCalendarView 
                    habits={gameState.habits} 
                    style={gameState.calendarStyle}
                />
             )}
            </div>
          </div>
        </section>

      </main>
      </SettingsProvider>
    </div>
  );
}

export default App;
