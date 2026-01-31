
import React, { useState, useMemo } from 'react';
import { GameState, AreaConfig, DecorationType, PetStage } from '../types';
import HabitatScene from './HabitatScene';
import { DECORATION_ITEMS } from '../utils/worldData';
import { Lock, Coins, Store, Map as MapIcon, ChevronLeft, Move, Users, Armchair, Sprout, LayoutGrid, Package, LucideIcon } from 'lucide-react';
import { getPetEmoji, getPetById } from '../utils/petData';

interface Props {
  gameState: GameState;
  onBack: () => void;
  buyDecoration: (id: string) => void;
  placeDecoration: (areaId: string, itemId: string) => void;
  removeDecoration: (areaId: string, instanceId: string) => void;
  placePetInArea: (areaId: string, petId: string, stage: PetStage) => void;
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
  // ------------------------------------------------------------
  // 1. TOP LEVEL HOOKS (MUST BE FIRST)
  // ------------------------------------------------------------
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | DecorationType>('all');
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);

  // Filter owned items (for placement)
  const ownedItems = useMemo(() => {
      const items = DECORATION_ITEMS.filter(item => gameState.inventory.includes(item.id));
      if (activeCategory === 'all') return items;
      return items.filter(i => i.type === activeCategory);
  }, [gameState.inventory, activeCategory]);

  // Show ALL items in shop (allow duplicates), filter only by category
  const shopItems = useMemo(() => {
      const items = DECORATION_ITEMS; // Allow seeing all items even if owned
      if (activeCategory === 'all') return items;
      return items.filter(i => i.type === activeCategory);
  }, [activeCategory]);

  // ------------------------------------------------------------
  // 2. LOGIC & HANDLERS
  // ------------------------------------------------------------
  const areas: AreaConfig[] = Object.values(gameState.world.areas);

  const categories: { id: 'all' | DecorationType; label: string; icon: LucideIcon }[] = [
      { id: 'all', label: '全部', icon: LayoutGrid },
      { id: 'furniture', label: '家具', icon: Armchair },
      { id: 'plant', label: '植物', icon: Sprout },
  ];

  const handleUnlock = (areaId: string) => {
      unlockArea(areaId);
      setJustUnlockedId(areaId);
      setTimeout(() => setJustUnlockedId(null), 3000); 
  };

  // ------------------------------------------------------------
  // 3. CONDITIONAL RENDERING (ONLY AFTER ALL HOOKS)
  // ------------------------------------------------------------

  // VIEW 1: AREA SELECTION (Map)
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
                      const isJustUnlocked = justUnlockedId === area.id;

                      return (
                          <div 
                            key={area.id} 
                            onClick={() => isUnlocked && setCurrentAreaId(area.id)}
                            className={`
                                relative p-6 rounded-3xl border-4 transition-all duration-500 h-64 flex flex-col justify-between overflow-hidden group
                                ${isUnlocked 
                                    ? `bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl cursor-pointer ${area.backgroundClass}` 
                                    : 'bg-slate-100 border-slate-200 opacity-80'
                                }
                                ${isJustUnlocked ? 'ring-4 ring-amber-400 scale-[1.02]' : ''}
                            `}
                          >
                              {/* Background Preview */}
                              <div className={`absolute inset-0 z-0 opacity-30 ${area.backgroundClass}`}></div>
                              
                              {/* Just Unlocked Celebration */}
                              {isJustUnlocked && (
                                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm animate-in fade-in zoom-in">
                                      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
                                          <div className="text-4xl mb-2">🎉</div>
                                          <div className="font-bold text-slate-800">解鎖成功！</div>
                                      </div>
                                  </div>
                              )}

                              <div className="relative z-10 flex justify-between items-start">
                                  <div>
                                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{area.name}</h3>
                                      <p className="text-slate-600 font-medium leading-relaxed max-w-[80%]">{area.description}</p>
                                  </div>
                                  {!isUnlocked && <Lock className="text-slate-400" size={32} />}
                              </div>

                              <div className="relative z-10 flex justify-between items-end mt-4">
                                  <div className="flex -space-x-3">
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
                                            handleUnlock(area.id);
                                        }}
                                        disabled={gameState.coins < area.unlockCost}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
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

  // VIEW 2: HABITAT DETAIL
  const currentArea = gameState.world.areas[currentAreaId];
  if (!currentArea) return null; // Safety check

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
                        onClick={() => { setShowInventory(true); setShowShop(false); }}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600"
                      >
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                             <Package size={20} />
                          </div>
                          <span className="text-xs font-bold">擺設家具</span>
                      </button>
                      <button 
                        onClick={() => { setShowInventory(true); setShowShop(true); }}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600"
                      >
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                             <Store size={20} />
                          </div>
                          <span className="text-xs font-bold">家具商店</span>
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
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col p-4 md:p-6 rounded-[2.5rem] animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          {showShop ? <Store size={20} className="text-amber-500" /> : <Package size={20} className="text-indigo-500" />}
                          {showShop ? '家具商店' : '家具倉庫'}
                      </h3>
                      <button onClick={() => setShowInventory(false)} className="p-2 bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                      <button 
                        onClick={() => setShowShop(false)} 
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${!showShop ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        已擁有
                      </button>
                      <button 
                        onClick={() => setShowShop(true)} 
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${showShop ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        商店
                      </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {categories.map(cat => {
                          const Icon = cat.icon;
                          const isActive = activeCategory === cat.id;
                          return (
                              <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border
                                    ${isActive 
                                        ? 'bg-slate-800 text-white border-slate-800' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }
                                `}
                              >
                                  <Icon size={14} />
                                  {cat.label}
                              </button>
                          )
                      })}
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4">
                      <div className="grid grid-cols-2 gap-4 content-start">
                        {!showShop ? (
                            // OWNED ITEMS
                            ownedItems.length > 0 ? ownedItems.map(item => {
                                // Count how many of this item we own
                                const count = gameState.inventory.filter(id => id === item.id).length;
                                
                                return (
                                    <button 
                                        key={item.id}
                                        onClick={() => {
                                            placeDecoration(currentArea.id, item.id);
                                            setShowInventory(false);
                                        }}
                                        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-indigo-400 hover:shadow-md transition-all group text-left relative"
                                    >
                                        {count > 1 && (
                                            <div className="absolute top-2 right-2 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                                x{count}
                                            </div>
                                        )}

                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                            {item.emoji}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-slate-700">{item.name}</span>
                                            </div>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                {item.type === 'plant' ? '植物' : '家具'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Package size={48} className="mb-2 opacity-20" />
                                    <p>倉庫是空的</p>
                                    <button onClick={() => setShowShop(true)} className="mt-2 text-indigo-500 font-bold text-sm hover:underline">去商店逛逛</button>
                                </div>
                            )
                        ) : (
                            // SHOP ITEMS (Show All)
                            shopItems.length > 0 ? shopItems.map(item => {
                                const ownedCount = gameState.inventory.filter(id => id === item.id).length;

                                return (
                                    <div 
                                        key={item.id}
                                        className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-3 relative overflow-hidden group hover:border-amber-200 transition-colors"
                                    >
                                        <div className="w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                                            {item.emoji}
                                            <div className="absolute top-2 left-2">
                                                <span className="text-[10px] bg-white/80 backdrop-blur-sm text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 font-bold">
                                                    {item.type === 'plant' ? '植物' : '家具'}
                                                </span>
                                            </div>
                                            {ownedCount > 0 && (
                                                <div className="absolute bottom-2 right-2">
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                                                        擁有: {ownedCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-slate-700 leading-tight">{item.name}</div>
                                            <div className="text-xs text-slate-400 line-clamp-1">{item.description}</div>
                                            
                                            <button 
                                                disabled={gameState.coins < item.price}
                                                onClick={() => buyDecoration(item.id)}
                                                className="mt-2 w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 group-hover:bg-amber-500 disabled:opacity-50 disabled:group-hover:bg-slate-900 transition-colors active:scale-95"
                                            >
                                                <Coins size={12} className="text-amber-400 group-hover:text-white" /> 
                                                {item.price} 購買
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-2 text-center text-slate-400 py-12">
                                    <Store size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>沒有符合的商品</p>
                                </div>
                            )
                        )}
                      </div>
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
                          return (
                              <button
                                key={petId}
                                onClick={() => {
                                    placePetInArea(currentArea.id, petId, PetStage.ADULT); 
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
