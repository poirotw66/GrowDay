
import React, { useState, useMemo, useCallback, memo } from 'react';
import { getCalendarDays, getTodayString } from '../utils/dateUtils';
import { Habit, CalendarStyle, GameState } from '../types';
import { STAMP_ICONS, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { ChevronLeft, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { getTheme, getMonthlyProps, getHandDrawnBorderStyle } from '../theme/calendarThemes';
import DailyStampModal from './DailyStampModal';

interface Props {
  habit: Habit;
  onStamp: (x?: number, y?: number, rotation?: number) => void;
  isTodayStamped: boolean;
  style?: CalendarStyle;
  selectedSound: string;
  gameState?: GameState; // For custom stamps
}

const CalendarView: React.FC<Props> = memo(function CalendarView({ habit, onStamp, isTodayStamped, style = 'handdrawn' as CalendarStyle, selectedSound, gameState }) {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [showStampModal, setShowStampModal] = useState(false);
  
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth(); // 0-11
  
  // Memoize expensive calendar calculation
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);
  const todayStr = useMemo(() => getTodayString(), []);
  
  const stampColor = habit.stampColor || DEFAULT_STAMP_COLOR;

  // Helper function to render stamp icon (built-in or custom)
  const renderStampIcon = useCallback((iconId: string, size: number = 28, strokeWidth: number = 2.5) => {
    if (iconId.startsWith('custom:')) {
      const stampId = iconId.replace('custom:', '');
      const customStamp = gameState?.customStamps?.[stampId];
      if (customStamp) {
        return (
          <img
            src={customStamp.imageData}
            alt={customStamp.name || '自訂印章'}
            style={{ width: size, height: size }}
            className="opacity-90"
          />
        );
      }
    }
    // Fallback to built-in icon
    const Icon = STAMP_ICONS[iconId] || Star;
    return <Icon size={size} strokeWidth={strokeWidth} className="opacity-90" />;
  }, [gameState?.customStamps]);

  // Get the icon component directly from the record - avoid useMemo to prevent static-components error
  const StampIcon = STAMP_ICONS[habit.stampIcon] || Star;

  const handlePrevMonth = useCallback(() => {
    setDisplayDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const handleNextMonth = useCallback(() => {
    setDisplayDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const handleStampConfirm = useCallback((x: number, y: number, rotation: number) => {
      onStamp(x, y, rotation);
      setShowStampModal(false);
  }, [onStamp]);

  const weekDays = useMemo(() => ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], []);

  const currentMonthProps = getMonthlyProps(month);
  const theme = getTheme(style as CalendarStyle, month);
  const handDrawnStyle = style === 'handdrawn' ? getHandDrawnBorderStyle() : {};

  return (
    <div className="flex flex-col relative w-full">
      
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
            gameState={gameState}
          />
      )}

      <div
        className={`flex flex-col p-4 md:p-5 lg:p-6 relative transition-all duration-300 ${theme.container}`}
        style={handDrawnStyle}
      >
        {theme.decor}

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 px-2 relative z-10 pt-2 md:pt-4 flex-shrink-0">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-black/5 rounded-full transition-colors duration-200 text-inherit opacity-60 cursor-pointer" aria-label="上一個月">
                <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
                <h3 className={`font-heading text-2xl ${theme.headerText}`}>
                    {displayDate.toLocaleDateString('zh-TW', { month: 'short' }).toUpperCase()} 
                    <span className={`text-lg ml-2 ${theme.headerSub}`}>{year}</span>
                </h3>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 rounded-full transition-colors duration-200 text-inherit opacity-60 cursor-pointer" aria-label="下一個月">
                <ChevronRight size={24} />
            </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2 md:mb-3 relative z-10 flex-shrink-0">
            {weekDays.map((day, i) => (
            <div key={day} className={`text-center text-[10px] font-bold tracking-widest ${(i === 0 || i === 6) && style !== 'american' ? 'text-orange-400' : 'text-slate-400'}`}>
                {day}
            </div>
            ))}
        </div>

        {/* Days Grid – natural height, no scroll */}
        <div className={`grid grid-cols-7 mb-3 md:mb-4 content-start relative z-10 ${theme.grid}`}>
            {days.map((dateStr, index) => {
            if (!dateStr) return <div key={`empty-${index}`} className={`aspect-square ${theme.emptyCell}`} />;

            const log = habit.logs[dateStr];
            const isStamped = log?.stamped;
            const isToday = dateStr === todayStr;
            
            const dayIconId = log?.icon || habit.stampIcon;
            const dayColor = log?.color || stampColor;
            const _isCustomStamp = dayIconId.startsWith('custom:');
            
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
                            {renderStampIcon(dayIconId, 28, style === 'american' ? 3 : 2.5)}
                        </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>

        {/* Action Button – CTA: design system 200ms transition + aria-label */}
        <div className="mt-4 pt-2 pb-1 relative z-30 flex-shrink-0">
            <button
            onClick={() => {
                if(!isTodayStamped) setShowStampModal(true);
            }}
            disabled={isTodayStamped}
            aria-label={isTodayStamped ? '今日已完成紀錄' : '蓋下印章'}
            className={`
                w-full py-4 font-bold text-lg transition-all duration-200 transform flex items-center justify-center gap-3 active:scale-95
                ${style === 'handdrawn' 
                    ? `rounded-xl border-b-4 active:border-b-0 active:translate-y-1 ${isTodayStamped ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default' : 'text-white hover:brightness-110 cursor-pointer'}` 
                    : theme.button
                }
                ${style === 'minimal' && isTodayStamped ? 'bg-slate-100 text-slate-400 shadow-none hover:bg-slate-100 cursor-default' : ''}
                ${style === 'cny' && isTodayStamped ? 'bg-red-100 text-red-300 border-red-200 shadow-none cursor-default' : ''}
                ${style === 'japanese' && isTodayStamped ? 'bg-[#e0ded9] text-[#b0aeab] shadow-none cursor-default' : ''}
                ${style === 'american' && isTodayStamped ? 'bg-gray-100 text-gray-400 border-gray-300 shadow-none hover:shadow-none cursor-default hover:bg-gray-100 hover:text-gray-400' : ''}
                ${!isTodayStamped ? 'cursor-pointer' : ''}
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
});

export default CalendarView;
