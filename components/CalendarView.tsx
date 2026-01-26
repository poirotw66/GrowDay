import React, { useState } from 'react';
import { getCalendarDays, formatMonthYear, getTodayString } from '../utils/dateUtils';
import { GameState } from '../types';
import { getStampIcon } from '../utils/stampIcons';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  gameState: GameState;
  onStamp: () => void;
  isTodayStamped: boolean;
}

const CalendarView: React.FC<Props> = ({ gameState, onStamp, isTodayStamped }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const days = getCalendarDays(year, month);
  const todayStr = getTodayString();

  // The icon shown on the big "Stamp Today" button is always the CURRENT selection
  const CurrentActionIcon = getStampIcon(gameState.stampIcon);

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 h-full">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-2xl font-bold text-slate-700 tracking-tight">
          {formatMonthYear(year, month)}
        </h3>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-6">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-bold text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-6 gap-x-2 mb-8 flex-1">
        {days.map((dateStr, index) => {
          if (!dateStr) return <div key={`empty-${index}`} />;

          const log = gameState.logs[dateStr];
          const isStamped = log?.stamped;
          const isToday = dateStr === todayStr;
          
          // Determine which icon to show for this specific day
          // 1. If the log has a saved icon, use it.
          // 2. Fallback to current global stampIcon (for legacy data or backward compatibility).
          const dayIconId = log?.icon || gameState.stampIcon;
          const DayStampIcon = getStampIcon(dayIconId);
          
          return (
            <div key={dateStr} className="flex flex-col items-center justify-center">
              <div 
                className={`
                  w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-2xl text-base font-medium transition-all duration-300
                  ${isStamped 
                    ? 'bg-orange-400 text-white shadow-md scale-110' 
                    : isToday 
                        ? 'bg-orange-50 text-orange-600 border-2 border-orange-200' 
                        : 'text-slate-400 hover:bg-slate-50'
                  }
                `}
              >
                {isStamped ? (
                   <DayStampIcon size={20} fill="currentColor" className="text-white" />
                ) : (
                  <span>{parseInt(dateStr.split('-')[2])}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button Area */}
      <div className="mt-auto pt-4">
        <button
          onClick={onStamp}
          disabled={isTodayStamped}
          className={`
            w-full py-5 rounded-2xl shadow-lg font-bold text-xl transition-all transform flex items-center justify-center gap-3
            ${isTodayStamped 
              ? 'bg-slate-100 text-slate-400 cursor-default border-2 border-slate-200 shadow-none' 
              : 'bg-gradient-to-r from-orange-400 to-amber-500 text-white hover:scale-[1.02] active:scale-95 shadow-orange-200 hover:shadow-orange-300'
            }
          `}
        >
            {isTodayStamped ? (
                <>
                    <CheckCircle2 size={24} />
                    今天已完成
                </>
            ) : (
                <>
                    <div className="relative">
                        <CurrentActionIcon size={24} className="animate-bounce" />
                    </div>
                    今天打卡
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default CalendarView;
