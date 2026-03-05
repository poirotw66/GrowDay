
import React, { useEffect } from 'react';
import { RetiredPet } from '../types';
import { getPetById } from '../utils/petData';
import { X, Medal, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  retiredPets: RetiredPet[];
  onClose: () => void;
}

const HallOfFame: React.FC<Props> = ({ retiredPets, onClose }) => {
  const totalBonus = retiredPets.length * 10;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="hall-of-fame-title">
       <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden relative border-4 border-amber-100 dark:border-amber-800">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-b border-amber-100 dark:border-amber-800 flex justify-between items-start">
             <div>
                <h2 id="hall-of-fame-title" className="text-2xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                   <Medal className="text-amber-500 dark:text-amber-400" /> 榮譽殿堂
                </h2>
                <p className="text-amber-700/70 dark:text-amber-300/70 text-sm mt-1">這裡記錄著所有功成身退的守護精靈</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full transition-colors text-amber-800/50 dark:text-amber-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" aria-label="關閉">
                <X size={24} />
             </button>
          </div>

          {/* Bonus Banner */}
          <div className="bg-amber-100/50 dark:bg-amber-900/30 p-4 flex items-center justify-center gap-6 border-b border-amber-100 dark:border-amber-800">
              <div className="text-center">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">退休精靈</div>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{retiredPets.length} <span className="text-sm font-normal text-amber-600/70 dark:text-amber-400/70">隻</span></div>
              </div>
              <div className="w-px h-10 bg-amber-200 dark:bg-amber-700"></div>
              <div className="text-center">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">金幣加成</div>
                  <div className="text-2xl font-black text-amber-500 dark:text-amber-400">+{totalBonus}%</div>
              </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdfbf7] dark:bg-slate-900/50">
             {retiredPets.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                     <Medal size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                     <p className="text-lg font-bold text-slate-600 dark:text-slate-300">殿堂目前空無一人</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400">當精靈達到 Lv.30 時即可進入殿堂</p>
                 </div>
             ) : (
                 retiredPets.map((pet) => {
                     const def = getPetById(pet.petId);
                     return (
                         <div key={pet.id} className="bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-4 hover:shadow-md transition-shadow">
                             <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center text-4xl shrink-0 border-2 border-white dark:border-slate-600 shadow-sm">
                                 {def.stages.adult}
                             </div>
                             
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{pet.name}</h3>
                                     <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1">
                                         <TrendingUp size={12} /> Gen {pet.generation}
                                     </span>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 mt-1">
                                     <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                         <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-500"></div>
                                         {def.name}
                                     </div>
                                     <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                         <Calendar size={10} />
                                         {pet.retiredDate} 退休
                                     </div>
                                 </div>
                             </div>

                             <div className="text-right">
                                 <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">BONUS</div>
                                 <div className="font-bold text-amber-500 dark:text-amber-400">+10%</div>
                             </div>
                         </div>
                     );
                 })
             )}
          </div>
       </div>
    </div>
  );
};

export default HallOfFame;
