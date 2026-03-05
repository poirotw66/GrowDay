/**
 * Centralized calendar style configuration. Used by CalendarView and OverallCalendarView
 * so theme logic is not scattered across components.
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Snowflake,
  Heart,
  Clover,
  CloudRain,
  Flower2,
  Sun,
  Umbrella,
  Cloud,
  Leaf,
  Ghost,
  Gift,
  Moon,
  Star,
  Sparkles,
  Cherry,
} from 'lucide-react';
import type { CalendarStyle } from '../types';

export interface MonthlyProps {
  color: string;
  icon: LucideIcon;
  label: string;
}

const SEASONAL: MonthlyProps[] = [
  { color: '#3b82f6', icon: Snowflake, label: 'JAN' },
  { color: '#ec4899', icon: Heart, label: 'FEB' },
  { color: '#22c55e', icon: Clover, label: 'MAR' },
  { color: '#a855f7', icon: CloudRain, label: 'APR' },
  { color: '#eab308', icon: Flower2, label: 'MAY' },
  { color: '#f97316', icon: Sun, label: 'JUN' },
  { color: '#06b6d4', icon: Umbrella, label: 'JUL' },
  { color: '#10b981', icon: Cloud, label: 'AUG' },
  { color: '#d97706', icon: Leaf, label: 'SEP' },
  { color: '#f59e0b', icon: Ghost, label: 'OCT' },
  { color: '#94a3b8', icon: Moon, label: 'NOV' },
  { color: '#ef4444', icon: Gift, label: 'DEC' },
];

export function getMonthlyProps(month: number): MonthlyProps {
  return SEASONAL[month % 12];
}

export function getSeasonalColor(month: number): string {
  return SEASONAL[month % 12].color;
}

export function getContainerClass(style: CalendarStyle): string {
  switch (style) {
    case 'minimal':
      return 'bg-white rounded-3xl shadow-sm border border-slate-100';
    case 'cny':
      return 'bg-red-50 rounded-3xl border-4 border-red-800 shadow-xl';
    case 'japanese':
      return 'bg-[#f4f1ea] rounded-xl shadow-md border border-[#d4d1ca]';
    case 'american':
      return 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none';
    case 'handdrawn':
    default:
      return 'bg-[#fdfbf7] border-2 border-slate-800/5 shadow-md';
  }
}

export function getHandDrawnBorderStyle(): React.CSSProperties {
  return { borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' };
}

/** For OverallCalendarView: handdrawn container style including dot grid background. */
export function getHandDrawnContainerStyle(): React.CSSProperties {
  return {
    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };
}

export interface CalendarThemeConfig {
  container: string;
  headerText: string;
  headerSub: string;
  grid: string;
  dayCell: string;
  todayCell: string;
  emptyCell: string;
  button: string;
  buttonStyle: React.CSSProperties;
  decor: React.ReactNode;
}

export function getTheme(style: CalendarStyle, month: number): CalendarThemeConfig {
  const currentMonthProps = getMonthlyProps(month);
  const DoodleIcon = currentMonthProps.icon;

  switch (style) {
    case 'minimal':
      return {
        container: 'bg-white rounded-3xl shadow-sm border border-slate-100',
        headerText: 'text-slate-800 font-bold',
        headerSub: 'font-normal opacity-40',
        grid: 'gap-2',
        dayCell: 'rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors',
        todayCell: '',
        emptyCell: 'hidden',
        button: 'text-white rounded-xl shadow-lg hover:brightness-110',
        buttonStyle: { backgroundColor: currentMonthProps.color },
        decor: (
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
            <DoodleIcon size={120} color={currentMonthProps.color} />
          </div>
        ),
      };

    case 'cny': {
      let cnyDecor: React.ReactNode;
      let cnyBorderColor = 'border-red-800';
      let cnyBg = 'bg-red-50';
      if (month >= 0 && month <= 2) {
        cnyDecor = (
          <div className="absolute top-2 right-2 opacity-20 text-red-600 rotate-12">
            <Flower2 size={64} />
          </div>
        );
      } else if (month >= 3 && month <= 5) {
        cnyDecor = (
          <div className="absolute bottom-2 right-2 opacity-20 text-red-600 -rotate-12">
            <Sun size={64} />
          </div>
        );
        cnyBg = 'bg-orange-50';
        cnyBorderColor = 'border-orange-800';
      } else if (month >= 6 && month <= 8) {
        cnyDecor = (
          <div className="absolute top-2 left-2 opacity-20 text-amber-600">
            <Moon size={64} />
          </div>
        );
        cnyBg = 'bg-amber-50';
        cnyBorderColor = 'border-amber-800';
      } else {
        cnyDecor = (
          <div className="absolute bottom-2 left-2 opacity-20 text-slate-400 rotate-45">
            <Snowflake size={64} />
          </div>
        );
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
            <div
              className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-current"
              style={{ color: currentMonthProps.color }}
            />
            {cnyDecor}
          </>
        ),
      };
    }

    case 'japanese': {
      let jpIcon = <Cherry size={32} />;
      const jpBgPattern = "url('https://www.transparenttextures.com/patterns/rice-paper.png')";
      let jpAccent = 'text-pink-400';
      if (month === 0) {
        jpIcon = <Sun size={32} />;
        jpAccent = 'text-red-500';
      } else if (month === 10) {
        jpIcon = <Leaf size={32} />;
        jpAccent = 'text-orange-600';
      } else if (month === 6 || month === 7) {
        jpIcon = <Sparkles size={32} />;
        jpAccent = 'text-blue-400';
      }
      return {
        container:
          'bg-[#f4f1ea] rounded-xl shadow-md border border-[#d4d1ca] relative overflow-hidden',
        headerText: 'text-[#4a4a4a] font-serif',
        headerSub: 'text-[#8a8a8a] text-xs',
        grid: 'gap-4',
        dayCell: 'rounded-sm border-b border-[#e0ded9]',
        todayCell: 'bg-[#e8e6df]',
        emptyCell: 'border-b border-[#e0ded9] border-dashed',
        button:
          'bg-[#5c5a55] text-[#f4f1ea] rounded-md shadow-sm tracking-widest hover:bg-[#4a4843]',
        buttonStyle: {},
        decor: (
          <>
            <div className={`absolute top-4 left-4 opacity-40 ${jpAccent}`}>{jpIcon}</div>
            <div className={`absolute bottom-4 right-4 opacity-30 rotate-45 ${jpAccent}`}>
              {jpIcon}
            </div>
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ backgroundImage: jpBgPattern }}
            />
            <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-[#d4d1ca] writing-vertical font-serif opacity-60 hidden md:block">
              {new Date().getFullYear()}年{month + 1}月
            </div>
          </>
        ),
      };
    }

    case 'american': {
      let amBorder = 'border-black';
      let amHeaderBg = 'bg-yellow-300';
      const amBg = 'bg-white';
      if (month === 1) {
        amHeaderBg = 'bg-pink-300';
        amBorder = 'border-pink-900';
      } else if (month === 9) {
        amHeaderBg = 'bg-orange-400';
        amBorder = 'border-purple-900';
      } else if (month === 11) {
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
        button:
          'bg-black text-white border-2 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase text-xl',
        buttonStyle: {},
        decor: (
          <>
            <div
              className="absolute -top-6 -right-6 text-current rotate-12 stroke-black stroke-2"
              style={{ color: currentMonthProps.color }}
            >
              <Star size={48} fill="currentColor" />
            </div>
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)',
                backgroundSize: '16px 16px',
              }}
            />
          </>
        ),
      };
    }

    case 'handdrawn':
    default:
      return {
        container: 'bg-[#fdfbf7] border-2 border-slate-800/5 shadow-md relative',
        headerText: 'text-slate-700 font-black tracking-tighter',
        headerSub: 'text-slate-400 font-medium',
        grid: 'gap-2',
        dayCell: '',
        todayCell: '',
        emptyCell: 'border-2 border-dashed border-slate-200/60 rounded-full',
        button: '',
        buttonStyle: {},
        decor: (
          <>
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 rotate-[-2deg] z-20 backdrop-blur-[1px] shadow-sm opacity-80"
              style={{
                backgroundColor: currentMonthProps.color,
                clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0% 100%)',
              }}
            />
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/50 rotate-[1deg] z-10"
              style={{ clipPath: 'polygon(0 0, 98% 0, 100% 100%, 2% 100%)' }}
            />
            <div
              className="absolute top-4 right-4 opacity-50 rotate-12"
              style={{ color: currentMonthProps.color }}
            >
              <DoodleIcon size={28} />
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </>
        ),
      };
  }
}
