
import React, { memo } from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { Habit } from '../types';

interface Props {
  habit: Habit;
  monthlyCount: number;
}

const StatsBar: React.FC<Props> = memo(function StatsBar({ habit, monthlyCount }) {
  return (
    <div className="px-8 py-6 flex justify-between items-center bg-white rounded-[2rem] shadow-sm border border-slate-100 w-full">
      
      {/* Streak */}
      <div className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-default">
        <div className="flex items-center gap-1 text-orange-500 mb-2">
          <Flame size={24} fill={habit.currentStreak > 0 ? "currentColor" : "none"} />
        </div>
        <span className="text-3xl font-bold text-slate-700 leading-none mb-1">{habit.currentStreak}</span>
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wide">連續天數</span>
      </div>

      <div className="w-px h-12 bg-slate-100"></div>

      {/* Monthly Total */}
      <div className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-default">
        <div className="flex items-center gap-1 text-sky-500 mb-2">
          <Calendar size={24} />
        </div>
        <span className="text-3xl font-bold text-slate-700 leading-none mb-1">{monthlyCount}</span>
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wide">本月達成</span>
      </div>

      <div className="w-px h-12 bg-slate-100"></div>

      {/* Best Streak */}
      <div className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-default">
        <div className="flex items-center gap-1 text-amber-500 mb-2">
          <Trophy size={24} />
        </div>
        <span className="text-3xl font-bold text-slate-700 leading-none mb-1">{habit.longestStreak}</span>
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wide">最高紀錄</span>
      </div>
    </div>
  );
});

export default StatsBar;
