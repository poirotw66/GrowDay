import React, { useState } from 'react';
import { Database, Download, Upload, Medal, AlertTriangle, Cloud, Eye, ChevronRight, Sparkles } from 'lucide-react';
import { getGameStateForUser, setGameStateForUser } from '../../firebase';
import { useSettings } from '../../contexts/SettingsContext';
import { SectionDivider } from './SettingsSection';

export default function DataManagement() {
  const {
    gameState,
    onExportData,
    onImportClick,
    onShowHallOfFame,
    onResetProgress,
    onCloseSettings,
    isFirebaseEnabled = false,
    userId = null,
  } = useSettings();

  const [firebaseData, setFirebaseData] = useState<unknown>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);
  const [showFirebaseDebug, setShowFirebaseDebug] = useState(false);

  return (
    <>
      <SectionDivider label="資料管理" icon={<Database size={12} />} />
      <div className="flex gap-2 px-2 mb-2">
        <button
          onClick={onExportData}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-3 rounded-xl transition-colors duration-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          aria-label="匯出備份"
        >
          <Download size={18} />
          匯出備份
        </button>
        <button
          onClick={onImportClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-3 rounded-xl transition-colors duration-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          aria-label="匯入備份"
        >
          <Upload size={18} />
          匯入備份
        </button>
      </div>

      {isFirebaseEnabled && (
        <div className="px-4 py-2 mb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            若您曾選擇「不登入，直接使用」，可隨時在頂部按「Google 登入」以將本機資料同步到 Google 帳號。
          </p>
        </div>
      )}

      <SectionDivider label="其他功能" icon={<Sparkles size={12} />} />
      <button
        onClick={onShowHallOfFame}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors duration-200 font-medium mb-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
        aria-label="榮譽殿堂"
      >
        <Medal size={16} />
        榮譽殿堂 (退休紀錄)
      </button>
      <button
        onClick={onResetProgress}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors duration-200 font-medium mb-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-inset"
        aria-label="重置所有資料"
      >
        <AlertTriangle size={16} />
        重置所有資料
      </button>

      {/* Firebase Debug Section - single instance (duplicate removed) */}
      {isFirebaseEnabled && userId && (
        <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
          <div className="px-4 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Database size={12} />
            Firebase 同步調試
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600">
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  setIsLoadingFirebase(true);
                  setFirebaseError(null);
                  try {
                    const data = await getGameStateForUser(userId);
                    setFirebaseData(data);
                    if (!data) setFirebaseError('Firestore 中沒有找到資料');
                  } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    setFirebaseError(errorMsg);
                    console.error('Firebase 查詢失敗:', e);
                  } finally {
                    setIsLoadingFirebase(false);
                  }
                }}
                disabled={isLoadingFirebase}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
                aria-label="查詢 Firestore 資料"
              >
                <Eye size={14} />
                {isLoadingFirebase ? '查詢中...' : '查詢 Firestore 資料'}
              </button>
              <button
                onClick={async () => {
                  setIsLoadingFirebase(true);
                  setFirebaseError(null);
                  try {
                    await setGameStateForUser(userId, gameState);
                    setFirebaseData(gameState);
                    alert('資料已成功上傳到 Firestore！');
                  } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    setFirebaseError(errorMsg);
                    console.error('Firebase 上傳失敗:', e);
                    alert(`上傳失敗: ${errorMsg}`);
                  } finally {
                    setIsLoadingFirebase(false);
                  }
                }}
                disabled={isLoadingFirebase}
                className="w-full flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/70 text-green-600 dark:text-green-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset"
                aria-label="手動上傳到 Firestore"
              >
                <Cloud size={14} />
                {isLoadingFirebase ? '上傳中...' : '手動上傳到 Firestore'}
              </button>
              {firebaseError && (
                <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">錯誤：</p>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">{firebaseError}</p>
                </div>
              )}
              {firebaseData && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowFirebaseDebug(!showFirebaseDebug)}
                    className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded transition-colors duration-200 cursor-pointer"
                  >
                    <span className="font-medium">查看 Firestore 資料</span>
                    <ChevronRight
                      size={12}
                      className={`transition-transform duration-200 ${showFirebaseDebug ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {showFirebaseDebug && (
                    <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <pre className="text-[10px] text-slate-600 dark:text-slate-400 overflow-auto max-h-48 font-mono">
                        {JSON.stringify(firebaseData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">本地資料摘要：</p>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>習慣數量: {Object.keys(gameState.habits).length}</p>
                  <p>活躍習慣: {gameState.activeHabitId || '無'}</p>
                  <p>金幣: {gameState.coins}</p>
                  <p>自訂印章: {gameState.customStamps ? Object.keys(gameState.customStamps).length : 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
