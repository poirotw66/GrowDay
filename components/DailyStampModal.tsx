
import React, { useState, useRef } from 'react';
import { STAMP_ICONS, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { X, Star } from 'lucide-react';
import { playStampSound } from '../utils/audio';

interface Props {
  habitName: string;
  stampIconId: string;
  stampColor: string;
  selectedSound: string;
  onConfirm: (x: number, y: number, rotation: number) => void;
  onClose: () => void;
}

const DailyStampModal: React.FC<Props> = ({ habitName, stampIconId, stampColor, selectedSound, onConfirm, onClose }) => {
  const [stampedPos, setStampedPos] = useState<{x: number, y: number, rotation: number} | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  // Get the icon component directly from the record
  const StampIcon = STAMP_ICONS[stampIconId] || Star;
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const yearStr = today.getFullYear();
  const color = stampColor || DEFAULT_STAMP_COLOR;

  const handlePaperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stampedPos) return; // Prevent double stamping

    if (paperRef.current) {
      const rect = paperRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate percentage for responsiveness
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      const rotation = Math.random() * 40 - 20; // -20 to 20 degrees

      // Play Sound with selected ID!
      playStampSound(selectedSound);

      setStampedPos({ x: xPercent, y: yPercent, rotation });

      // Wait for animation to finish then close/confirm
      setTimeout(() => {
        onConfirm(xPercent, yPercent, rotation);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Close Button (if they want to cancel) */}
      {!stampedPos && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
          >
            <X size={32} />
          </button>
      )}

      {/* The "Paper" Container */}
      <div 
        ref={paperRef}
        onClick={handlePaperClick}
        className={`
            relative bg-[#fdfbf7] w-[85vw] max-w-[360px] aspect-[3/4] rounded-sm shadow-2xl 
            flex flex-col items-center p-8 cursor-pointer select-none overflow-hidden
            transition-transform duration-300
            ${stampedPos ? 'scale-100' : 'hover:scale-[1.02] active:scale-[0.98]'}
            before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-2 before:bg-opacity-80
        `}
        style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)'
        }}
      >
        {/* Color stripe at top */}
        <div className="absolute top-0 left-0 w-full h-2 bg-opacity-80" style={{ backgroundColor: color }}></div>

        {/* Date Header */}
        <div className="w-full border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
            <div>
                <div className="text-slate-400 text-sm font-bold tracking-widest">{yearStr}</div>
                <div className="text-slate-800 text-4xl font-black tracking-tighter">{dateStr}</div>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded">DAILY LOG</div>
            </div>
        </div>

        {/* Content Placeholder */}
        <div className="w-full flex-1 flex flex-col items-center justify-center opacity-40 gap-4">
             <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-slate-400">"{habitName}"</h2>
                 <p className="text-sm text-slate-400 font-medium">點擊任意處蓋章</p>
             </div>
        </div>

        {/* The Stamp (Appears on Click) */}
        {stampedPos && (
            <div 
                className="absolute z-50 mix-blend-multiply"
                style={{
                    color: color,
                    left: `${stampedPos.x}%`,
                    top: `${stampedPos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${stampedPos.rotation}deg)`,
                    animation: 'stamp-slam 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                }}
            >
                <div className="relative">
                    <StampIcon size={120} strokeWidth={2.5} />
                    {/* Ink Splatter Effect */}
                    <div className="absolute inset-0 border-4 rounded-full opacity-0 animate-ping" style={{ borderColor: color, animationDuration: '0.5s' }}></div>
                </div>
            </div>
        )}

        {/* Floating Instruction (Hidden after stamp) */}
        {!stampedPos && (
            <div className="absolute bottom-6 animate-bounce text-slate-400 text-sm font-bold">
                Tap to Stamp
            </div>
        )}
      </div>

      <style>{`
        @keyframes stamp-slam {
            0% { transform: translate(-50%, -50%) rotate(${stampedPos?.rotation || 0}deg) scale(3); opacity: 0; }
            100% { transform: translate(-50%, -50%) rotate(${stampedPos?.rotation || 0}deg) scale(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default DailyStampModal;
