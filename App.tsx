import React, { useState } from 'react';
import { useHabitEngine } from './hooks/useHabitEngine';
import PetDisplay from './components/PetDisplay';
import CalendarView from './components/CalendarView';
import Onboarding from './components/Onboarding';
import StatsBar from './components/StatsBar';
import { STAMP_OPTIONS, getStampIcon } from './utils/stampIcons';
import { Settings, RefreshCw, Sprout, FlaskConical, Check, CalendarRange, Stamp } from 'lucide-react';

function App() {
  const { 
    gameState, 
    isLoaded, 
    completeOnboarding, 
    updateStampIcon,
    stampToday, 
    debugStampDate,
    debugStampRange,
    isTodayStamped, 
    getMonthlyCount,
    resetProgress
  } = useHabitEngine();

  const [justStamped, setJustStamped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  
  // Debug states
  const [debugDate, setDebugDate] = useState('');
  const [debugStartDate, setDebugStartDate] = useState('');
  const [debugEndDate, setDebugEndDate] = useState('');

  if (!isLoaded) return <div className="h-screen w-full bg-slate-50 flex items-center justify-center text-slate-400 font-medium">載入中...</div>;

  if (!gameState.isOnboarded) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const handleStamp = () => {
    stampToday();
    setJustStamped(true);
    setTimeout(() => setJustStamped(false), 2000);
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 lg:p-8">
      
      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
             <Sprout size={24} fill="currentColor" />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">GrowDay</h1>
        </div>

        <div className="relative z-50">
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
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">設定</div>
                
                {/* Reset Button */}
                <button 
                  onClick={resetProgress}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium mb-1"
                >
                  <RefreshCw size={16} />
                  重置我的世界
                </button>

                {/* Change Icon Toggle */}
                <button 
                  onClick={() => setShowIconSelector(!showIconSelector)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  <Stamp size={16} />
                  更換打卡印章
                </button>

                {/* Icon Selector Grid */}
                {showIconSelector && (
                  <div className="bg-slate-50 p-3 m-2 rounded-xl grid grid-cols-5 gap-2 border border-slate-100">
                    {STAMP_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = gameState.stampIcon === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => updateStampIcon(option.id)}
                            className={`
                                aspect-square flex items-center justify-center rounded-lg transition-all
                                ${isSelected 
                                    ? 'bg-orange-500 text-white shadow-md' 
                                    : 'bg-white text-slate-400 hover:bg-orange-100 hover:text-orange-500'
                                }
                            `}
                            title={option.label}
                          >
                             <Icon size={18} fill={isSelected ? "currentColor" : "none"} />
                          </button>
                        );
                    })}
                  </div>
                )}

                {/* Developer Tools Section */}
                <div className="border-t border-slate-100 my-2 pt-2">
                   <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FlaskConical size={12} />
                      開發者測試
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
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[calc(100vh-8rem)]">
        
        {/* Left Column: Pet World (Taking up 7 columns on desktop) */}
        <section className="lg:col-span-7 flex flex-col h-[500px] lg:h-auto">
          <PetDisplay 
            gameState={gameState} 
            justStamped={justStamped} 
            className="h-full w-full shadow-lg border border-slate-100"
          />
        </section>

        {/* Right Column: Stats & Calendar (Taking up 5 columns on desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-6 lg:h-full">
          {/* Top: Stats */}
          <div className="flex-shrink-0">
            <StatsBar gameState={gameState} monthlyCount={currentMonthCount} />
          </div>

          {/* Bottom: Calendar */}
          <div className="flex-1 min-h-[450px]">
            <CalendarView 
              gameState={gameState} 
              onStamp={handleStamp}
              isTodayStamped={isTodayStamped()}
            />
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
