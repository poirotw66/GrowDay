import React from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { GameState } from '../types';

interface Props {
  gameState: GameState;
  monthlyCount: number;
}

const StatsBar: React.FC<Props> = ({ gameState, monthlyCount }) => {
  return (
    <div className="px-8 py-6 flex justify-between items-center bg-white rounded-[2rem] shadow-sm border border-slate-100 w-full">
      
      {/* Streak */}
      <div className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-default">
        <div className="flex items-center gap-1 text-orange-500 mb-2">
          <Flame size={24} fill={gameState.currentStreak > 0 ? "currentColor" : "none"} />
        </div>
        <span className="text-3xl font-bold text-slate-700 leading-none mb-1">{gameState.currentStreak}</span>
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
        <span className="text-3xl font-bold text-slate-700 leading-none mb-1">{gameState.longestStreak}</span>
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wide">最高紀錄</span>
      </div>
    </div>
  );
};

export default StatsBar;
