import React, { useEffect, useState } from 'react';
import { getStageConfig } from '../utils/gameLogic';
import { GameState } from '../types';
import { PartyPopper } from 'lucide-react';

interface Props {
  gameState: GameState;
  justStamped: boolean;
  className?: string;
}

const PetDisplay: React.FC<Props> = ({ gameState, justStamped, className = "" }) => {
  const config = getStageConfig(gameState.currentLevel);
  const [bounce, setBounce] = useState(false);

  // Trigger bounce animation when justStamped becomes true
  useEffect(() => {
    if (justStamped) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [justStamped]);

  // Next level progress calculation
  const expForCurrentLevel = (gameState.currentLevel - 1) * 10;
  const expForNextLevel = gameState.currentLevel * 10;
  const progressInLevel = gameState.totalExp - expForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (progressInLevel / 10) * 100));

  return (
    <div className={`relative w-full ${config.colorBg} rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center transition-colors duration-700 overflow-hidden ${className}`}>
      
      {/* Decorative background circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-white opacity-20 rounded-full blur-3xl"></div>

      {/* Level Badge */}
      <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2 z-20">
        <span className="text-amber-500 text-base">Lv.{gameState.currentLevel}</span>
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
          {config.emoji}
        </div>
        
        {/* Shadow under pet */}
        <div className="w-32 h-6 bg-black opacity-10 rounded-[100%] mx-auto mt-0 blur-md"></div>
      </div>

      {/* Status Text */}
      <div className="mt-8 text-center z-10 px-8 max-w-lg">
        <h2 className="text-3xl font-bold text-slate-700 opacity-90 mb-3 tracking-tight">
            {gameState.habitName}
        </h2>
        <p className="text-slate-600 text-lg font-medium opacity-80 leading-relaxed">
            {bounce ? "太棒了！你的世界正在成長！" : config.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 w-full h-3 bg-white/30">
        <div 
            className="h-full bg-amber-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{ width: `${progressPercent}%` }}
        />
      </div>
      
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
