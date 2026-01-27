
import React, { useState } from 'react';
import { getCalendarDays, formatMonthYear, getTodayString } from '../utils/dateUtils';
import { Habit, CalendarStyle } from '../types';
import { getStampIcon, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Cherry, Flower2, Scroll, Star } from 'lucide-react';
import DailyStampModal from './DailyStampModal';

interface Props {
  habit: Habit;
  onStamp: (x?: number, y?: number, rotation?: number) => void;
  isTodayStamped: boolean;
  style?: CalendarStyle;
}

const CalendarView: React.FC<Props> = ({ habit, onStamp, isTodayStamped, style = 'handdrawn' }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [showStampModal, setShowStampModal] = useState(false);
  
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const days = getCalendarDays(year, month);
  const todayStr = getTodayString();
  const stampColor = habit.stampColor || DEFAULT_STAMP_COLOR;

  const CurrentActionIcon = getStampIcon(habit.stampIcon);

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const handleStampConfirm = (x: number, y: number, rotation: number) => {
      onStamp(x, y, rotation);
      setShowStampModal(false);
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // --- THEME CONFIGURATION ---
  const getTheme = (s: CalendarStyle) => {
      switch(s) {
          case 'minimal':
              return {
                  container: 'bg-white rounded-3xl shadow-sm border border-slate-100',
                  headerText: 'text-slate-800 font-bold',
                  headerSub: 'text-slate-400 font-normal',
                  grid: 'gap-2',
                  dayCell: 'rounded-xl bg-slate-50',
                  todayCell: 'ring-2 ring-slate-800 ring-offset-2',
                  emptyCell: 'hidden', // Minimalist doesn't show empty placeholders
                  button: 'bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800',
                  decor: null
              };
          case 'cny':
              return {
                  container: 'bg-red-50 rounded-3xl border-4 border-red-800 shadow-xl relative overflow-hidden',
                  headerText: 'text-red-900 font-black tracking-widest',
                  headerSub: 'text-red-600',
                  grid: 'gap-3',
                  dayCell: 'rounded-full border border-red-200 bg-white/80',
                  todayCell: 'bg-red-100 border-red-500',
                  emptyCell: 'border-2 border-dashed border-red-200/50 rounded-full',
                  button: 'bg-red-700 text-amber-100 rounded-full border-2 border-amber-300 shadow-lg font-bold tracking-widest',
                  decor: (
                      <>
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute top-0 right-0 p-4 text-red-800/20 rotate-12"><Flower2 size={64} /></div>
                        <div className="absolute bottom-20 left-4 text-red-800/10 -rotate-12"><Scroll size={48} /></div>
                      </>
                  )
              };
          case 'japanese':
              return {
                  container: 'bg-[#f4f1ea] rounded-xl shadow-md border border-[#d4d1ca] relative',
                  headerText: 'text-[#4a4a4a] font-serif',
                  headerSub: 'text-[#8a8a8a] text-xs',
                  grid: 'gap-4',
                  dayCell: 'rounded-sm border-b border-[#e0ded9]', // Minimal lines
                  todayCell: 'bg-[#e8e6df]',
                  emptyCell: 'border-b border-[#e0ded9] border-dashed',
                  button: 'bg-[#5c5a55] text-[#f4f1ea] rounded-md shadow-sm tracking-widest',
                  decor: (
                      <>
                        <div className="absolute top-2 left-2 text-pink-300/40"><Cherry size={24} /></div>
                        <div className="absolute bottom-2 right-2 text-pink-300/30 rotate-45"><Cherry size={32} /></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-30 pointer-events-none"></div>
                      </>
                  )
              };
          case 'american':
              return {
                  container: 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none relative',
                  headerText: 'text-black font-black uppercase italic text-3xl',
                  headerSub: 'text-black bg-yellow-300 px-2 font-bold -rotate-2 inline-block',
                  grid: 'gap-2',
                  dayCell: 'border-2 border-black rounded-none hover:bg-yellow-100 transition-colors',
                  todayCell: 'bg-blue-100',
                  emptyCell: 'border-2 border-dashed border-gray-300',
                  button: 'bg-black text-white border-2 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase text-xl',
                  decor: (
                      <>
                         <div className="absolute -top-6 -right-6 text-yellow-400 rotate-12 stroke-black stroke-2"><Star size={48} fill="currentColor" /></div>
                      </>
                  )
              };
          case 'handdrawn':
          default:
              return {
                  container: 'bg-[#fdfbf7] border-2 border-slate-800/5 shadow-md relative',
                  headerText: 'text-slate-700 font-black tracking-tighter',
                  headerSub: 'text-slate-400 font-medium',
                  grid: 'gap-2',
                  dayCell: '', // Custom logic in render
                  todayCell: '',
                  emptyCell: 'border-2 border-dashed border-slate-200/60 rounded-full',
                  button: '', // Custom logic in render
                  decor: (
                      <>
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-orange-200/80 rotate-[-2deg] z-20 backdrop-blur-[1px] shadow-sm" style={{ clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0% 100%)' }}></div>
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/50 rotate-[1deg] z-10" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 100%, 2% 100%)' }}></div>
                         <div className="absolute top-4 right-4 text-amber-400 opacity-50 rotate-12"><Sparkles size={24} /></div>
                         <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      </>
                  )
              };
      }
  };

  const theme = getTheme(style);

  // Hand-drawn border radius generator (Only for handdrawn mode)
  const getHandDrawnStyle = () => style === 'handdrawn' ? ({
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
  }) : {};

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Immersive Stamp Modal */}
      {showStampModal && (
          <DailyStampModal 
            habitName={habit.name}
            stampIconId={habit.stampIcon}
            stampColor={stampColor}
            onClose={() => setShowStampModal(false)}
            onConfirm={handleStampConfirm}
          />
      )}

      {/* Main Calendar Container */}
      <div 
        className={`flex-1 flex flex-col p-6 lg:p-8 relative transition-all duration-300 ${theme.container}`}
        style={getHandDrawnStyle()}
      >
        {theme.decor}

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 px-2 relative z-10 pt-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-black/5 rounded-full transition-colors text-inherit opacity-60">
                <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
                <h3 className={`text-2xl ${theme.headerText}`}>
                    {displayDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} 
                    <span className={`text-lg ml-2 ${theme.headerSub}`}>{year}</span>
                </h3>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 rounded-full transition-colors text-inherit opacity-60">
                <ChevronRight size={24} />
            </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-4 relative z-10">
            {weekDays.map((day, i) => (
            <div key={day} className={`text-center text-[10px] font-bold tracking-widest ${(i === 0 || i === 6) && style !== 'american' ? 'text-orange-400' : 'text-slate-400'}`}>
                {day}
            </div>
            ))}
        </div>

        {/* Days Grid */}
        <div className={`grid grid-cols-7 mb-6 flex-1 content-start relative z-10 ${theme.grid}`}>
            {days.map((dateStr, index) => {
            if (!dateStr) return <div key={`empty-${index}`} className={`aspect-square ${theme.emptyCell}`} />;

            const log = habit.logs[dateStr];
            const isStamped = log?.stamped;
            const isToday = dateStr === todayStr;
            
            const dayIconId = log?.icon || habit.stampIcon;
            const dayColor = log?.color || stampColor;
            const DayStampIcon = getStampIcon(dayIconId);
            
            const posX = log?.position?.x ?? 50;
            const posY = log?.position?.y ?? 50;
            const rotation = log?.position?.rotation ?? 0;

            return (
                <div key={dateStr} className="flex flex-col items-center justify-center relative group aspect-square">
                
                {/* Day Cell Background */}
                <div 
                    className={`
                    relative w-full h-full flex items-center justify-center transition-all duration-300
                    ${theme.dayCell}
                    ${isToday && !isStamped ? (style === 'handdrawn' ? 'bg-yellow-100/50' : theme.todayCell) : ''} 
                    `}
                    style={style === 'handdrawn' ? {
                        borderRadius: isToday ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '12px',
                    } : {}}
                >
                    {/* Handdrawn specific dashed circle placeholder */}
                    {style === 'handdrawn' && !isStamped && !isToday && (
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200/60"></div>
                    )}

                    {/* Date Number */}
                    <span className={`
                        absolute font-bold text-sm z-0
                        ${isStamped ? 'opacity-50' : 'opacity-100'}
                        ${style === 'american' ? 'text-black' : (style === 'cny' ? 'text-red-900' : 'text-slate-600')}
                        ${isToday && !isStamped && style !== 'american' ? 'scale-110 text-slate-900' : ''}
                    `}>
                        {parseInt(dateStr.split('-')[2])}
                    </span>

                    {/* The Stamp Icon */}
                    {isStamped && (
                        <div 
                            className="absolute z-10 drop-shadow-sm animate-in zoom-in spin-in-3 duration-300 pointer-events-none mix-blend-multiply"
                            style={{
                                color: style === 'american' ? 'black' : dayColor, // American style uses black ink sometimes, but let's keep color for fun
                                left: `${posX}%`,
                                top: `${posY}%`,
                                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${style === 'minimal' ? 1.2 : 1.4})`
                            }}
                        >
                            <DayStampIcon size={28} strokeWidth={style === 'american' ? 3 : 2.5} className="opacity-90" />
                        </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>

        {/* Action Button Area */}
        <div className="mt-auto pt-2 relative z-30">
            <button
            onClick={() => {
                if(!isTodayStamped) setShowStampModal(true);
            }}
            disabled={isTodayStamped}
            className={`
                w-full py-4 font-bold text-lg transition-all transform flex items-center justify-center gap-3 active:scale-95
                ${style === 'handdrawn' 
                    ? `rounded-xl border-b-4 active:border-b-0 active:translate-y-1 ${isTodayStamped ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default' : 'text-white hover:brightness-110'}` 
                    : theme.button
                }
                ${style === 'minimal' && isTodayStamped ? 'bg-slate-100 text-slate-400 shadow-none hover:bg-slate-100 cursor-default' : ''}
                ${style === 'cny' && isTodayStamped ? 'bg-red-100 text-red-300 border-red-200 shadow-none cursor-default' : ''}
                ${style === 'japanese' && isTodayStamped ? 'bg-[#e0ded9] text-[#b0aeab] shadow-none cursor-default' : ''}
                ${style === 'american' && isTodayStamped ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none hover:shadow-none cursor-default hover:bg-gray-100 hover:text-gray-400' : ''}
            `}
            style={(style === 'handdrawn' && !isTodayStamped) ? { backgroundColor: stampColor, borderColor: 'rgba(0,0,0,0.1)' } : {}}
            >
                {isTodayStamped ? (
                    <>
                        <CheckCircle2 size={22} />
                        <span className="tracking-wide">完成紀錄</span>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <CurrentActionIcon size={22} className="animate-bounce" />
                        </div>
                        <span className="tracking-wide">蓋下印章</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
