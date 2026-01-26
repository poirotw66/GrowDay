import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { STAMP_OPTIONS } from '../utils/stampIcons';
import { PetColor } from '../types';
import { getColorName, getColorBg } from '../utils/petData';

interface Props {
  onComplete: (name: string, icon: string, color: PetColor) => void;
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
      onComplete(habit.trim(), selectedIcon, selectedColor);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 ${isAddingNew ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 text-center border-4 border-slate-100 transition-all duration-500 overflow-y-auto max-h-[90vh]">
        
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200'}`}></div>
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200'}`}></div>
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200'}`}></div>
        </div>

        {/* Step 1: Naming */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
              <Sparkles className="w-12 h-12 text-orange-500" />
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800 tracking-tight">
                {isAddingNew ? "開啟一個新世界" : "歡迎來到 GrowDay"}
            </h1>
            <p className="text-slate-500 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
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
                  className="w-full text-center text-2xl p-6 rounded-2xl border-2 border-slate-200 focus:border-orange-400 focus:outline-none transition-all placeholder:text-slate-300 shadow-inner"
                  maxLength={25}
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                 {isAddingNew && onCancel && (
                    <button type="button" onClick={onCancel} className="flex-1 py-5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">
                        取消
                    </button>
                 )}
                 <button
                    type="submit"
                    disabled={!habit.trim()}
                    className="flex-[2] bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-5 px-8 rounded-2xl shadow-xl transform transition active:scale-95 text-xl tracking-wide flex items-center justify-center gap-2"
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
                <h1 className="text-3xl font-bold mb-3 text-slate-800 tracking-tight">選擇精靈蛋的顏色</h1>
                <p className="text-slate-500 text-lg">
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
                                ? 'border-slate-800 bg-slate-50 shadow-xl scale-105' 
                                : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-400 grayscale hover:grayscale-0'
                            }
                        `}
                    >
                        <div className={`text-6xl ${selectedColor === opt.id ? 'animate-bounce-short' : ''}`}>🥚</div>
                        <div className="font-bold text-lg text-slate-700">
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
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} /> 返回
                </button>
                <button
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform transition active:scale-95 tracking-wide"
                >
                    選好了
                </button>
             </div>
          </div>
        )}

        {/* Step 3: Icon Selection */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-slate-800 tracking-tight">選擇你的打卡印章</h1>
                <p className="text-slate-500 text-lg">
                    最後，選一個喜歡的圖案。<br/>
                    這將是你每天努力的證明。
                </p>
             </div>

             <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-10 max-w-lg mx-auto">
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
                                    ? 'bg-orange-500 text-white shadow-lg scale-110 ring-4 ring-orange-200' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-orange-100 hover:text-orange-500'
                                }
                            `}
                        >
                            <Icon size={28} fill={isSelected ? "currentColor" : "none"} />
                        </button>
                    );
                })}
             </div>

             <div className="flex gap-4 max-w-md mx-auto">
                <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} /> 返回
                </button>
                <button
                    onClick={handleFinalSubmit}
                    className="flex-[2] bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform transition active:scale-95 tracking-wide"
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
