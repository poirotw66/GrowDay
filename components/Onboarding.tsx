import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [habit, setHabit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habit.trim()) {
      onComplete(habit.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50 text-slate-800">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border-4 border-orange-100">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
          <Sparkles className="w-12 h-12 text-orange-500" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-orange-900 tracking-tight">歡迎來到 GrowDay</h1>
        <p className="text-slate-500 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
          讓我們開始建造你的小世界。<br/>
          每天一點點，你的世界就會長大。<br/>
          請問，你想培養的一個習慣是什麼？
        </p>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
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
            className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-5 px-8 rounded-2xl shadow-xl transform transition active:scale-95 text-xl tracking-wide"
          >
            開始我的旅程
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
