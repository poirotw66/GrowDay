import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import SyncStatus from './SyncStatus';
import type { SyncStatusValue } from './SyncStatus';

export interface AuthUser {
  uid: string;
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
}

interface UserMenuProps {
  user: AuthUser | null;
  syncStatus: SyncStatusValue;
  isFirebaseEnabled: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
  signInLoading: boolean;
  userImageError: Record<string, boolean>;
  setUserImageError: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

/**
 * Logged-in: sync status, avatar, email, sign-out. Logged-out: sign-in button.
 */
export default function UserMenu({
  user,
  syncStatus,
  isFirebaseEnabled,
  signInWithGoogle,
  signOut,
  signInLoading,
  userImageError,
  setUserImageError,
}: UserMenuProps) {
  if (!isFirebaseEnabled) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <SyncStatus status={syncStatus} />
        {user.photoURL && !userImageError[user.uid] ? (
          <img
            src={user.photoURL}
            alt={user.displayName || user.email || '用戶頭像'}
            className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 object-cover"
            onError={() =>
              setUserImageError((prev) => ({ ...prev, [user.uid]: true }))
            }
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light font-bold text-sm"
            aria-hidden="true"
          >
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span
          className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]"
          title={user.email ?? undefined}
        >
          {user.email ?? user.displayName ?? ''}
        </span>
        <button
          onClick={() => signOut()}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
          title="登出"
          aria-label="登出"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (!isFirebaseEnabled) {
          console.error('Firebase is not enabled. Check browser console for details.');
          alert(
            'Firebase 未啟用。請檢查瀏覽器控制台的錯誤訊息，或訪問：' +
              window.location.href +
              '?debug-firebase'
          );
          return;
        }
        signInWithGoogle();
      }}
      disabled={signInLoading || !isFirebaseEnabled}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200 text-sm font-medium disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
      title={!isFirebaseEnabled ? 'Firebase 未啟用' : '使用 Google 登入'}
      aria-label="使用 Google 登入"
    >
      <LogIn size={18} />
      {signInLoading ? '登入中…' : 'Google 登入'}
    </button>
  );
}
