
import React, { useEffect } from 'react';
import { ACHIEVEMENTS } from '../utils/achievementData';
import { X, Lock, CheckCircle2, Coins } from 'lucide-react';

interface Props {
  unlockedIds: string[];
  onClose: () => void;
}

const AchievementList: React.FC<Props> = ({ unlockedIds, onClose }) => {
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="achievement-list-title">
       <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden relative border-4 border-slate-100 dark:border-slate-700">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/80">
             <div>
                <h2 id="achievement-list-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                   🏆 成就系統
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 w-32 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 dark:bg-amber-500 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{unlockedCount} / {totalCount}</span>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-400 dark:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400" aria-label="關閉">
                <X size={24} />
             </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfbf7] dark:bg-slate-900/50">
             {ACHIEVEMENTS.map((achievement) => {
                 const isUnlocked = unlockedIds.includes(achievement.id);
                 const Icon = achievement.icon;

                 return (
                     <div 
                        key={achievement.id} 
                        className={`
                            relative rounded-2xl p-4 flex items-center gap-4 border transition-all
                            ${isUnlocked 
                                ? 'bg-white dark:bg-slate-700 border-amber-200 dark:border-amber-600 shadow-sm' 
                                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 opacity-70 grayscale'
                            }
                        `}
                     >
                         {/* Icon Circle */}
                         <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0
                            ${isUnlocked 
                                ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-600 dark:text-amber-400 shadow-inner' 
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
                            }
                         `}>
                             {isUnlocked ? <Icon size={24} /> : <Lock size={20} />}
                         </div>

                         <div className="flex-1">
                             <div className="flex justify-between items-start">
                                 <h3 className={`font-bold ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                     {achievement.title}
                                 </h3>
                                 {isUnlocked && <CheckCircle2 size={16} className="text-green-500 dark:text-green-400" />}
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{achievement.description}</p>
                         </div>
                         
                         {/* Reward Tag */}
                         <div className={`
                            flex flex-col items-center justify-center px-3 py-1 rounded-lg
                            ${isUnlocked ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-600 text-slate-400 dark:text-slate-500'}
                         `}>
                             <Coins size={14} />
                             <span className="text-xs font-bold">+{achievement.rewardCoins}</span>
                         </div>
                     </div>
                 );
             })}
          </div>
       </div>
    </div>
  );
};

export default AchievementList;
