
import React, { useEffect } from 'react';
import { PET_DEFINITIONS, getColorBg, getColorName } from '../utils/petData';
import { Lock, X } from 'lucide-react';
import { PetDefinition, PetColor } from '../types';

interface Props {
  unlockedPetIds: string[];
  onClose: () => void;
}

const Compendium: React.FC<Props> = ({ unlockedPetIds, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Group by color
  const groupedPets = PET_DEFINITIONS.reduce((acc, pet) => {
    if (!acc[pet.color]) acc[pet.color] = [];
    acc[pet.color].push(pet);
    return acc;
  }, {} as Record<string, PetDefinition[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="compendium-title">
       <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-700">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80">
             <div>
                <h2 id="compendium-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">精靈圖鑑</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">收集進度: {unlockedPetIds.length} / {PET_DEFINITIONS.length}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500 dark:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400" aria-label="關閉">
                <X size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
             {(Object.entries(groupedPets) as [PetColor, PetDefinition[]][]).map(([color, pets]) => (
                <div key={color}>
                   <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <span className={`w-3 h-8 rounded-full ${getColorBg(color)}`}></span>
                      {getColorName(color)}區域
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pets.map(pet => {
                         const isUnlocked = unlockedPetIds.includes(pet.id);
                         
                         return (
                            <div key={pet.id} className={`
                                relative p-4 rounded-2xl flex items-center gap-4 transition-all
                                ${isUnlocked 
                                    ? 'bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-sm' 
                                    : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600'
                                }
                            `}>
                               {/* Avatar Circle */}
                               <div className={`
                                  w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0
                                  ${isUnlocked ? getColorBg(pet.color) : 'bg-slate-200 dark:bg-slate-600'}
                               `}>
                                  {isUnlocked ? (
                                     <span>{pet.stages.adult}</span>
                                  ) : (
                                     <Lock size={24} className="text-slate-400 dark:text-slate-500" />
                                  )}
                               </div>

                               {/* Info */}
                               <div>
                                  <h4 className={`font-bold text-lg ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                     {isUnlocked ? pet.name : '???'}
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug mt-1">
                                     {isUnlocked ? pet.description : '尚未發現此精靈，嘗試培養不同顏色的蛋吧！'}
                                  </p>
                                  
                                  {/* Evolution Chain Preview (Mini) */}
                                  {isUnlocked && (
                                     <div className="flex gap-2 mt-2 text-xs opacity-50">
                                        <span>{pet.stages.egg}</span>
                                        <span>→</span>
                                        <span>{pet.stages.baby}</span>
                                        <span>→</span>
                                        <span>{pet.stages.child}</span>
                                        <span>→</span>
                                        <span>{pet.stages.adult}</span>
                                     </div>
                                  )}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default Compendium;
