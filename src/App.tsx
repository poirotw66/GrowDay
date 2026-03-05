import React, { useState, useCallback } from 'react';
import { useHabitEngine } from './hooks/useHabitEngine';
import { useDailyReminder } from './hooks/useDailyReminder';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Onboarding from './components/Onboarding';
import EntryChoice, { getGuestChoiceStored } from './components/EntryChoice';
import WorldViewPage from './views/WorldViewPage';
import MainHabitView from './views/MainHabitView';

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

  const [choseGuest, setChoseGuest] = useState(false);

  useTheme(); // Ensures theme is applied (e.g. class on document)

  // Navigation State
  const [currentView, setCurrentView] = useState<'habits' | 'world'>('habits');
  useDailyReminder(activeHabit ?? null);

  // Memoized callbacks for child components
  const handleSwitchHabit = useCallback((id: string) => switchHabit(id), [switchHabit]);
  const handleGoToWorld = useCallback(() => setCurrentView('world'), []);
  const handleDismissToast = useCallback(() => {
    if (newlyUnlockedAchievements.length > 0) {
      dismissToast(newlyUnlockedAchievements[0].id);
    }
  }, [newlyUnlockedAchievements, dismissToast]);
  const handleBackFromWorld = useCallback(() => setCurrentView('habits'), []);

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

  if (currentView === 'world') {
    return (
      <WorldViewPage
        gameState={gameState}
        newlyUnlockedAchievements={newlyUnlockedAchievements}
        onDismissToast={handleDismissToast}
        onBack={handleBackFromWorld}
        buyDecoration={buyDecoration}
        placeDecoration={placeDecoration}
        removeDecoration={removeDecoration}
        placePetInArea={placePetInArea}
        removePetFromArea={removePetFromArea}
        unlockArea={unlockArea}
      />
    );
  }

  return (
    <MainHabitView
      gameState={gameState}
      activeHabit={activeHabit}
      syncStatus={syncStatus}
      newlyUnlockedAchievements={newlyUnlockedAchievements}
      isFirebaseEnabled={isFirebaseEnabled}
      user={user}
      signInWithGoogle={signInWithGoogle}
      signOut={signOut}
      signInLoading={signInLoading}
      onDismissToast={handleDismissToast}
      onGoToWorld={handleGoToWorld}
      onSwitchHabit={handleSwitchHabit}
      onRetireHabit={retireHabit}
      onResetProgress={resetProgress}
      onExportData={(state) => {
        const dataStr = JSON.stringify(state);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `growday_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }}
      onImportData={(content) => importSaveData(content)}
      updateStampStyle={updateStampStyle}
      setCalendarStyle={setCalendarStyle}
      setSoundEffect={setSoundEffect}
      updatePetNickname={updatePetNickname}
      renameHabit={renameHabit}
      deleteHabit={deleteHabit}
      addCustomStamp={addCustomStamp}
      deleteCustomStamp={deleteCustomStamp}
      stampToday={stampToday}
      isTodayStamped={isTodayStamped}
      getMonthlyCount={getMonthlyCount}
      debugStampDate={debugStampDate}
      debugStampRange={debugStampRange}
    />
  );
}

export default App;
