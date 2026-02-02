
import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { STAMP_OPTIONS, STAMP_COLORS, DEFAULT_STAMP_COLOR } from '../utils/stampIcons';
import { PetColor } from '../types';
import { getColorName } from '../utils/petData';

interface Props {
  onComplete: (name: string, icon: string, color: PetColor, stampColor: string) => void;
  isAddingNew?: boolean; // If true, change text slightly
  onCancel?: () => void;
}

const COLOR_OPTIONS: { id: PetColor, emoji: string }[] = [
    { id: 'red', emoji: '🔥' },
    { id: 'blue', emoji: '💧' },
    { id: 'green', emoji: '🌿' },
    { id: 'purple', emoji: '🔮' },
];

const Onboarding: React.FC<Props> = ({ onComplete, isAddingNew = false, onCancel }) => {
  const [step, setStep] = useState(1);
  const [habit, setHabit] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedStampColor, setSelectedStampColor] = useState(DEFAULT_STAMP_COLOR);
  const [selectedColor, setSelectedColor] = useState<PetColor>('green');

  // Filter only icons that don't have an unlock hint (Defaults)
  const availableIcons = STAMP_OPTIONS.filter(opt => !opt.unlockHint);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (habit.trim()) {
      setStep(2);
    }
  };

  const handleFinalSubmit = () => {
    if (habit.trim() && selectedIcon) {
      onComplete(habit.trim(), selectedIcon, selectedColor, selectedStampColor);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 ${isAddingNew ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 lg:p-12 text-center border-4 border-slate-100 dark:border-slate-700 transition-all duration-500 overflow-y-auto max-h-[90vh]">
        
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200 dark:bg-slate-600'}`}></div>
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200 dark:bg-slate-600'}`}></div>
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200 dark:bg-slate-600'}`}></div>
        </div>

        {/* Step 1: Naming */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
              <Sparkles className="w-12 h-12 text-orange-500" />
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100 tracking-tight">
                {isAddingNew ? "開啟一個新世界" : "歡迎來到 GrowDay"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
              {isAddingNew 
                ? "又準備好挑戰新的目標了嗎？這次想培養什麼習慣？" 
                : "讓我們開始建造你的小世界。每天一點點，你的世界就會長大。請問，你想培養的一個習慣是什麼？"}
            </p>

            <form onSubmit={handleNextStep} className="space-y-8 max-w-md mx-auto">
              <div>
                <input
                  type="text"
                  value={habit}
                  onChange={(e) => setHabit(e.target.value)}
                  placeholder="例如：閱讀 10 分鐘、喝水、運動..."
                  className="w-full text-center text-2xl p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:border-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500 shadow-inner"
                  maxLength={25}
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                 {isAddingNew && onCancel && (
                    <button type="button" onClick={onCancel} className="flex-1 py-5 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                        取消
                    </button>
                 )}
                 <button
                    type="submit"
                    disabled={!habit.trim()}
                    className="flex-[2] bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-5 px-8 rounded-2xl shadow-xl transform transition active:scale-95 text-xl tracking-wide flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                 >
                    下一步 <ArrowRight />
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Color Selection (Egg) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-100 tracking-tight">選擇精靈蛋的顏色</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    不同顏色的蛋孕育著不同屬性的精靈。<br/>
                    這隻精靈將會是你這個目標的專屬守護者。
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
                {COLOR_OPTIONS.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => setSelectedColor(opt.id)}
                        className={`
                            relative p-6 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center gap-3
                            ${selectedColor === opt.id 
                                ? 'border-slate-800 dark:border-orange-500 bg-slate-50 dark:bg-slate-700 shadow-xl scale-105' 
                                : 'border-transparent bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 grayscale hover:grayscale-0'
                            }
                        `}
                    >
                        <div className={`text-6xl ${selectedColor === opt.id ? 'animate-bounce-short' : ''}`}>🥚</div>
                        <div className="font-bold text-lg text-slate-700 dark:text-slate-200">
                             {getColorName(opt.id)}
                             <span className="ml-2 text-xl">{opt.emoji}</span>
                        </div>
                        {selectedColor === opt.id && (
                             <div className="absolute top-3 right-3 text-green-500">
                                 <Sparkles size={20} fill="currentColor" />
                             </div>
                        )}
                    </button>
                ))}
             </div>

             <div className="flex gap-4 max-w-md mx-auto">
                <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} /> 返回
                </button>
                <button
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform transition active:scale-95 tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                >
                    選好了
                </button>
             </div>
          </div>
        )}

        {/* Step 3: Icon & Color Selection */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-100 tracking-tight">選擇你的打卡印章</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    最後，選一個喜歡的圖案和顏色。<br/>
                    這將是你每天努力的證明。
                </p>
             </div>

             {/* Icon Grid */}
             <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6 max-w-lg mx-auto">
                {availableIcons.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedIcon === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => setSelectedIcon(option.id)}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-200
                                ${isSelected 
                                    ? 'bg-slate-800 dark:bg-orange-500 text-white shadow-lg scale-110 ring-4 ring-slate-200 dark:ring-orange-400/50' 
                                    : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                                }
                            `}
                        >
                            <Icon size={28} fill={isSelected ? "currentColor" : "none"} style={{ color: isSelected ? selectedStampColor : undefined }} />
                        </button>
                    );
                })}
             </div>
             
             {/* Color Picker */}
             <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-md mx-auto bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
                {STAMP_COLORS.map((color) => {
                    const isSelected = selectedStampColor === color.hex;
                    return (
                        <button
                            key={color.id}
                            onClick={() => setSelectedStampColor(color.hex)}
                            className={`
                                w-8 h-8 rounded-full transition-transform duration-200 flex items-center justify-center
                                ${isSelected ? 'scale-125 ring-2 ring-offset-2 ring-slate-300 dark:ring-orange-400' : 'hover:scale-110'}
                            `}
                            style={{ backgroundColor: color.hex }}
                        >
                            {isSelected && <Check size={14} className="text-white" />}
                        </button>
                    );
                })}
             </div>

             <div className="flex gap-4 max-w-md mx-auto">
                <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} /> 返回
                </button>
                <button
                    onClick={handleFinalSubmit}
                    className="flex-[2] text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform transition active:scale-95 tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50"
                    style={{ backgroundColor: selectedStampColor }}
                >
                    開始旅程
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
