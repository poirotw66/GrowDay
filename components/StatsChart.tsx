import React, { memo, useMemo } from 'react';
import { Habit } from '../types';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

interface Props {
  habit: Habit;
  onClose: () => void;
}

const StatsChart: React.FC<Props> = memo(function StatsChart({ habit, onClose }) {
  // Calculate statistics
  const stats = useMemo(() => {
    const logs = habit.logs;
    const logEntries = Object.values(logs); // Convert Record to array
    const now = new Date();
    
    // Get last 7 days data
    const last7Days: { date: string; stamped: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = logs[dateStr];
      last7Days.push({
        date: dateStr,
        stamped: log?.stamped ?? false,
      });
    }

    // Get last 4 weeks data
    const last4Weeks: { week: string; count: number; total: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      let count = 0;
      let total = 0;
      for (let d = 0; d < 7; d++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(checkDate.getDate() + d);
        if (checkDate <= now) {
          total++;
          const dateStr = checkDate.toISOString().split('T')[0];
          const log = logs[dateStr];
          if (log?.stamped) {
            count++;
          }
        }
      }
      
      const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      last4Weeks.push({ week: weekLabel, count, total });
    }

    // Get monthly data for current year
    const monthlyData: { month: string; count: number }[] = [];
    for (let m = 0; m <= now.getMonth(); m++) {
      const monthStart = new Date(now.getFullYear(), m, 1);
      const monthEnd = new Date(now.getFullYear(), m + 1, 0);
      let count = 0;
      
      for (const log of logEntries) {
        const logDate = new Date(log.date);
        if (logDate >= monthStart && logDate <= monthEnd && log.stamped) {
          count++;
        }
      }
      
      monthlyData.push({
        month: `${m + 1}月`,
        count,
      });
    }

    // Calculate completion rate
    const totalDays = Math.ceil((now.getTime() - new Date(habit.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const completedDays = logEntries.filter(l => l.stamped).length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    // Find best day of week
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayOfWeekTotals = [0, 0, 0, 0, 0, 0, 0];
    
    for (const log of logEntries) {
      const dayOfWeek = new Date(log.date).getDay();
      dayOfWeekTotals[dayOfWeek]++;
      if (log.stamped) {
        dayOfWeekCounts[dayOfWeek]++;
      }
    }
    
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    let bestDayIndex = 0;
    let bestRate = 0;
    dayOfWeekCounts.forEach((count, i) => {
      const rate = dayOfWeekTotals[i] > 0 ? count / dayOfWeekTotals[i] : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestDayIndex = i;
      }
    });

    return {
      last7Days,
      last4Weeks,
      monthlyData,
      completionRate,
      totalDays,
      completedDays,
      bestDay: dayNames[bestDayIndex],
      bestDayRate: Math.round(bestRate * 100),
      dayOfWeekRates: dayOfWeekCounts.map((count, i) => ({
        day: dayNames[i],
        rate: dayOfWeekTotals[i] > 0 ? Math.round((count / dayOfWeekTotals[i]) * 100) : 0,
      })),
    };
  }, [habit]);

  const maxWeekCount = Math.max(...stats.last4Weeks.map(w => w.count), 1);
  const maxMonthCount = Math.max(...stats.monthlyData.map(m => m.count), 1);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📊 習慣統計</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{habit.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 p-4 rounded-2xl text-center">
              <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completionRate}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">完成率</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-2xl text-center">
              <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completedDays}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">總打卡天數</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-2xl text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{habit.longestStreak}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">最長連續</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-2xl text-center">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">週{stats.bestDay}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">最佳日 ({stats.bestDayRate}%)</div>
            </div>
          </div>

          {/* Last 7 Days */}
          <div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span>📅</span> 最近 7 天
            </h3>
            <div className="flex justify-between gap-2">
              {stats.last7Days.map((day, i) => {
                const date = new Date(day.date);
                const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
                const isToday = i === 6;
                return (
                  <div key={day.date} className="flex-1 text-center">
                    <div className={`
                      w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-lg transition-all
                      ${day.stamped 
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500'
                      }
                      ${isToday ? 'ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-slate-800' : ''}
                    `}>
                      {day.stamped ? '✓' : '·'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{dayName}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Trend */}
          <div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span>📈</span> 週趨勢
            </h3>
            <div className="flex items-end gap-3 h-32">
              {stats.last4Weeks.map((week, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-orange-400 to-amber-300 dark:from-orange-600 dark:to-amber-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(week.count / maxWeekCount) * 100}%`, minHeight: week.count > 0 ? '8px' : '0' }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">{week.count}/{week.total}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{week.week}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Day of Week Distribution */}
          <div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span>🗓️</span> 星期分佈
            </h3>
            <div className="flex gap-2">
              {stats.dayOfWeekRates.map(({ day, rate }) => (
                <div key={day} className="flex-1 text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                  <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex flex-col-reverse">
                    <div
                      className="bg-gradient-to-t from-blue-400 to-cyan-300 dark:from-blue-600 dark:to-cyan-500 transition-all duration-500"
                      style={{ height: `${rate}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{rate}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Overview */}
          {stats.monthlyData.length > 1 && (
            <div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span>📆</span> 月度總覽
              </h3>
              <div className="flex items-end gap-2 h-24">
                {stats.monthlyData.map((month, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-purple-400 to-pink-300 dark:from-purple-600 dark:to-pink-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(month.count / maxMonthCount) * 100}%`, minHeight: month.count > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 mt-1">{month.count}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{month.month}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default StatsChart;
