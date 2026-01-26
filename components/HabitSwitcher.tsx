
import React from 'react';
import { GameState } from '../types';
import { Plus, Book } from 'lucide-react';
import { getColorBg } from '../utils/petData';

interface Props {
  gameState: GameState;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onOpenCompendium: () => void;
}

const HabitSwitcher: React.FC<Props> = ({ gameState, onSwitch, onAdd, onOpenCompendium }) => {
  const habits = Object.values(gameState.habits);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
       {/* Habit Chips */}
       {habits.map(habit => {
          const isActive = habit.id === gameState.activeHabitId;
          const bgClass = getColorBg(habit.petColor);
          
          return (
             <button
               key={habit.id}
               onClick={() => onSwitch(habit.id)}
               className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap
                  ${isActive 
                     ? `border-slate-800 bg-slate-800 text-white shadow-lg scale-105` 
                     : `border-slate-200 bg-white text-slate-600 hover:bg-slate-50`
                  }
               `}
             >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></div>
                <span className="font-bold text-sm">{habit.name}</span>
                {isActive && <span className="ml-1 text-xs opacity-70">Lv.{habit.currentLevel}</span>}
             </button>
          );
       })}

       {/* Add New Button */}
       <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-2 rounded-full border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all whitespace-nowrap text-sm font-medium"
       >
          <Plus size={14} /> 新增
       </button>
       
       <div className="w-px h-6 bg-slate-200 mx-1"></div>

        {/* Compendium Button */}
       <button
          onClick={onOpenCompendium}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all whitespace-nowrap text-sm font-bold"
       >
          <Book size={14} /> 圖鑑
       </button>
    </div>
  );
};

export default HabitSwitcher;
