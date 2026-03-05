import React, { useRef, useCallback, useState, memo } from 'react';
import { Habit, GameState } from '../types';
import { X, Download, Share2, Camera, Sparkles } from 'lucide-react';
import { getPetStage } from '../utils/gameLogic';
import { PET_DEFINITIONS } from '../utils/petData';

interface Props {
  habit: Habit;
  gameState: GameState;
  onClose: () => void;
}

const ShareCard: React.FC<Props> = memo(function ShareCard({ habit, gameState, onClose }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState<'stats' | 'streak' | 'achievement'>('stats');

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (2x for retina)
    const width = 600;
    const height = 800;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Get pet info
    const pet = PET_DEFINITIONS.find(p => p.id === habit.petId);
    const stage = getPetStage(habit.currentLevel);
    const petEmoji = pet?.stages[stage.toLowerCase() as 'egg' | 'baby' | 'child' | 'adult'] || '🥚';
    
    // Calculate stats
    const totalStamps = Object.values(habit.logs).filter(l => l.stamped).length;

    // Draw based on card style
    if (cardStyle === 'stats') {
      drawStatsCard(ctx, width, height, habit, petEmoji, totalStamps);
    } else if (cardStyle === 'streak') {
      drawStreakCard(ctx, width, height, habit, petEmoji);
    } else {
      drawAchievementCard(ctx, width, height, habit, petEmoji, gameState);
    }

    // Convert to image
    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedImage(dataUrl);
    setIsGenerating(false);
  }, [habit, gameState, cardStyle]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `growday_${habit.name}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = generatedImage;
    link.click();
  }, [generatedImage, habit.name]);

  const handleShare = useCallback(async () => {
    if (!generatedImage) return;

    try {
      // Convert data URL to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], 'growday_share.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'GrowDay 打卡紀錄',
          text: `我在 GrowDay 養成「${habit.name}」習慣已經 ${habit.currentStreak} 天連續打卡了！🌱`,
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard or show message
        alert('您的瀏覽器不支援分享功能，請使用下載按鈕儲存圖片後手動分享');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [generatedImage, habit]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Share2 size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">分享卡片</h2>
                <p className="text-pink-200 text-sm">生成精美的打卡紀錄</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Card Style Selector */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex gap-2">
            {[
              { id: 'stats', label: '📊 數據卡', desc: '展示打卡統計' },
              { id: 'streak', label: '🔥 連續卡', desc: '展示連續天數' },
              { id: 'achievement', label: '🏆 成就卡', desc: '展示獲得成就' },
            ].map(style => (
              <button
                key={style.id}
                onClick={() => {
                  setCardStyle(style.id as 'stats' | 'streak' | 'achievement');
                  setGeneratedImage(null);
                }}
                className={`
                  flex-1 p-3 rounded-xl text-center transition-all
                  ${cardStyle === style.id
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-2 border-pink-300 dark:border-pink-700'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-transparent'
                  }
                `}
              >
                <div className="font-bold text-sm">{style.label}</div>
                <div className="text-xs opacity-70">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Preview */}
          {generatedImage ? (
            <div className="w-full max-w-[300px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-600">
              <img src={generatedImage} alt="Generated card" className="w-full" />
            </div>
          ) : (
            <div className="w-full max-w-[300px] aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-300 dark:border-slate-600">
              <Camera className="text-slate-400" size={48} />
              <p className="text-slate-500 dark:text-slate-400 text-center px-4">
                點擊下方按鈕生成卡片
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateCard}
            disabled={isGenerating}
            className={`
              mt-6 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
              ${isGenerating
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:scale-105'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                {generatedImage ? '重新生成' : '生成卡片'}
              </>
            )}
          </button>
        </div>

        {/* Footer Actions */}
        {generatedImage && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              下載圖片
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              分享
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// Drawing functions
function drawStatsCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  habit: Habit,
  petEmoji: string,
  totalStamps: number
) {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#fdf2f8');
  gradient.addColorStop(1, '#fce7f3');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative circles
  ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
  ctx.beginPath();
  ctx.arc(-50, -50, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width + 50, height + 50, 250, 0, Math.PI * 2);
  ctx.fill();

  // Title
  ctx.fillStyle = '#831843';
  ctx.font = 'bold 24px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🌱 GrowDay', width / 2, 50);

  // Pet emoji
  ctx.font = '80px system-ui';
  ctx.fillText(petEmoji, width / 2, 180);

  // Habit name
  ctx.fillStyle = '#be185d';
  ctx.font = 'bold 32px system-ui';
  ctx.fillText(habit.name, width / 2, 260);

  // Stats boxes
  const stats = [
    { label: '總打卡', value: `${totalStamps} 天`, icon: '📅' },
    { label: '連續', value: `${habit.currentStreak} 天`, icon: '🔥' },
    { label: '最長連續', value: `${habit.longestStreak} 天`, icon: '🏆' },
    { label: '等級', value: `Lv.${habit.currentLevel}`, icon: '⭐' },
  ];

  const boxWidth = 120;
  const boxHeight = 100;
  const startX = (width - boxWidth * 2 - 20) / 2;
  const startY = 320;

  stats.forEach((stat, i) => {
    const x = startX + (i % 2) * (boxWidth + 20);
    const y = startY + Math.floor(i / 2) * (boxHeight + 20);

    // Box
    ctx.fillStyle = 'white';
    roundRect(ctx, x, y, boxWidth, boxHeight, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 24, 93, 0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, boxWidth, boxHeight, 16);
    ctx.stroke();

    // Icon
    ctx.font = '24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stat.icon, x + boxWidth / 2, y + 35);

    // Value
    ctx.fillStyle = '#be185d';
    ctx.font = 'bold 22px system-ui';
    ctx.fillText(stat.value, x + boxWidth / 2, y + 65);

    // Label
    ctx.fillStyle = '#9d174d';
    ctx.font = '12px system-ui';
    ctx.fillText(stat.label, x + boxWidth / 2, y + 85);
  });

  // Date
  ctx.fillStyle = '#9d174d';
  ctx.font = '14px system-ui';
  ctx.textAlign = 'center';
  const date = new Date().toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  ctx.fillText(date, width / 2, height - 50);

  // Watermark
  ctx.fillStyle = 'rgba(157, 23, 77, 0.3)';
  ctx.font = '12px system-ui';
  ctx.fillText('Created with GrowDay', width / 2, height - 25);
}

function drawStreakCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  habit: Habit,
  petEmoji: string
) {
  // Background gradient (fire theme)
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#fef3c7');
  gradient.addColorStop(1, '#fde68a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Fire emoji big
  ctx.font = '120px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🔥', width / 2, 200);

  // Streak number
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 80px system-ui';
  ctx.fillText(`${habit.currentStreak}`, width / 2, 340);

  ctx.font = 'bold 28px system-ui';
  ctx.fillText('天連續打卡', width / 2, 390);

  // Habit name with pet
  ctx.font = '48px system-ui';
  ctx.fillText(petEmoji, width / 2, 480);
  
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 26px system-ui';
  ctx.fillText(habit.name, width / 2, 530);

  // Motivational text
  ctx.fillStyle = '#92400e';
  ctx.font = '18px system-ui';
  const messages = [
    '堅持就是力量！',
    '你做到了！',
    '持續成長中！',
    '太厲害了！',
  ];
  ctx.fillText(messages[habit.currentStreak % messages.length], width / 2, 600);

  // Date & watermark
  ctx.fillStyle = 'rgba(146, 64, 14, 0.5)';
  ctx.font = '14px system-ui';
  const date = new Date().toLocaleDateString('zh-TW');
  ctx.fillText(date, width / 2, height - 50);
  ctx.fillStyle = 'rgba(146, 64, 14, 0.3)';
  ctx.font = '12px system-ui';
  ctx.fillText('Created with GrowDay', width / 2, height - 25);
}

function drawAchievementCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  habit: Habit,
  petEmoji: string,
  gameState: GameState
) {
  // Background gradient (gold theme)
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#fefce8');
  gradient.addColorStop(1, '#fef08a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Trophy
  ctx.font = '100px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', width / 2, 180);

  // Achievement count
  const achievementCount = gameState.unlockedAchievements?.length || 0;
  ctx.fillStyle = '#713f12';
  ctx.font = 'bold 48px system-ui';
  ctx.fillText(`${achievementCount}`, width / 2, 290);
  ctx.font = 'bold 24px system-ui';
  ctx.fillText('個成就達成', width / 2, 330);

  // Stats row
  ctx.fillStyle = '#854d0e';
  ctx.font = '16px system-ui';
  const totalPets = gameState.unlockedPets?.length || 0;
  const totalCoins = gameState.coins || 0;
  ctx.fillText(`🐾 ${totalPets} 寵物  •  💰 ${totalCoins} 金幣`, width / 2, 400);

  // Pet and habit
  ctx.font = '48px system-ui';
  ctx.fillText(petEmoji, width / 2, 500);
  
  ctx.fillStyle = '#a16207';
  ctx.font = 'bold 24px system-ui';
  ctx.fillText(habit.name, width / 2, 550);
  
  ctx.font = '16px system-ui';
  ctx.fillText(`Lv.${habit.currentLevel} • ${habit.currentStreak}天連續`, width / 2, 585);

  // Date & watermark
  ctx.fillStyle = 'rgba(113, 63, 18, 0.5)';
  ctx.font = '14px system-ui';
  const date = new Date().toLocaleDateString('zh-TW');
  ctx.fillText(date, width / 2, height - 50);
  ctx.fillStyle = 'rgba(113, 63, 18, 0.3)';
  ctx.font = '12px system-ui';
  ctx.fillText('Created with GrowDay', width / 2, height - 25);
}

// Helper function for rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default ShareCard;
