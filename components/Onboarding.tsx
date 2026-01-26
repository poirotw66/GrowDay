import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { STAMP_OPTIONS } from '../utils/stampIcons';

interface Props {
  onComplete: (name: string, icon: string) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [habit, setHabit] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (habit.trim()) {
      setStep(2);
    }
  };

  const handleFinalSubmit = () => {
    if (habit.trim() && selectedIcon) {
      onComplete(habit.trim(), selectedIcon);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50 text-slate-800">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 text-center border-4 border-orange-100 transition-all duration-500">
        
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200'}`}></div>
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200'}`}></div>
        </div>

        {/* Step 1: Naming */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
              <Sparkles className="w-12 h-12 text-orange-500" />
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-orange-900 tracking-tight">歡迎來到 GrowDay</h1>
            <p className="text-slate-500 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
              讓我們開始建造你的小世界。<br/>
              每天一點點，你的世界就會長大。<br/>
              請問，你想培養的一個習慣是什麼？
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

              <button
                type="submit"
                disabled={!habit.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-5 px-8 rounded-2xl shadow-xl transform transition active:scale-95 text-xl tracking-wide flex items-center justify-center gap-2"
              >
                下一步 <ArrowRight />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Icon Selection */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-orange-900 tracking-tight">選擇你的印章</h1>
                <p className="text-slate-500 text-lg">
                    這個圖案將代表你的每一次努力。<br/>
                    選一個你看到會開心的符號吧！
                </p>
             </div>

             <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-10 max-w-lg mx-auto">
                {STAMP_OPTIONS.map((option) => {
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
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} /> 返回
                </button>
                <button
                    onClick={handleFinalSubmit}
                    className="flex-[2] bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform transition active:scale-95 tracking-wide"
                >
                    開始我的旅程
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
