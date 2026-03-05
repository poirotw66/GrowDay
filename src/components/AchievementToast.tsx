
import React, { useEffect, memo } from 'react';
import { AchievementDef } from '../utils/achievementData';
import { Coins, X } from 'lucide-react';

interface Props {
  achievement: AchievementDef;
  onDismiss: () => void;
}

const AchievementToast: React.FC<Props> = memo(function AchievementToast({ achievement, onDismiss }) {
  const Icon = achievement.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
        onDismiss();
    }, 5000); // Auto dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-500">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden flex items-center gap-4">
            
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg text-slate-900 animate-bounce-short">
                <Icon size={24} />
            </div>

            <div className="flex-1">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-0.5">成就解鎖!</div>
                <div className="font-bold text-lg leading-none mb-1">{achievement.title}</div>
                <div className="text-slate-300 text-xs flex items-center gap-1">
                    <Coins size={10} className="text-amber-400" />
                    獲得 {achievement.rewardCoins} 金幣
                </div>
            </div>

            <button onClick={onDismiss} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                <X size={16} />
            </button>
        </div>
    </div>
  );
});

export default AchievementToast;
