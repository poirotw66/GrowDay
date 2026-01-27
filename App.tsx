
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
import { STAMP_OPTIONS, STAMP_COLORS } from './utils/stampIcons';
import { Settings, RefreshCw, Sprout, FlaskConical, Check, CalendarRange, Stamp, Lock, Map as MapIcon, Calendar as CalendarIcon, LayoutGrid, Download, Upload, Medal, Palette, ChevronRight, Trophy, Volume2, VolumeX } from 'lucide-react';
import { playStampSound, SOUND_OPTIONS } from './utils/audio';
import { CalendarStyle } from './types';

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
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false); // New state for style selector
  const [showSoundSelector, setShowSoundSelector] = useState(false); // New state for sound selector
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

  const styles: {id: CalendarStyle, label: string}[] = [
      { id: 'minimal', label: '極簡風格' },
      { id: 'handdrawn', label: '手繪溫暖' },
      { id: 'cny', label: '新春禮節' },
      { id: 'japanese', label: '日式和風' },
      { id: 'american', label: '美式日記' },
  ];

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
            {showSettings && (
                <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-xl p-2 w-80 border border-slate-100 animate-in fade-in slide-in-from-top-2 overflow-hidden max-h-[80vh] overflow-y-auto z-50">
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">資料管理</div>
                    
                    {/* Backup & Restore */}
                    <div className="flex gap-2 px-2 mb-2">
                        <button 
                           onClick={handleExportData}
                           className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl transition-colors text-slate-600 text-xs font-bold"
                        >
                            <Download size={18} />
                            匯出備份
                        </button>
                        <button 
                           onClick={handleImportClick}
                           className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl transition-colors text-slate-600 text-xs font-bold"
                        >
                            <Upload size={18} />
                            匯入備份
                        </button>
                    </div>

                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">設定</div>
                    
                    {/* Sound Settings */}
                    <button 
                        onClick={() => setShowSoundSelector(!showSoundSelector)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium mb-1"
                    >
                        <div className="flex items-center gap-3">
                            <Volume2 size={16} />
                            打卡音效
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${showSoundSelector ? 'rotate-90' : ''}`} />
                    </button>

                    {showSoundSelector && (
                        <div className="bg-slate-50 p-2 m-2 rounded-xl border border-slate-100 space-y-1">
                            {SOUND_OPTIONS.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => {
                                        setSoundEffect(sound.id);
                                        playStampSound(sound.id);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center ${gameState.selectedSound === sound.id ? 'bg-white text-indigo-500 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-200'}`}
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
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                    >
                        <div className="flex items-center gap-3">
                            <Palette size={16} />
                            日曆外觀風格
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${showStyleSelector ? 'rotate-90' : ''}`} />
                    </button>

                    {showStyleSelector && (
                        <div className="bg-slate-50 p-2 m-2 rounded-xl border border-slate-100 space-y-1">
                            {styles.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setCalendarStyle(style.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center ${gameState.calendarStyle === style.id ? 'bg-white text-orange-500 shadow-sm border border-orange-100' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {style.label}
                                    {gameState.calendarStyle === style.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Hall of Fame */}
                    <button 
                        onClick={() => { setShowHallOfFame(true); setShowSettings(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 rounded-xl transition-colors font-medium mb-1"
                    >
                        <Medal size={16} />
                        榮譽殿堂 (退休紀錄)
                    </button>

                    {/* Change Icon Toggle */}
                    <button 
                        onClick={() => setShowIconSelector(!showIconSelector)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                    >
                        <Stamp size={16} />
                        更換打卡樣式
                    </button>

                    {/* Icon Selector Grid */}
                    {showIconSelector && (
                    <div className="bg-slate-50 p-3 m-2 rounded-xl border border-slate-100">
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
                                    onClick={() => isUnlocked && updateStampStyle(option.id, activeHabit.stampColor)}
                                    className={`
                                        relative aspect-square flex items-center justify-center rounded-lg transition-all group
                                        ${isSelected 
                                            ? 'bg-slate-800 text-white shadow-md' 
                                            : isUnlocked
                                                ? 'bg-white text-slate-400 hover:bg-slate-100'
                                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        }
                                    `}
                                    title={isUnlocked ? option.label : option.unlockHint}
                                >
                                    <Icon size={18} fill={isSelected ? "currentColor" : "none"} />
                                    
                                    {/* Lock Overlay */}
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-lg">
                                            <Lock size={12} className="text-slate-400" />
                                        </div>
                                    )}
                                </button>
                                );
                            })}
                        </div>

                        {/* Colors */}
                        <div className="flex flex-wrap gap-2 justify-center border-t border-slate-200 pt-3">
                            {STAMP_COLORS.map(color => {
                                const isSelected = activeHabit.stampColor === color.hex;
                                return (
                                    <button
                                        key={color.id}
                                        onClick={() => updateStampStyle(activeHabit.stampIcon, color.hex)}
                                        className={`w-6 h-6 rounded-full transition-transform ${isSelected ? 'scale-125 ring-2 ring-slate-300 ring-offset-1' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: color.hex }}
                                    >
                                        {isSelected && <Check size={10} className="text-white mx-auto" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    )}

                    {/* Reset Button */}
                    <button 
                        onClick={resetProgress}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium mb-1"
                    >
                        <RefreshCw size={16} />
                        重置所有資料
                    </button>

                    {/* Developer Tools Section */}
                    <div className="border-t border-slate-100 my-2 pt-2">
                    <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FlaskConical size={12} />
                        開發者測試 (當前習慣)
                    </div>
                    
                    {/* Single Date Stamp */}
                    <form onSubmit={handleDebugStamp} className="p-3 bg-slate-50 rounded-xl m-2 border border-slate-100">
                        <p className="text-xs text-slate-500 mb-2 font-medium">單日補簽：</p>
                        <div className="flex gap-2">
                            <input 
                            type="date" 
                            required
                            value={debugDate}
                            onChange={(e) => setDebugDate(e.target.value)}
                            className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
                            />
                            <button 
                            type="submit"
                            className="bg-amber-100 hover:bg-amber-200 text-amber-600 p-2 rounded-lg transition-colors"
                            >
                            <Check size={14} />
                            </button>
                        </div>
                    </form>

                    {/* Range Stamp */}
                    <form onSubmit={handleDebugRangeStamp} className="p-3 bg-slate-50 rounded-xl m-2 border border-slate-100">
                        <p className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1">
                            <CalendarRange size={12} />
                            區間補簽：
                        </p>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 w-8">開始</span>
                                <input 
                                type="date" 
                                required
                                value={debugStartDate}
                                onChange={(e) => setDebugStartDate(e.target.value)}
                                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 w-8">結束</span>
                                <input 
                                type="date" 
                                required
                                value={debugEndDate}
                                onChange={(e) => setDebugEndDate(e.target.value)}
                                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
                                />
                            </div>
                            <button 
                            type="submit"
                            className="w-full mt-1 bg-amber-100 hover:bg-amber-200 text-amber-600 p-2 rounded-lg transition-colors text-xs font-bold"
                            >
                            執行區間打卡
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            )}
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
