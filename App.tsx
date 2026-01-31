
import React, { useState, useRef } from 'react';
import { useHabitEngine } from './hooks/useHabitEngine';
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
import { Sprout, Map as MapIcon, Calendar as CalendarIcon, LayoutGrid, Trophy, Settings } from 'lucide-react';
import { playStampSound } from './utils/audio';

function App() {
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
    dismissToast
  } = useHabitEngine();

  const [justStamped, setJustStamped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
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

  if (!isLoaded) return <div className="h-screen w-full bg-slate-50 flex items-center justify-center text-slate-400 font-medium">載入中...</div>;

  // Initial Onboarding (if no habits exist)
  if (!gameState.isOnboarded) {
    return <Onboarding onComplete={(name, icon, color, stampColor) => addHabit(name, icon, color, stampColor)} />;
  }

  // Safety check
  if (!activeHabit) {
      return <div>Loading habit...</div>;
  }

  const handleStamp = () => {
    playStampSound(gameState.selectedSound);
    stampToday();
    setJustStamped(true);
    setTimeout(() => setJustStamped(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(gameState);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growday_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
      if (confirm('匯入備份將會覆蓋目前的進度，確定要繼續嗎？')) {
          fileInputRef.current?.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Reset input so same file can be selected again if needed
      e.target.value = '';
  };

  const handleDebugStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (debugDate) {
      debugStampDate(debugDate);
      setJustStamped(true); 
      setTimeout(() => setJustStamped(false), 2000);
      alert(`已成功模擬 ${debugDate} 的打卡紀錄！`);
    }
  };

  const handleDebugRangeStamp = (e: React.FormEvent) => {
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
  };

  const currentMonthCount = getMonthlyCount(new Date().getFullYear(), new Date().getMonth());

  // --- WORLD VIEW RENDER ---
  if (currentView === 'world') {
      return (
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 lg:p-8 relative flex flex-col items-center">
              <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-xl p-4 lg:p-8 min-h-[90vh]">
                  <WorldView 
                      gameState={gameState}
                      onBack={() => setCurrentView('habits')}
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
                      onDismiss={() => dismissToast(newlyUnlockedAchievements[0].id)} 
                  />
              )}
          </div>
      );
  }

  // --- MAIN HABIT VIEW RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 lg:p-8 relative">
      
      {/* Toast Notification Layer */}
      {newlyUnlockedAchievements.length > 0 && (
          <AchievementToast 
              achievement={newlyUnlockedAchievements[0]} 
              onDismiss={() => dismissToast(newlyUnlockedAchievements[0].id)} 
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
            onClose={() => setShowCompendium(false)} 
          />
      )}

      {/* Hall of Fame Modal */}
      {showHallOfFame && (
          <HallOfFame 
            retiredPets={gameState.retiredPets}
            onClose={() => setShowHallOfFame(false)}
          />
      )}

      {/* Achievement Modal */}
      {showAchievements && (
          <AchievementList 
            unlockedIds={gameState.unlockedAchievements}
            onClose={() => setShowAchievements(false)}
          />
      )}

      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center px-2 mb-4">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Sprout size={24} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">GrowDay</h1>
            </div>

            <div className="flex items-center gap-2 relative z-40">
                {/* Achievement Button */}
                <button 
                    onClick={() => setShowAchievements(true)}
                    className="p-3 bg-amber-50 hover:bg-amber-100 rounded-full text-amber-600 transition-all shadow-sm border border-amber-200"
                    title="成就"
                >
                    <Trophy size={20} />
                </button>

                {/* World Map Toggle Button */}
                <button 
                    onClick={() => setCurrentView('world')}
                    className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold transition-all shadow-sm border border-indigo-100"
                >
                    <MapIcon size={20} />
                    <span className="hidden md:inline">前往世界</span>
                </button>

                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-500 transition-all shadow-sm border border-slate-200"
                    title="設定"
                >
                    <Settings size={22} />
                </button>
            
            {/* Settings Dropdown */}
            <SettingsDropdown
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              gameState={gameState}
              activeHabit={activeHabit}
              onExportData={handleExportData}
              onImportClick={handleImportClick}
              onShowHallOfFame={() => { setShowHallOfFame(true); setShowSettings(false); }}
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
            onSwitch={switchHabit} 
            onAdd={() => setShowAddModal(true)} 
            onOpenCompendium={() => setShowCompendium(true)}
        />
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[calc(100vh-10rem)]">
        
        {/* Left Column: Pet World (Taking up 7 columns on desktop) */}
        <section className="lg:col-span-7 flex flex-col min-h-min transition-all duration-500">
          <PetDisplay 
            habit={activeHabit} 
            justStamped={justStamped} 
            className="w-full shadow-lg border border-slate-100"
            onRetire={retireHabit}
          />
        </section>

        {/* Right Column: Stats & Calendar (Taking up 5 columns on desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-6 lg:h-full">
          {/* Top: Stats (Only for single habit, but we keep it here as context) */}
          <div className="flex-shrink-0">
            <StatsBar habit={activeHabit} monthlyCount={currentMonthCount} />
          </div>

          {/* Calendar Toggle */}
          <div className="flex justify-end px-2 -mb-2 z-10">
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner">
                  <button 
                     onClick={() => setCalendarMode('single')}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${calendarMode === 'single' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      <CalendarIcon size={14} /> 單項
                  </button>
                  <button 
                     onClick={() => setCalendarMode('overall')}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${calendarMode === 'overall' ? 'bg-white text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      <LayoutGrid size={14} /> 整體
                  </button>
              </div>
          </div>

          {/* Bottom: Calendar */}
          <div className="flex-1 min-h-[450px]">
             {calendarMode === 'single' ? (
                <CalendarView 
                  habit={activeHabit} 
                  onStamp={handleStamp}
                  isTodayStamped={isTodayStamped()}
                  style={gameState.calendarStyle} // Pass the style
                  selectedSound={gameState.selectedSound}
                />
             ) : (
                <OverallCalendarView 
                    habits={gameState.habits} 
                    style={gameState.calendarStyle} // Pass the style
                />
             )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
