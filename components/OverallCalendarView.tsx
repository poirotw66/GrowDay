
import React, { useState } from 'react';
import { getCalendarDays, formatMonthYear, getTodayString } from '../utils/dateUtils';
import { Habit, CalendarStyle } from '../types';
import { ChevronLeft, ChevronRight, Circle, Hexagon, Sun, BookOpen } from 'lucide-react';

interface Props {
  habits: Record<string, Habit>;
  style?: CalendarStyle;
}

const OverallCalendarView: React.FC<Props> = ({ habits, style = 'handdrawn' }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const days = getCalendarDays(year, month);
  const todayStr = getTodayString();

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDailyStats = (dateStr: string) => {
    let count = 0;
    const completedHabitNames: string[] = [];
    
    Object.values(habits).forEach(habit => {
        if (habit.logs[dateStr]?.stamped) {
            count++;
            completedHabitNames.push(habit.name);
        }
    });
    
    return { count, names: completedHabitNames };
  };

  const getStableRotation = (dateStr: string) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0;
    }
    return (hash % 30) - 15;
  };

  // Duplicate basic theme logic from CalendarView for consistency (Simplified)
  const getContainerClass = () => {
    switch(style) {
        case 'minimal': return 'bg-white rounded-3xl shadow-sm border border-slate-100';
        case 'cny': return 'bg-red-50 rounded-3xl border-4 border-red-800 shadow-xl';
        case 'japanese': return 'bg-[#f4f1ea] rounded-xl shadow-md border border-[#d4d1ca]';
        case 'american': return 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none';
        case 'handdrawn': default: return 'bg-[#fdfbf7] border-2 border-slate-800/5 shadow-md';
    }
  };

  const getHandDrawnStyle = () => style === 'handdrawn' ? ({
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  }) : {};

  return (
    <div className="h-full flex flex-col relative">
       {/* Washi Tape Decoration (Blue/Teal theme for summary) - Only for handdrawn */}
      {style === 'handdrawn' && (
        <>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-teal-100/80 rotate-[1deg] z-20 backdrop-blur-[1px] shadow-sm" style={{ clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0% 100%)' }}></div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-indigo-100/50 rotate-[-2deg] z-10" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 100%, 2% 100%)' }}></div>
        </>
      )}

      <div 
        className={`flex-1 flex flex-col p-6 lg:p-8 relative transition-colors duration-300 ${getContainerClass()}`}
        style={getHandDrawnStyle()}
      >
      
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-2 relative z-10 pt-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-black/5 rounded-full transition-colors opacity-60">
            <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
                <h3 className={`text-2xl font-black tracking-tighter ${style === 'cny' ? 'text-red-900' : 'text-slate-700'}`}>
                    {displayDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} 
                    <span className="opacity-60 font-medium text-lg ml-2">{year}</span>
                </h3>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 rounded-full transition-colors opacity-60">
            <ChevronRight size={24} />
            </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day, i) => (
            <div key={day} className={`text-center text-[10px] font-bold tracking-widest ${i === 0 || i === 6 ? (style === 'cny' ? 'text-red-500' : 'text-indigo-400') : 'text-slate-400'}`}>
                {day}
            </div>
            ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 mb-6 flex-1 content-start">
            {days.map((dateStr, index) => {
            if (!dateStr) return <div key={`empty-${index}`} />;

            const { count, names } = getDailyStats(dateStr);
            const isToday = dateStr === todayStr;
            
            // Visual style
            let StampIcon = Circle;
            let stampColor = style === 'american' ? 'text-black' : 'text-slate-300';
            
            if (count >= 3) {
                StampIcon = Sun;
                stampColor = style === 'american' ? 'text-black' : 'text-amber-500';
            } else if (count === 2) {
                StampIcon = Hexagon;
                stampColor = style === 'american' ? 'text-black' : 'text-indigo-500';
            } else if (count === 1) {
                StampIcon = Circle;
                stampColor = style === 'american' ? 'text-black' : 'text-sky-500';
            }

            const rotation = getStableRotation(dateStr);

            return (
                <div key={dateStr} className="flex flex-col items-center justify-center relative group aspect-square">
                    <div 
                        className={`
                        relative w-full h-full flex items-center justify-center transition-all duration-300
                        ${isToday ? 'bg-indigo-50/50' : ''}
                        ${style === 'american' ? 'border-2 border-black rounded-none' : ''}
                        `}
                        style={{
                             borderRadius: isToday && style === 'handdrawn' ? '40% 60% 60% 40% / 40% 40% 60% 60%' : (style === 'american' ? '0' : '12px'),
                        }}
                        title={names.join(', ')}
                    >
                        {/* Placeholder dots for empty days */}
                        {count === 0 && !isToday && style !== 'minimal' && style !== 'american' && (
                            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        )}

                        {/* Date Number */}
                        <span className={`relative z-0 transition-all font-bold text-sm ${count > 0 ? 'scale-75 opacity-70' : 'opacity-100'} ${style === 'cny' ? 'text-red-800' : 'text-slate-500'} ${style === 'american' ? 'text-black' : ''}`}>
                            {parseInt(dateStr.split('-')[2])}
                        </span>

                        {/* The Ink Stamp */}
                        {count > 0 && (
                            <div 
                                className={`absolute z-10 ${stampColor} mix-blend-multiply opacity-90 animate-in zoom-in duration-300`}
                                style={{
                                    transform: `rotate(${rotation}deg) scale(1.3)`
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <StampIcon size={34} strokeWidth={style === 'american' ? 3 : 2.5} />
                                    {/* Number Inside */}
                                    <span className="absolute text-[10px] font-black tracking-tighter text-current">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* Tooltip */}
                        {count > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                {names.map(n => <div key={n} className="truncate">{n}</div>)}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                        )}
                    </div>
                </div>
            );
            })}
        </div>
      
        {/* Footer Info */}
        <div className="mt-auto pt-2 text-center flex items-center justify-center gap-2 text-slate-400/60">
            <BookOpen size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase">My Journal</span>
        </div>
      </div>
    </div>
  );
};

export default OverallCalendarView;
