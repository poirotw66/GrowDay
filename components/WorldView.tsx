
import React, { useState } from 'react';
import { GameState, AreaConfig, DecorationItem } from '../types';
import HabitatScene from './HabitatScene';
import { INITIAL_AREAS, DECORATION_ITEMS } from '../utils/worldData';
import { Lock, Coins, Store, Map as MapIcon, ChevronLeft, Move, Users } from 'lucide-react';
import { PET_DEFINITIONS, getPetEmoji, getPetById } from '../utils/petData';

interface Props {
  gameState: GameState;
  onBack: () => void;
  buyDecoration: (id: string) => void;
  placeDecoration: (areaId: string, itemId: string) => void;
  removeDecoration: (areaId: string, instanceId: string) => void;
  placePetInArea: (areaId: string, petId: string, stage: any) => void;
  removePetFromArea: (areaId: string, instanceId: string) => void;
  unlockArea: (id: string) => void;
}

const WorldView: React.FC<Props> = ({ 
    gameState, 
    onBack, 
    buyDecoration, 
    placeDecoration, 
    removeDecoration,
    placePetInArea,
    removePetFromArea,
    unlockArea
}) => {
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const areas = Object.values(gameState.world.areas);

  // --- AREA SELECTION VIEW ---
  if (!currentAreaId) {
      return (
          <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <button onClick={onBack} className="p-2 bg-white rounded-full text-slate-500 hover:bg-slate-100 shadow-sm">
                      <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <MapIcon size={24} className="text-indigo-500" /> 世界地圖
                  </h2>
                  <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full text-amber-700 font-bold border border-amber-200">
                      <Coins size={16} />
                      {gameState.coins}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-10">
                  {areas.map(area => {
                      const isUnlocked = gameState.world.unlockedAreas.includes(area.id);
                      return (
                          <div 
                            key={area.id} 
                            onClick={() => isUnlocked && setCurrentAreaId(area.id)}
                            className={`
                                relative p-6 rounded-3xl border-4 transition-all duration-300 h-64 flex flex-col justify-between overflow-hidden group
                                ${isUnlocked 
                                    ? `bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl cursor-pointer ${area.backgroundClass}` 
                                    : 'bg-slate-100 border-slate-200 opacity-80'
                                }
                            `}
                          >
                              {/* Background Preview */}
                              <div className={`absolute inset-0 z-0 opacity-30 ${area.backgroundClass}`}></div>
                              
                              <div className="relative z-10 flex justify-between items-start">
                                  <div>
                                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{area.name}</h3>
                                      <p className="text-slate-600 font-medium leading-relaxed max-w-[80%]">{area.description}</p>
                                  </div>
                                  {!isUnlocked && <Lock className="text-slate-400" size={32} />}
                              </div>

                              <div className="relative z-10 flex justify-between items-end mt-4">
                                  <div className="flex -space-x-3">
                                      {/* Preview pets in area */}
                                      {area.placedPets.slice(0, 3).map((p, i) => (
                                          <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-xl shadow-sm">
                                              {getPetEmoji(p.petId, p.stage)}
                                          </div>
                                      ))}
                                      {area.placedPets.length === 0 && isUnlocked && (
                                          <span className="text-xs text-slate-400 font-bold py-2">目前沒有居民</span>
                                      )}
                                  </div>

                                  {!isUnlocked ? (
                                      <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            unlockArea(area.id);
                                        }}
                                        disabled={gameState.coins < area.unlockCost}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                          <Coins size={16} className="text-amber-400" />
                                          {area.unlockCost} 解鎖
                                      </button>
                                  ) : (
                                      <div className="bg-white/80 px-4 py-2 rounded-xl text-slate-600 font-bold text-sm shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                          進入區域
                                      </div>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  // --- HABITAT DETAIL VIEW ---
  const currentArea = gameState.world.areas[currentAreaId];

  // Helper lists
  const ownedItems = DECORATION_ITEMS.filter(item => gameState.inventory.includes(item.id));
  const availableToBuy = DECORATION_ITEMS.filter(item => !gameState.inventory.includes(item.id));

  return (
      <div className="h-full flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 z-10">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentAreaId(null)} className="p-2 bg-white rounded-full text-slate-500 hover:bg-slate-100 shadow-sm border border-slate-200">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800">{currentArea.name}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full text-amber-700 font-bold border border-amber-200 text-sm">
                      <Coins size={14} />
                      {gameState.coins}
                  </div>
                  <button 
                    onClick={() => setEditMode(!editMode)}
                    className={`p-2 rounded-full shadow-sm border transition-colors ${editMode ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    title="編輯模式"
                  >
                      <Move size={20} />
                  </button>
              </div>
          </div>

          {/* Scene */}
          <div className="flex-1 relative">
              <HabitatScene 
                 area={currentArea} 
                 onRemoveItem={(id) => removeDecoration(currentArea.id, id)}
                 onRemovePet={(id) => removePetFromArea(currentArea.id, id)}
                 editMode={editMode}
              />
              
              {/* Bottom Action Bar (Edit Mode Only) */}
              {editMode && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4">
                      <button 
                        onClick={() => setShowInventory(true)}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600"
                      >
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                             <Store size={20} />
                          </div>
                          <span className="text-xs font-bold">擺設家具</span>
                      </button>
                      <button 
                        onClick={() => setShowPetSelector(true)}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600"
                      >
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                             <Users size={20} />
                          </div>
                          <span className="text-xs font-bold">邀請精靈</span>
                      </button>
                  </div>
              )}
          </div>

          {/* --- MODALS --- */}

          {/* Inventory / Shop Modal */}
          {showInventory && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col p-6 rounded-[2.5rem] animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Store size={20} /> 家具倉庫
                      </h3>
                      <button onClick={() => setShowInventory(false)} className="p-2 bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex gap-4 mb-4 border-b border-slate-100 pb-2">
                      <button onClick={() => setShowShop(false)} className={`pb-2 font-bold transition-colors ${!showShop ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>已擁有</button>
                      <button onClick={() => setShowShop(true)} className={`pb-2 font-bold transition-colors ${showShop ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>商店</button>
                  </div>

                  <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-4 content-start">
                      {!showShop ? (
                          // Owned Items
                          ownedItems.length > 0 ? ownedItems.map(item => (
                              <button 
                                key={item.id}
                                onClick={() => {
                                    placeDecoration(currentArea.id, item.id);
                                    setShowInventory(false);
                                }}
                                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                              >
                                  <div className="text-4xl">{item.emoji}</div>
                                  <span className="font-bold text-slate-700">{item.name}</span>
                              </button>
                          )) : <div className="col-span-2 text-center text-slate-400 py-10">倉庫是空的，去商店逛逛吧！</div>
                      ) : (
                          // Shop Items
                          availableToBuy.map(item => (
                              <button 
                                key={item.id}
                                disabled={gameState.coins < item.price}
                                onClick={() => buyDecoration(item.id)}
                                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <div className="text-4xl">{item.emoji}</div>
                                  <div className="text-center">
                                      <div className="font-bold text-slate-700">{item.name}</div>
                                      <div className="text-xs text-slate-400">{item.description}</div>
                                  </div>
                                  <div className="mt-2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 group-hover:bg-amber-500 transition-colors">
                                      <Coins size={10} className="text-amber-400 group-hover:text-white" /> {item.price}
                                  </div>
                              </button>
                          ))
                      )}
                  </div>
              </div>
          )}

          {/* Pet Selector Modal */}
          {showPetSelector && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col p-6 rounded-[2.5rem] animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Users size={20} /> 選擇居民
                      </h3>
                      <button onClick={() => setShowPetSelector(false)} className="p-2 bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4">
                      {gameState.unlockedPets.map(petId => {
                          const def = getPetById(petId);
                          // For now, assume unlocked pets are available as adults for placing, 
                          // or we could check existing habits to see actual stage. 
                          // Simpler: Just allow placing the "Adult" form of any unlocked pet as a "Spirit".
                          
                          return (
                              <button
                                key={petId}
                                onClick={() => {
                                    // Default to adult stage for the world view for maximum cuteness
                                    placePetInArea(currentArea.id, petId, 'ADULT'); 
                                    setShowPetSelector(false);
                                }}
                                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                              >
                                  <div className="text-4xl">{def.stages.adult}</div>
                                  <span className="font-bold text-slate-700">{def.name}</span>
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

      </div>
  );
};

export default WorldView;
