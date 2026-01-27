
import React, { useEffect, useState } from 'react';
import { getStageConfig, STAGE_THRESHOLDS } from '../utils/gameLogic';
import { Habit, PetStage } from '../types';
import { PartyPopper, Info, X, Medal, Sparkles } from 'lucide-react';
import { getPetEmoji } from '../utils/petData';

interface Props {
  habit: Habit;
  justStamped: boolean;
  className?: string;
  onRetire: (id: string) => void;
}

const PetDisplay: React.FC<Props> = ({ habit, justStamped, className = "", onRetire }) => {
  const config = getStageConfig(habit.currentLevel, habit.petColor);
  const [bounce, setBounce] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showRetireConfirm, setShowRetireConfirm] = useState(false);
  
  const currentEmoji = getPetEmoji(habit.petId, config.stage);
  const isMaxLevel = habit.currentLevel >= STAGE_THRESHOLDS.ADULT;

  // Trigger bounce animation when justStamped becomes true
  useEffect(() => {
    if (justStamped) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [justStamped]);

  // Next level progress calculation (Bar)
  const expForCurrentLevel = (habit.currentLevel - 1) * 10;
  const progressInLevel = habit.totalExp - expForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (progressInLevel / 10) * 100));

  // Next Stage Calculation (Guide)
  let nextStageTarget = 0;
  let nextStageName = '';
  
  if (habit.currentLevel < STAGE_THRESHOLDS.BABY) {
    nextStageTarget = STAGE_THRESHOLDS.BABY;
    nextStageName = '幼年期';
  } else if (habit.currentLevel < STAGE_THRESHOLDS.CHILD) {
    nextStageTarget = STAGE_THRESHOLDS.CHILD;
    nextStageName = '成長期';
  } else if (habit.currentLevel < STAGE_THRESHOLDS.ADULT) {
    nextStageTarget = STAGE_THRESHOLDS.ADULT;
    nextStageName = '完全體';
  }

  const daysToNextStage = nextStageTarget > 0 ? nextStageTarget - habit.currentLevel : 0;

  // Stages definition for the timeline UI
  const timelineStages = [
      { label: '孵化期', range: `Lv.1 - ${STAGE_THRESHOLDS.BABY - 1}`, emoji: getPetEmoji(habit.petId, PetStage.EGG), reached: true },
      { label: '幼年期', range: `Lv.${STAGE_THRESHOLDS.BABY} - ${STAGE_THRESHOLDS.CHILD - 1}`, emoji: getPetEmoji(habit.petId, PetStage.BABY), reached: habit.currentLevel >= STAGE_THRESHOLDS.BABY },
      { label: '成長期', range: `Lv.${STAGE_THRESHOLDS.CHILD} - ${STAGE_THRESHOLDS.ADULT - 1}`, emoji: getPetEmoji(habit.petId, PetStage.CHILD), reached: habit.currentLevel >= STAGE_THRESHOLDS.CHILD },
      { label: '完全體', range: `Lv.${STAGE_THRESHOLDS.ADULT}+`, emoji: getPetEmoji(habit.petId, PetStage.ADULT), reached: habit.currentLevel >= STAGE_THRESHOLDS.ADULT },
  ];

  return (
    <div className={`relative w-full ${config.colorBg} rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center transition-colors duration-700 overflow-hidden ${className}`}>
      
      {/* Decorative background circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-white opacity-20 rounded-full blur-3xl"></div>

      {/* Generation Badge (if > 1) */}
      {habit.generation && habit.generation > 1 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-white/50 z-20">
              第 {habit.generation} 世代
          </div>
      )}

      {/* Info Button (Top Left) */}
      <button 
        onClick={() => setShowInfo(true)}
        className="absolute top-8 left-8 p-2 bg-white/50 hover:bg-white/80 rounded-full text-slate-600 transition-colors z-20"
        title="成長指南"
      >
        <Info size={20} />
      </button>

      {/* Level Badge (Top Right) */}
      <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2 z-20">
        <span className="text-amber-500 text-base">Lv.{habit.currentLevel}</span>
        <span className="w-px h-3 bg-slate-300"></span>
        <span className="uppercase tracking-wide text-xs">{config.label}</span>
      </div>

      {/* The Pet Character */}
      <div className={`relative z-10 transition-transform duration-500 p-8 ${bounce ? 'animate-bounce' : 'animate-float'}`}>
         {/* Confetti effect overlay when bouncing */}
         {bounce && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-ping">
               <PartyPopper size={64} />
            </div>
         )}
         
        <div className="text-[10rem] md:text-[12rem] lg:text-[14rem] filter drop-shadow-2xl select-none transform transition-all hover:scale-105 cursor-pointer leading-none">
          {currentEmoji}
        </div>
        
        {/* Shadow under pet */}
        <div className="w-32 h-6 bg-black opacity-10 rounded-[100%] mx-auto mt-0 blur-md"></div>
      </div>

      {/* Status Text */}
      <div className="mt-8 text-center z-10 px-8 max-w-lg">
        <h2 className="text-3xl font-bold text-slate-700 opacity-90 mb-3 tracking-tight">
            {habit.name}
        </h2>
        <p className="text-slate-600 text-lg font-medium opacity-80 leading-relaxed">
            {bounce ? "太棒了！你的世界正在成長！" : config.description}
        </p>
      </div>

      {/* Progress Bar or Legacy Button */}
      <div className="absolute bottom-0 w-full">
         {isMaxLevel ? (
             <button 
                onClick={() => setShowRetireConfirm(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-inner animate-pulse"
             >
                 <Medal size={20} />
                 進入榮譽殿堂 (傳承)
             </button>
         ) : (
             <div className="w-full h-3 bg-white/30">
                <div 
                    className="h-full bg-amber-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
         )}
      </div>

      {/* Retirement Confirmation Modal */}
      {showRetireConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
             <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                 <Medal size={40} className="text-amber-500" />
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">精靈傳承</h3>
             <p className="text-slate-500 text-center mb-8 leading-relaxed max-w-xs">
                 恭喜！您的精靈已經達到完美型態。<br/><br/>
                 選擇「退休」將使牠進入榮譽殿堂，並為您提供 <strong className="text-amber-600">永久金幣加成 +10%</strong>。<br/>
                 此習慣將繼承意志，孵化出一顆新蛋（第 {habit.generation ? habit.generation + 1 : 2} 世代）。
             </p>
             <div className="flex flex-col gap-3 w-full max-w-xs">
                 <button 
                    onClick={() => {
                        onRetire(habit.id);
                        setShowRetireConfirm(false);
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
                 >
                     <Sparkles size={18} className="text-amber-400" />
                     確認傳承
                 </button>
                 <button 
                    onClick={() => setShowRetireConfirm(false)}
                    className="w-full py-3 text-slate-400 font-bold hover:text-slate-600"
                 >
                     稍後再說
                 </button>
             </div>
          </div>
      )}

      {/* Growth Guide Modal/Overlay */}
      {showInfo && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🌱</span> 成長指南
                </h3>
                <button 
                    onClick={() => setShowInfo(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start max-w-md mx-auto w-full">
                {/* Next Goal Highlight */}
                {daysToNextStage > 0 ? (
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-2xl p-4 w-full mb-8 text-center shadow-sm">
                        <p className="text-slate-600 font-medium mb-1">距離下一階段 <span className="text-orange-600 font-bold">{nextStageName}</span></p>
                        <p className="text-3xl font-bold text-slate-800">
                            再堅持 <span className="text-orange-500 text-4xl">{daysToNextStage}</span> 天
                        </p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-2xl p-4 w-full mb-8 text-center shadow-sm">
                        <p className="text-amber-700 font-bold text-lg">🎉 已達到最高階段！</p>
                        <p className="text-amber-600 text-sm">您可以選擇讓精靈退休以獲得永久加成。</p>
                    </div>
                )}

                {/* Timeline */}
                <div className="w-full space-y-4">
                    {timelineStages.map((stage, index) => (
                        <div key={stage.label} className={`relative flex items-center gap-4 p-3 rounded-xl transition-all ${stage.reached ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            {/* Connector Line */}
                            {index !== timelineStages.length - 1 && (
                                <div className="absolute left-8 top-12 bottom-[-20px] w-1 bg-slate-200 -z-10"></div>
                            )}

                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm border-4 ${stage.reached ? 'bg-white border-orange-200' : 'bg-slate-100 border-slate-200'}`}>
                                {stage.emoji}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`font-bold text-lg ${stage.reached ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {stage.label}
                                    </h4>
                                    {stage.reached && habit.currentLevel < (timelineStages[index + 1]?.range.match(/\d+/)?.[0] ? parseInt(timelineStages[index + 1].range.match(/\d+/)?.[0]!) : 999) && habit.currentLevel >= parseInt(stage.range.match(/\d+/)?.[0]!) && (
                                         <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">CURRENT</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">{stage.range}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PetDisplay;
