import React, { memo } from 'react';
import { GameState, Habit } from '../types';
import { Plus, Book } from 'lucide-react';

interface Props {
  gameState: GameState;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onOpenCompendium: () => void;
}

const HabitSwitcher: React.FC<Props> = memo(function HabitSwitcher({ gameState, onSwitch, onAdd, onOpenCompendium }) {
  const habits: Habit[] = Object.values(gameState.habits);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
       {/* Habit Chips */}
       {habits.map(habit => {
          const isActive = habit.id === gameState.activeHabitId;
          
          return (
             <button
               key={habit.id}
               onClick={() => onSwitch(habit.id)}
               aria-label={`切換至習慣：${habit.name}`}
               aria-pressed={isActive}
               className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                  ${isActive 
                     ? `border-primary dark:border-cta bg-primary dark:bg-cta text-white shadow-lg` 
                     : `border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600`
                  }
               `}
             >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                <span className="font-bold text-sm">{habit.name}</span>
                {isActive && <span className="ml-1 text-xs opacity-70">Lv.{habit.currentLevel}</span>}
             </button>
          );
       })}

       {/* Add New Button */}
       <button
          onClick={onAdd}
          aria-label="新增習慣"
          className="flex items-center gap-1 px-3 py-2 rounded-full border border-dashed border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 whitespace-nowrap text-sm font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
       >
          <Plus size={14} /> 新增
       </button>
       
       <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1 shrink-0"></div>

        {/* Compendium Button */}
       <button
          onClick={onOpenCompendium}
          aria-label="圖鑑"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all duration-200 whitespace-nowrap text-sm font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
       >
          <Book size={14} /> 圖鑑
       </button>
    </div>
  );
});

export default HabitSwitcher;