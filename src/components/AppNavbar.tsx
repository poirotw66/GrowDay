import React from 'react';
import { Sprout, Map as MapIcon, Trophy, Settings, BarChart3, Bell, Target, Share2, MoreHorizontal, LogIn, LogOut, Cloud, CloudOff } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import HabitSwitcher from './HabitSwitcher';
import SettingsDropdown from './SettingsDropdown';
import { GameState } from '../types';

export interface AppNavbarProps {
  showSettings: boolean;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  user: { uid: string; photoURL?: string | null; displayName?: string | null; email?: string | null } | null;
  isFirebaseEnabled: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
  signInLoading: boolean;
  userImageError: Record<string, boolean>;
  setUserImageError: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onOpenReminder: () => void;
  onOpenGoals: () => void;
  onOpenStatsChart: () => void;
  onOpenShareCard: () => void;
  onShowAchievements: () => void;
  showMoreMenu: boolean;
  onCloseMoreMenu: () => void;
  setShowMoreMenu: React.Dispatch<React.SetStateAction<boolean>>;
  onGoToWorld: () => void;
  gameState: GameState;
  onSwitchHabit: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenCompendium: () => void;
}

/**
 * Top navigation: logo, auth, theme, action buttons, more menu (mobile), world button, settings, dropdown, habit switcher.
 */
export default function AppNavbar({
  showSettings,
  onToggleSettings,
  onCloseSettings,
  syncStatus,
  user,
  isFirebaseEnabled,
  signInWithGoogle,
  signOut,
  signInLoading,
  userImageError,
  setUserImageError,
  onOpenReminder,
  onOpenGoals,
  onOpenStatsChart,
  onOpenShareCard,
  onShowAchievements,
  showMoreMenu,
  onCloseMoreMenu,
  setShowMoreMenu,
  onGoToWorld,
  gameState,
  onSwitchHabit,
  onOpenAddModal,
  onOpenCompendium,
}: AppNavbarProps) {
  return (
    <header className="max-w-7xl mx-auto mb-6">
      <div className="flex justify-between items-center px-2 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md transition-shadow duration-200 hover:shadow-lg"
            aria-hidden="true"
          >
            <Sprout size={24} fill="currentColor" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink dark:text-white tracking-tight">
            GrowDay
          </h1>
        </div>

        <div className="flex items-center gap-2 relative z-40 flex-wrap justify-end">
          {isFirebaseEnabled &&
            (user ? (
              <div className="flex items-center gap-2">
                {syncStatus !== 'idle' && (
                  <span
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
                    title={
                      syncStatus === 'syncing'
                        ? '同步中'
                        : syncStatus === 'synced'
                          ? '已同步'
                          : '同步失敗'
                    }
                  >
                    {syncStatus === 'error' ? (
                      <CloudOff size={14} />
                    ) : (
                      <Cloud
                        size={14}
                        className={syncStatus === 'syncing' ? 'animate-pulse' : ''}
                      />
                    )}
                    <span className="hidden sm:inline">
                      {syncStatus === 'syncing'
                        ? '同步中'
                        : syncStatus === 'synced'
                          ? '已同步'
                          : syncStatus === 'error'
                            ? '同步失敗'
                            : ''}
                    </span>
                  </span>
                )}
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
            ) : (
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
            ))}

          <ThemeToggle />

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenReminder}
              className="p-3 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full text-primary dark:text-primary-light transition-all duration-200 shadow-sm border border-primary/20 dark:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
              title="提醒設定"
              aria-label="提醒設定"
            >
              <Bell size={20} />
            </button>
            <button
              onClick={onOpenGoals}
              className="p-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400 transition-all duration-200 shadow-sm border border-indigo-200 dark:border-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
              title="目標設定"
              aria-label="目標設定"
            >
              <Target size={20} />
            </button>
            <button
              onClick={onOpenStatsChart}
              className="p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-400 transition-all duration-200 shadow-sm border border-purple-200 dark:border-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
              title="統計圖表"
              aria-label="統計圖表"
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={onOpenShareCard}
              className="p-3 bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 rounded-full text-pink-600 dark:text-pink-400 transition-all duration-200 shadow-sm border border-pink-200 dark:border-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
              title="分享卡片"
              aria-label="分享卡片"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onShowAchievements}
              className="p-3 bg-cta/10 dark:bg-cta/20 hover:bg-cta/20 dark:hover:bg-cta/30 rounded-full text-cta dark:text-amber-400 transition-all duration-200 shadow-sm border border-cta/20 dark:border-cta/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
              title="成就"
              aria-label="成就"
            >
              <Trophy size={20} />
            </button>
          </div>

          <div className="relative lg:hidden">
            <button
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-600 dark:text-slate-300 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
              title="更多功能"
              aria-label="更多功能"
              aria-expanded={showMoreMenu}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  aria-hidden
                  onClick={onCloseMoreMenu}
                />
                <div className="absolute right-0 top-full mt-2 py-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => {
                      onOpenReminder();
                      onCloseMoreMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    aria-label="提醒設定"
                  >
                    <Bell size={20} className="text-cyan-500 shrink-0" /> 提醒設定
                  </button>
                  <button
                    onClick={() => {
                      onOpenGoals();
                      onCloseMoreMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    aria-label="目標設定"
                  >
                    <Target size={20} className="text-indigo-500 shrink-0" /> 目標設定
                  </button>
                  <button
                    onClick={() => {
                      onOpenStatsChart();
                      onCloseMoreMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    aria-label="統計圖表"
                  >
                    <BarChart3 size={20} className="text-purple-500 shrink-0" /> 統計圖表
                  </button>
                  <button
                    onClick={() => {
                      onOpenShareCard();
                      onCloseMoreMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    aria-label="分享卡片"
                  >
                    <Share2 size={20} className="text-pink-500 shrink-0" /> 分享卡片
                  </button>
                  <button
                    onClick={() => {
                      onShowAchievements();
                      onCloseMoreMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    aria-label="成就"
                  >
                    <Trophy size={20} className="text-amber-500 shrink-0" /> 成就
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onGoToWorld}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full font-bold transition-all duration-200 shadow-sm border border-indigo-100 dark:border-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
            aria-label="前往世界"
          >
            <MapIcon size={20} />
            <span className="hidden md:inline">前往世界</span>
          </button>

          <button
            onClick={onToggleSettings}
            className="p-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors duration-200 shadow-sm border border-slate-200 dark:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
            title="設定"
            aria-label="設定"
          >
            <Settings size={22} />
          </button>

          <SettingsDropdown isOpen={showSettings} onClose={onCloseSettings} />
        </div>
      </div>

      <HabitSwitcher
        gameState={gameState}
        onSwitch={onSwitchHabit}
        onAdd={onOpenAddModal}
        onOpenCompendium={onOpenCompendium}
      />
    </header>
  );
}
