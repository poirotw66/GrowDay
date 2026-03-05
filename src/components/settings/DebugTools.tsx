import React from 'react';
import { FlaskConical, Check, CalendarRange } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export default function DebugTools() {
  const {
    debugDate,
    setDebugDate,
    debugStartDate,
    setDebugStartDate,
    debugEndDate,
    setDebugEndDate,
    onDebugStamp,
    onDebugRangeStamp,
  } = useSettings();

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
      <div className="px-4 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <FlaskConical size={12} />
        開發者測試 (當前習慣)
      </div>
      <form
        onSubmit={onDebugStamp}
        className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">單日補簽：</p>
        <div className="flex gap-2">
          <input
            type="date"
            required
            value={debugDate}
            onChange={(e) => setDebugDate(e.target.value)}
            className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-600 dark:text-amber-400 p-2 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
            aria-label="單日補簽"
          >
            <Check size={14} />
          </button>
        </div>
      </form>
      <form
        onSubmit={onDebugRangeStamp}
        className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl m-2 border border-slate-100 dark:border-slate-600"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1">
          <CalendarRange size={12} />
          區間補簽：
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 w-8">開始</span>
            <input
              type="date"
              required
              value={debugStartDate}
              onChange={(e) => setDebugStartDate(e.target.value)}
              className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 w-8">結束</span>
            <input
              type="date"
              required
              value={debugEndDate}
              onChange={(e) => setDebugEndDate(e.target.value)}
              className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-1 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-600 dark:text-amber-400 p-2 rounded-lg transition-colors duration-200 text-xs font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
            aria-label="執行區間打卡"
          >
            執行區間打卡
          </button>
        </div>
      </form>
    </div>
  );
}
