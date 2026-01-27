
import React from 'react';
import { AreaConfig, PlacedItem, PlacedPet, PetStage } from '../types';
import { getDecorationById } from '../utils/worldData';
import { getPetEmoji } from '../utils/petData';
import { X, Plus } from 'lucide-react';

interface Props {
  area: AreaConfig;
  onRemoveItem: (id: string) => void;
  onRemovePet: (id: string) => void;
  editMode: boolean;
}

const WanderingPet: React.FC<{ pet: PlacedPet }> = ({ pet }) => {
  const emoji = getPetEmoji(pet.petId, pet.stage);
  
  // Randomize animation duration to make them look independent
  const duration = 10 + Math.random() * 10; 
  const delay = Math.random() * 5;

  return (
    <div 
        className="absolute bottom-[10%] transition-all"
        style={{ 
            left: `${pet.x}%`,
            animation: `wander ${duration}s ease-in-out infinite ${delay}s alternate`
        }}
    >
        <div className="text-6xl animate-bounce-slow transform origin-bottom cursor-pointer hover:scale-110 transition-transform">
            {emoji}
        </div>
        <style>{`
            @keyframes wander {
                0% { transform: translateX(0) scaleX(1); }
                45% { transform: translateX(50px) scaleX(1); }
                50% { transform: translateX(50px) scaleX(-1); }
                95% { transform: translateX(-50px) scaleX(-1); }
                100% { transform: translateX(-50px) scaleX(1); }
            }
            .animate-bounce-slow {
                animation: bounce 3s infinite;
            }
        `}</style>
    </div>
  );
};

const HabitatScene: React.FC<Props> = ({ area, onRemoveItem, onRemovePet, editMode }) => {
  return (
    <div className={`relative w-full h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-slate-200 ${area.backgroundClass} transition-colors duration-500`}>
       
       {/* Background Decoration Elements (Optional based on area) */}
       {area.id === 'space' && (
           <div className="absolute inset-0 opacity-50 animate-pulse">✨ . ✦ . * . ✨</div>
       )}

       {/* Placed Furniture */}
       {area.placedItems.map(item => {
           const def = getDecorationById(item.itemId);
           if (!def) return null;
           
           return (
               <div 
                  key={item.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:z-50"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
               >
                   <div className="text-5xl md:text-7xl drop-shadow-lg transition-transform hover:scale-110 cursor-pointer relative group">
                       {def.emoji}
                       
                       {/* Delete Button (Only in edit mode) */}
                       {editMode && (
                           <button 
                                onClick={() => onRemoveItem(item.id)}
                                className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 shadow-md scale-0 group-hover:scale-100 transition-transform"
                           >
                               <X size={12} />
                           </button>
                       )}
                   </div>
               </div>
           );
       })}

       {/* Wandering Pets */}
       {area.placedPets.map(pet => (
           <div key={pet.id} className="relative group">
                <WanderingPet pet={pet} />
                {editMode && (
                    <button 
                        onClick={() => onRemovePet(pet.id)}
                        // Click logic handled below via overlay for now
                    />
                )}
           </div>
       ))}

        {/* Since removing wandering pets via a moving button is hard, let's list them in edit mode if needed, 
            or just make the pet clickable to remove when editMode is true. */}
        {area.placedPets.map(pet => (
             editMode ? (
                 <div 
                    key={`remove-${pet.id}`}
                    onClick={() => onRemovePet(pet.id)}
                    className="absolute bottom-4 left-4 bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-red-200 z-50 border border-red-300"
                    style={{ left: `${pet.x}%`, bottom: '15%' }} // Static approximation
                 >
                    移除 {getPetEmoji(pet.petId, pet.stage)}
                 </div>
             ) : null
        ))}

       {/* Floor / Ground visual anchor */}
       <div className="absolute bottom-0 w-full h-1/4 bg-black/5 backdrop-blur-[1px] rounded-b-[2rem]"></div>
    </div>
  );
};

export default HabitatScene;
