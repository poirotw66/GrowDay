import React, { useState, useEffect, useCallback, memo } from 'react';
import { Bell, BellOff, Clock, X, Check, AlertCircle } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getReminderSettings,
  saveReminderSettings,
  sendDailyReminder,
  ReminderSettings as ReminderSettingsType,
} from '../utils/notifications';

interface Props {
  habitName?: string;
  onClose: () => void;
}

const ReminderSettingsComponent: React.FC<Props> = memo(function ReminderSettingsComponent({ habitName, onClose }) {
  const [settings, setSettings] = useState<ReminderSettingsType>(() => getReminderSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setPermissionStatus(getNotificationPermission());
  }, []);

  const handleRequestPermission = useCallback(async () => {
    setIsRequesting(true);
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    setIsRequesting(false);
  }, []);

  const handleToggleEnabled = useCallback(async () => {
    if (!settings.enabled && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      if (!granted) return;
    }
    
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveReminderSettings(newSettings);
  }, [settings, permissionStatus]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...settings, time: e.target.value };
    setSettings(newSettings);
    saveReminderSettings(newSettings);
  }, [settings]);

  const handleTestNotification = useCallback(() => {
    sendDailyReminder(habitName);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  }, [habitName]);

  const notSupported = permissionStatus === 'unsupported';
  const permissionDenied = permissionStatus === 'denied';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Bell size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">每日提醒</h2>
                <p className="text-amber-100 text-sm">設定打卡提醒時間</p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Permission Status */}
          {notSupported && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-700 dark:text-red-400 font-medium">瀏覽器不支援</p>
                <p className="text-red-600 dark:text-red-500 text-sm">
                  您的瀏覽器不支援通知功能，請嘗試其他瀏覽器
                </p>
              </div>
            </div>
          )}

          {permissionDenied && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-700 dark:text-amber-400 font-medium">通知已被封鎖</p>
                <p className="text-amber-600 dark:text-amber-500 text-sm">
                  請在瀏覽器設定中允許 GrowDay 的通知權限
                </p>
              </div>
            </div>
          )}

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Bell className="text-amber-500" size={24} />
              ) : (
                <BellOff className="text-slate-400" size={24} />
              )}
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">啟用提醒</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {settings.enabled ? '每天會在指定時間提醒' : '目前已關閉提醒'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              disabled={notSupported || isRequesting}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${settings.enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}
                ${(notSupported || isRequesting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                  ${settings.enabled ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Time Picker */}
          <div className={`space-y-3 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
              <Clock size={16} />
              提醒時間
            </label>
            <input
              type="time"
              value={settings.time}
              onChange={handleTimeChange}
              className="w-full p-4 text-2xl font-bold text-center bg-slate-100 dark:bg-slate-700 rounded-2xl border-2 border-transparent focus:border-amber-400 focus:outline-none text-slate-700 dark:text-white"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              每天 {settings.time} 會收到打卡提醒
            </p>
          </div>

          {/* Test Button */}
          {settings.enabled && permissionStatus === 'granted' && (
            <button
              onClick={handleTestNotification}
              disabled={testSent}
              className={`
                w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${testSent 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              {testSent ? (
                <>
                  <Check size={16} />
                  已發送測試通知
                </>
              ) : (
                <>
                  <Bell size={16} />
                  發送測試通知
                </>
              )}
            </button>
          )}

          {/* Request Permission Button */}
          {permissionStatus === 'default' && (
            <button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {isRequesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  請求中...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  允許通知權限
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
});

export default ReminderSettingsComponent;
