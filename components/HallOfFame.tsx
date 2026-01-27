
import React from 'react';
import { RetiredPet } from '../types';
import { getPetById } from '../utils/petData';
import { X, Medal, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  retiredPets: RetiredPet[];
  onClose: () => void;
}

const HallOfFame: React.FC<Props> = ({ retiredPets, onClose }) => {
  const totalBonus = retiredPets.length * 10;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden relative border-4 border-amber-100">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
                   <Medal className="text-amber-500" /> 榮譽殿堂
                </h2>
                <p className="text-amber-700/70 text-sm mt-1">這裡記錄著所有功成身退的守護精靈</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-amber-800/50">
                <X size={24} />
             </button>
          </div>

          {/* Bonus Banner */}
          <div className="bg-amber-100/50 p-4 flex items-center justify-center gap-6 border-b border-amber-100">
              <div className="text-center">
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wide">退休精靈</div>
                  <div className="text-2xl font-black text-amber-700">{retiredPets.length} <span className="text-sm font-normal text-amber-600/70">隻</span></div>
              </div>
              <div className="w-px h-10 bg-amber-200"></div>
              <div className="text-center">
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wide">金幣加成</div>
                  <div className="text-2xl font-black text-amber-500">+{totalBonus}%</div>
              </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdfbf7]">
             {retiredPets.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                     <Medal size={64} className="mb-4 text-slate-300" />
                     <p className="text-lg font-bold">殿堂目前空無一人</p>
                     <p className="text-sm">當精靈達到 Lv.30 時即可進入殿堂</p>
                 </div>
             ) : (
                 retiredPets.map((pet) => {
                     const def = getPetById(pet.petId);
                     return (
                         <div key={pet.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                             <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-4xl shrink-0 border-2 border-white shadow-sm">
                                 {def.stages.adult}
                             </div>
                             
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h3 className="font-bold text-slate-800 text-lg">{pet.name}</h3>
                                     <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                         <TrendingUp size={12} /> Gen {pet.generation}
                                     </span>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 mt-1">
                                     <div className="text-xs text-slate-500 flex items-center gap-1">
                                         <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                         {def.name}
                                     </div>
                                     <div className="text-xs text-slate-400 flex items-center gap-1">
                                         <Calendar size={10} />
                                         {pet.retiredDate} 退休
                                     </div>
                                 </div>
                             </div>

                             <div className="text-right">
                                 <div className="text-xs font-bold text-slate-400 uppercase">BONUS</div>
                                 <div className="font-bold text-amber-500">+10%</div>
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
