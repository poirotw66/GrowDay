import React from 'react';
import { LogIn, User } from 'lucide-react';

const GUEST_CHOICE_KEY = 'growday_guest_choice';

export function getGuestChoiceStored(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(GUEST_CHOICE_KEY) === 'true';
}

export function setGuestChoiceStored(): void {
  localStorage.setItem(GUEST_CHOICE_KEY, 'true');
}

interface Props {
  onSignIn: () => Promise<void>;
  onContinueAsGuest: () => void;
  signInLoading?: boolean;
  signInError?: string | null;
}

const EntryChoice: React.FC<Props> = ({ onSignIn, onContinueAsGuest, signInLoading = false, signInError = null }) => {
  const handleGuest = () => {
    setGuestChoiceStored();
    onContinueAsGuest();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 lg:p-10 text-center border-4 border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">GrowDay</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          使用 Google 登入可跨裝置同步資料，或直接開始使用（僅存於本機）。
        </p>
        {signInError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
            登入失敗，請重試。
          </p>
        )}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => onSignIn()}
            disabled={signInLoading}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-60 disabled:pointer-events-none"
          >
            <LogIn size={22} />
            {signInLoading ? '登入中…' : 'Google 登入（同步資料）'}
          </button>
          <button
            type="button"
            onClick={handleGuest}
            disabled={signInLoading}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-60 disabled:pointer-events-none"
          >
            <User size={22} />
            不登入，直接使用
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryChoice;
