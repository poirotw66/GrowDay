
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useHabitEngine } from './hooks/useHabitEngine';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import PetDisplay from './components/PetDisplay';
import CalendarView from './components/CalendarView';
import OverallCalendarView from './components/OverallCalendarView';
import Onboarding from './components/Onboarding';
import StatsBar from './components/StatsBar';
import HabitSwitcher from './components/HabitSwitcher';
import Compendium from './components/Compendium';
import WorldView from './components/WorldView';
import HallOfFame from './components/HallOfFame';
import AchievementList from './components/AchievementList';
import AchievementToast from './components/AchievementToast';
import SettingsDropdown from './components/SettingsDropdown';
import StatsChart from './components/StatsChart';
import ThemeToggle from './components/ThemeToggle';
import ReminderSettingsComponent from './components/ReminderSettings';
import GoalSettings from './components/GoalSettings';
import ShareCard from './components/ShareCard';
import EntryChoice, { getGuestChoiceStored } from './components/EntryChoice';
import { Sprout, Map as MapIcon, Calendar as CalendarIcon, LayoutGrid, Trophy, Settings, BarChart3, Bell, Target, Share2, MoreHorizontal, LogIn, LogOut } from 'lucide-react';
import { playStampSound } from './utils/audio';
import { startReminderChecker, stopReminderChecker, sendDailyReminder, getReminderSettings } from './utils/notifications';

function App() {
  const { user, authLoading, signInWithGoogle, signOut, isFirebaseEnabled } = useAuth();
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
    // Phase 6
    newlyUnlockedAchievements,
    dismissToast,
    // Phase 7: Goals
    addGoal,
    removeGoal,
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

  // Theme hook
  const { resolvedTheme } = useTheme();
  
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white p-4 lg:p-8 relative transition-colors duration-300">
      
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

      {/* Add New Habit Modal */}
      {showAddModal && (
        <Onboarding 
            onComplete={(name, icon, color, stampColor) => {
                addHabit(name, icon, color, stampColor);
                setShowAddModal(false);
            }} 
            isAddingNew={true}
            onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Compendium Modal */}
      {showCompendium && (
          <Compendium 
            unlockedPetIds={gameState.unlockedPets} 
            onClose={handleCloseCompendium} 
          />
      )}

      {/* Hall of Fame Modal */}
      {showHallOfFame && (
          <HallOfFame 
            retiredPets={gameState.retiredPets}
            onClose={handleCloseHallOfFame}
          />
      )}

      {/* Achievement Modal */}
      {showAchievements && (
          <AchievementList 
            unlockedIds={gameState.unlockedAchievements}
            onClose={handleCloseAchievements}
          />
      )}

      {/* Stats Chart Modal */}
      {showStatsChart && activeHabit && (
          <StatsChart 
            habit={activeHabit}
            onClose={handleCloseStatsChart}
          />
      )}

      {/* Reminder Settings Modal */}
      {showReminder && (
          <ReminderSettingsComponent 
            habitName={activeHabit?.name}
            onClose={handleCloseReminder}
          />
      )}

      {/* Goal Settings Modal */}
      {showGoals && activeHabit && (
          <GoalSettings 
            habit={activeHabit}
            goals={gameState.goals || []}
            completedGoals={gameState.completedGoals || []}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
            onClose={handleCloseGoals}
          />
      )}

      {/* Share Card Modal */}
      {showShareCard && activeHabit && (
          <ShareCard 
            habit={activeHabit}
            gameState={gameState}
            onClose={handleCloseShareCard}
          />
      )}

      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center px-2 mb-4">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Sprout size={24} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">GrowDay</h1>
            </div>

            <div className="flex items-center gap-2 relative z-40 flex-wrap justify-end">
                {/* Auth: Google sign-in / sign-out */}
                {isFirebaseEnabled && (
                  user ? (
                    <div className="flex items-center gap-2">
                      {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600" />}
                      <span className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]" title={user.email ?? undefined}>{user.email ?? user.displayName ?? ''}</span>
                      <button onClick={() => signOut()} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="登出"><LogOut size={18} /></button>
                    </div>
                  ) : (
                    <button onClick={() => signInWithGoogle()} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium" title="使用 Google 登入"><LogIn size={18} /> Google 登入</button>
                  )
                )}
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Desktop: show all action buttons; Mobile: show More dropdown */}
                <div className="hidden lg:flex items-center gap-2">
                    <button 
                        onClick={handleOpenReminder}
                        className="p-3 bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-full text-cyan-600 dark:text-cyan-400 transition-all shadow-sm border border-cyan-200 dark:border-cyan-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        title="提醒設定"
                    >
                        <Bell size={20} />
                    </button>
                    <button 
                        onClick={handleOpenGoals}
                        className="p-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400 transition-all shadow-sm border border-indigo-200 dark:border-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        title="目標設定"
                    >
                        <Target size={20} />
                    </button>
                    <button 
                        onClick={handleOpenStatsChart}
                        className="p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-400 transition-all shadow-sm border border-purple-200 dark:border-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        title="統計圖表"
                    >
                        <BarChart3 size={20} />
                    </button>
                    <button 
                        onClick={handleOpenShareCard}
                        className="p-3 bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 rounded-full text-pink-600 dark:text-pink-400 transition-all shadow-sm border border-pink-200 dark:border-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        title="分享卡片"
                    >
                        <Share2 size={20} />
                    </button>
                    <button 
                        onClick={handleShowAchievements}
                        className="p-3 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-full text-amber-600 dark:text-amber-400 transition-all shadow-sm border border-amber-200 dark:border-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        title="成就"
                    >
                        <Trophy size={20} />
                    </button>
                </div>

                {/* Mobile: More menu dropdown */}
                <div className="relative lg:hidden">
                    <button 
                        onClick={() => setShowMoreMenu(prev => !prev)}
                        className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200 dark:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        title="更多功能"
                        aria-expanded={showMoreMenu}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    {showMoreMenu && (
                        <>
                            <div className="fixed inset-0 z-30" aria-hidden onClick={handleCloseMoreMenu} />
                            <div className="absolute right-0 top-full mt-2 py-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 animate-in fade-in slide-in-from-top-2">
                                <button onClick={() => { handleOpenReminder(); handleCloseMoreMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <Bell size={20} className="text-cyan-500 shrink-0" /> 提醒設定
                                </button>
                                <button onClick={() => { handleOpenGoals(); handleCloseMoreMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <Target size={20} className="text-indigo-500 shrink-0" /> 目標設定
                                </button>
                                <button onClick={() => { handleOpenStatsChart(); handleCloseMoreMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <BarChart3 size={20} className="text-purple-500 shrink-0" /> 統計圖表
                                </button>
                                <button onClick={() => { handleOpenShareCard(); handleCloseMoreMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <Share2 size={20} className="text-pink-500 shrink-0" /> 分享卡片
                                </button>
                                <button onClick={() => { handleShowAchievements(); handleCloseMoreMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <Trophy size={20} className="text-amber-500 shrink-0" /> 成就
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* World Map Toggle Button */}
                <button 
                    onClick={handleGoToWorld}
                    className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full font-bold transition-all shadow-sm border border-indigo-100 dark:border-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                    <MapIcon size={20} />
                    <span className="hidden md:inline">前往世界</span>
                </button>

                <button 
                    onClick={handleToggleSettings}
                    className="p-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-all shadow-sm border border-slate-200 dark:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    title="設定"
                >
                    <Settings size={22} />
                </button>
            
            {/* Settings Dropdown */}
            <SettingsDropdown
              isOpen={showSettings}
              onClose={handleCloseSettings}
              gameState={gameState}
              activeHabit={activeHabit}
              onExportData={handleExportData}
              onImportClick={handleImportClick}
              onShowHallOfFame={handleShowHallOfFame}
              onResetProgress={resetProgress}
              updateStampStyle={updateStampStyle}
              setCalendarStyle={setCalendarStyle}
              setSoundEffect={setSoundEffect}
              debugDate={debugDate}
              setDebugDate={setDebugDate}
              debugStartDate={debugStartDate}
              setDebugStartDate={setDebugStartDate}
              debugEndDate={debugEndDate}
              setDebugEndDate={setDebugEndDate}
              onDebugStamp={handleDebugStamp}
              onDebugRangeStamp={handleDebugRangeStamp}
            />
            </div>
        </div>

        {/* Habit Switcher Bar */}
        <HabitSwitcher 
            gameState={gameState} 
            onSwitch={handleSwitchHabit} 
            onAdd={handleOpenAddModal} 
            onOpenCompendium={handleOpenCompendium}
        />
      </header>

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
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${calendarMode === 'single' ? 'bg-white dark:bg-slate-600 text-orange-500 dark:text-orange-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                      <CalendarIcon size={14} /> 單項
                  </button>
                  <button 
                     onClick={handleSetCalendarModeOverall}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${calendarMode === 'overall' ? 'bg-white dark:bg-slate-600 text-indigo-500 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                      <LayoutGrid size={14} /> 整體
                  </button>
              </div>
          </div>

          {/* Calendar: min-height so full calendar + button fit; no scroll container */}
          <div className="relative min-h-[540px] rounded-[2rem] overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg">
            {/* Dot grid background – light theme */}
            <div
              className="absolute inset-0 pointer-events-none z-0 dark:hidden"
              style={{ backgroundImage: 'radial-gradient(rgb(229, 231, 235) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
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
    </div>
  );
}

export default App;
