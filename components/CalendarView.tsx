
import React, { useState } from 'react';
import { getCalendarDays, getTodayString } from '../utils/dateUtils';
import { Habit, CalendarStyle } from '../types';
import { STAMP_ICONS, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { 
    ChevronLeft, ChevronRight, CheckCircle2, 
    Sparkles, Cherry, Flower2, Star,
    Snowflake, Heart, CloudRain, Sun, Cloud, Leaf, Ghost, Gift, Moon, Umbrella, Clover
} from 'lucide-react';
import DailyStampModal from './DailyStampModal';

interface Props {
  habit: Habit;
  onStamp: (x?: number, y?: number, rotation?: number) => void;
  isTodayStamped: boolean;
  style?: CalendarStyle;
  selectedSound: string;
}

const CalendarView: React.FC<Props> = ({ habit, onStamp, isTodayStamped, style = 'handdrawn' as CalendarStyle, selectedSound }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [showStampModal, setShowStampModal] = useState(false);
  
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth(); // 0-11
  const days = getCalendarDays(year, month);
  const todayStr = getTodayString();
  const stampColor = habit.stampColor || DEFAULT_STAMP_COLOR;

  // Get the icon component directly from the record - avoid useMemo to prevent static-components error
  const StampIcon = STAMP_ICONS[habit.stampIcon] || Star;

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

  // --- MONTHLY THEME CONFIGURATION ---

  // Helper: Get Monthly Doodle/Icon & Color
  const getMonthlyProps = (m: number) => {
      const seasonal = [
          { color: '#3b82f6', icon: Snowflake, label: 'JAN' }, // Jan: Winter Blue
          { color: '#ec4899', icon: Heart, label: 'FEB' },     // Feb: Valentine Pink
          { color: '#22c55e', icon: Clover, label: 'MAR' },    // Mar: Spring Green
          { color: '#a855f7', icon: CloudRain, label: 'APR' }, // Apr: Rain Purple
          { color: '#eab308', icon: Flower2, label: 'MAY' },   // May: Flower Yellow
          { color: '#f97316', icon: Sun, label: 'JUN' },       // Jun: Summer Orange
          { color: '#06b6d4', icon: Umbrella, label: 'JUL' },  // Jul: Pool Cyan
          { color: '#10b981', icon: Cloud, label: 'AUG' },     // Aug: Nature Teal
          { color: '#d97706', icon: Leaf, label: 'SEP' },      // Sep: Autumn Brown
          { color: '#f59e0b', icon: Ghost, label: 'OCT' },     // Oct: Halloween Pumpkin
          { color: '#94a3b8', icon: Moon, label: 'NOV' },      // Nov: Cool Grey
          { color: '#ef4444', icon: Gift, label: 'DEC' },      // Dec: Festive Red
      ];
      return seasonal[m % 12];
  };

  const currentMonthProps = getMonthlyProps(month);
  const DoodleIcon = currentMonthProps.icon;

  const getTheme = (s: CalendarStyle) => {
      switch(s) {
          case 'minimal':
              // Minimal: Changes accent color subtly based on season
              return {
                  container: 'bg-white rounded-3xl shadow-sm border border-slate-100',
                  headerText: 'text-slate-800 font-bold',
                  headerSub: 'font-normal opacity-40',
                  grid: 'gap-2',
                  dayCell: 'rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors',
                  todayCell: '', // Custom logic below
                  emptyCell: 'hidden',
                  button: 'text-white rounded-xl shadow-lg hover:brightness-110',
                  buttonStyle: { backgroundColor: currentMonthProps.color },
                  decor: (
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                           <DoodleIcon size={120} color={currentMonthProps.color} />
                      </div>
                  )
              };

          case 'cny':
              // CNY: Seasonal motifs (Spring Festival, Lanterns, Moon Festival)
              let cnyDecor;
              let cnyBorderColor = 'border-red-800';
              let cnyBg = 'bg-red-50';

              if (month >= 0 && month <= 2) { // Spring (New Year)
                 cnyDecor = <div className="absolute top-2 right-2 opacity-20 text-red-600 rotate-12"><Flower2 size={64} /></div>;
              } else if (month >= 3 && month <= 5) { // Summer
                 cnyDecor = <div className="absolute bottom-2 right-2 opacity-20 text-red-600 -rotate-12"><Sun size={64} /></div>;
                 cnyBg = 'bg-orange-50';
                 cnyBorderColor = 'border-orange-800';
              } else if (month >= 6 && month <= 8) { // Autumn (Moon Festival)
                 cnyDecor = <div className="absolute top-2 left-2 opacity-20 text-amber-600"><Moon size={64} /></div>;
                 cnyBg = 'bg-amber-50';
                 cnyBorderColor = 'border-amber-800';
              } else { // Winter
                 cnyDecor = <div className="absolute bottom-2 left-2 opacity-20 text-slate-400 rotate-45"><Snowflake size={64} /></div>;
                 cnyBg = 'bg-slate-50';
                 cnyBorderColor = 'border-slate-800';
              }

              return {
                  container: `${cnyBg} rounded-3xl border-4 ${cnyBorderColor} shadow-xl relative overflow-hidden`,
                  headerText: `font-black tracking-widest ${month >= 9 ? 'text-slate-800' : 'text-red-900'}`,
                  headerSub: 'opacity-60',
                  grid: 'gap-3',
                  dayCell: 'rounded-full border border-red-200 bg-white/80',
                  todayCell: 'bg-red-100 border-red-500',
                  emptyCell: 'border-2 border-dashed border-red-200/50 rounded-full',
                  button: `rounded-full border-2 shadow-lg font-bold tracking-widest ${month >= 9 ? 'bg-slate-800 text-white border-slate-600' : 'bg-red-700 text-amber-100 border-amber-300'}`,
                  buttonStyle: {},
                  decor: (
                      <>
                        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-current" style={{ color: currentMonthProps.color }}></div>
                        {cnyDecor}
                      </>
                  )
              };

          case 'japanese':
               // Japanese: Hanafuda style seasonality
               // Jan: Pine/Crane, Feb: Plum, Mar: Cherry, Apr: Wisteria...
               // Simplified to seasons for code brevity
               let jpIcon = <Cherry size={32} />;
               const jpBgPattern = "url('https://www.transparenttextures.com/patterns/rice-paper.png')";
               let jpAccent = "text-pink-400";
               
               if (month === 0) { jpIcon = <Sun size={32} />; jpAccent = "text-red-500"; } // New Year
               else if (month === 10) { jpIcon = <Leaf size={32} />; jpAccent = "text-orange-600"; } // Maple
               else if (month === 6 || month === 7) { jpIcon = <Sparkles size={32} />; jpAccent = "text-blue-400"; } // Summer stars

              return {
                  container: 'bg-[#f4f1ea] rounded-xl shadow-md border border-[#d4d1ca] relative overflow-hidden',
                  headerText: 'text-[#4a4a4a] font-serif',
                  headerSub: 'text-[#8a8a8a] text-xs',
                  grid: 'gap-4',
                  dayCell: 'rounded-sm border-b border-[#e0ded9]', 
                  todayCell: 'bg-[#e8e6df]',
                  emptyCell: 'border-b border-[#e0ded9] border-dashed',
                  button: 'bg-[#5c5a55] text-[#f4f1ea] rounded-md shadow-sm tracking-widest hover:bg-[#4a4843]',
                  buttonStyle: {},
                  decor: (
                      <>
                        <div className={`absolute top-4 left-4 opacity-40 ${jpAccent}`}>{jpIcon}</div>
                        <div className={`absolute bottom-4 right-4 opacity-30 rotate-45 ${jpAccent}`}>{jpIcon}</div>
                        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: jpBgPattern }}></div>
                        {/* Vertical text hint */}
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-[#d4d1ca] writing-vertical font-serif opacity-60 hidden md:block">
                            {year}年{month+1}月
                        </div>
                      </>
                  )
              };

          case 'american':
              // American: Pop Culture / Holiday colors
              // Feb: Pink/Red, Jul: Blue/Red, Oct: Orange/Black, Dec: Red/Green
              let amBorder = 'border-black';
              let amHeaderBg = 'bg-yellow-300';
              const amBg = 'bg-white';
              
              if (month === 1) { // Feb
                  amHeaderBg = 'bg-pink-300';
                  amBorder = 'border-pink-900';
              } else if (month === 9) { // Oct
                  amHeaderBg = 'bg-orange-400';
                  amBorder = 'border-purple-900';
              } else if (month === 11) { // Dec
                  amHeaderBg = 'bg-green-400';
                  amBorder = 'border-red-900';
              }

              return {
                  container: `${amBg} border-4 ${amBorder} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none relative`,
                  headerText: 'text-black font-black uppercase italic text-3xl',
                  headerSub: `text-black ${amHeaderBg} px-2 font-bold -rotate-2 inline-block border-2 border-black`,
                  grid: 'gap-2',
                  dayCell: `border-2 ${amBorder} rounded-none hover:bg-yellow-100 transition-colors`,
                  todayCell: 'bg-blue-200',
                  emptyCell: 'border-2 border-dashed border-gray-300',
                  button: `bg-black text-white border-2 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase text-xl`,
                  buttonStyle: {},
                  decor: (
                      <>
                         <div className="absolute -top-6 -right-6 text-current rotate-12 stroke-black stroke-2" style={{ color: currentMonthProps.color }}>
                            <Star size={48} fill="currentColor" />
                         </div>
                         {/* Halftone pattern effect */}
                         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)', backgroundSize: '16px 16px' }}></div>
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
                  button: '', 
                  buttonStyle: {},
                  decor: (
                      <>
                         {/* Dynamic Washi Tape Color */}
                         <div 
                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 rotate-[-2deg] z-20 backdrop-blur-[1px] shadow-sm opacity-80" 
                            style={{ 
                                backgroundColor: currentMonthProps.color, 
                                clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0% 100%)' 
                            }}
                        ></div>
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/50 rotate-[1deg] z-10" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 100%, 2% 100%)' }}></div>
                         
                         {/* Monthly Doodle */}
                         <div className="absolute top-4 right-4 opacity-50 rotate-12" style={{ color: currentMonthProps.color }}>
                            <DoodleIcon size={28} />
                         </div>
                         
                         <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      </>
                  )
              };
      }
  };

  const theme = getTheme(style as CalendarStyle);

  // Hand-drawn border radius generator
  const getHandDrawnStyle = () => style === 'handdrawn' ? ({
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
  }) : {};

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Dynamic Keyframes for Stamp Animation */}
      <style>{`
        @keyframes stamp-entry {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--rot-start)) scale(2.5); }
          40% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rot-end)) scale(0.9); }
          70% { transform: translate(-50%, -50%) rotate(var(--rot-end)) scale(1.15); }
          100% { transform: translate(-50%, -50%) rotate(var(--rot-end)) scale(var(--scale-end)); opacity: 0.9; }
        }
        .animate-stamp {
          animation: stamp-entry 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {showStampModal && (
          <DailyStampModal 
            habitName={habit.name}
            stampIconId={habit.stampIcon}
            stampColor={stampColor}
            selectedSound={selectedSound}
            onClose={() => setShowStampModal(false)}
            onConfirm={handleStampConfirm}
          />
      )}

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
            const DayStampIcon = STAMP_ICONS[dayIconId] || Star;
            
            const posX = log?.position?.x ?? 50;
            const posY = log?.position?.y ?? 50;
            const rotation = log?.position?.rotation ?? 0;
            const finalScale = style === 'minimal' ? 1.2 : 1.4;

            // Minimalist theme accent color handling for TODAY
            const minimalTodayStyle = style === 'minimal' && isToday && !isStamped 
                ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${currentMonthProps.color}` } 
                : {};

            return (
                <div key={dateStr} className="flex flex-col items-center justify-center relative group aspect-square">
                
                <div 
                    className={`
                    relative w-full h-full flex items-center justify-center transition-all duration-300
                    ${theme.dayCell}
                    ${isToday && !isStamped ? (style === 'handdrawn' ? 'bg-yellow-100/50' : theme.todayCell) : ''} 
                    `}
                    style={{
                        ...minimalTodayStyle,
                        ...(style === 'handdrawn' ? {
                            borderRadius: isToday ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '12px',
                        } : {})
                    }}
                >
                    {style === 'handdrawn' && !isStamped && !isToday && (
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200/60"></div>
                    )}

                    <span className={`
                        absolute font-bold text-sm z-0
                        ${isStamped ? 'opacity-50' : 'opacity-100'}
                        ${style === 'american' ? 'text-black' : (style === 'cny' ? 'text-red-900' : 'text-slate-600')}
                        ${isToday && !isStamped && style !== 'american' ? 'scale-110 text-slate-900' : ''}
                    `}>
                        {parseInt(dateStr.split('-')[2])}
                    </span>

                    {isStamped && (
                        <div 
                            className="absolute z-10 drop-shadow-sm animate-stamp pointer-events-none mix-blend-multiply"
                            style={{
                                color: style === 'american' ? 'black' : dayColor, 
                                left: `${posX}%`,
                                top: `${posY}%`,
                                // Pass dynamic values to CSS variables for keyframes
                                ['--rot-start' as keyof React.CSSProperties]: `${rotation - 15}deg`,
                                ['--rot-end' as keyof React.CSSProperties]: `${rotation}deg`,
                                ['--scale-end' as keyof React.CSSProperties]: finalScale,
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

        {/* Action Button */}
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
            style={{
                ...theme.buttonStyle,
                ...((style === 'handdrawn' && !isTodayStamped) ? { backgroundColor: stampColor, borderColor: 'rgba(0,0,0,0.1)' } : {}),
                ...(style === 'minimal' && isTodayStamped ? { backgroundColor: '#f1f5f9' } : {})
            }}
            >
                {isTodayStamped ? (
                    <>
                        <CheckCircle2 size={22} />
                        <span className="tracking-wide">完成紀錄</span>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <StampIcon size={22} className="animate-bounce" />
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
