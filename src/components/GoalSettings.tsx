import React, { useState, useCallback, useMemo, memo } from 'react';
import { Goal, GoalPeriod, Habit, CompletedGoal } from '../types';
import { 
  Target, X, Plus, Trophy, Calendar, Coins, 
  CheckCircle2, Clock, ChevronRight, Trash2 
} from 'lucide-react';
import {
  calculateGoalReward,
  getGoalProgress,
  getDaysRemainingInPeriod,
  getPeriodLabel,
  isGoalCompleted,
  GOAL_PRESETS,
} from '../utils/goalLogic';

interface Props {
  habit: Habit;
  goals: Goal[];
  completedGoals: CompletedGoal[];
  onAddGoal: (habitId: string, period: GoalPeriod, targetDays: number) => void;
  onRemoveGoal: (goalId: string) => void;
  onClose: () => void;
}

const GoalSettings: React.FC<Props> = memo(function GoalSettings({
  habit,
  goals,
  completedGoals,
  onAddGoal,
  onRemoveGoal,
  onClose,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('weekly');
  const [customTarget, setCustomTarget] = useState(5);

  // Filter goals for this habit
  const habitGoals = useMemo(() => 
    goals.filter(g => g.habitId === habit.id),
    [goals, habit.id]
  );

  const handleAddPreset = useCallback((period: GoalPeriod, targetDays: number) => {
    onAddGoal(habit.id, period, targetDays);
    setShowAddModal(false);
  }, [habit.id, onAddGoal]);

  const handleAddCustom = useCallback(() => {
    onAddGoal(habit.id, selectedPeriod, customTarget);
    setShowAddModal(false);
  }, [habit.id, selectedPeriod, customTarget, onAddGoal]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">目標設定</h2>
                <p className="text-indigo-200 text-sm">{habit.name}</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Current Goals */}
          {habitGoals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">還沒有設定目標</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">設定目標來獲得金幣獎勵！</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                進行中的目標
              </h3>
              {habitGoals.map(goal => {
                const progress = getGoalProgress(goal, habit);
                const completed = isGoalCompleted(goal, habit, completedGoals);
                const daysRemaining = getDaysRemainingInPeriod(goal.period);
                
                return (
                  <div
                    key={goal.id}
                    className={`
                      p-4 rounded-2xl border-2 transition-all
                      ${completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle2 className="text-green-500" size={20} />
                        ) : (
                          <Calendar className="text-indigo-500 dark:text-indigo-400" size={20} />
                        )}
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">
                            {goal.period === 'weekly' ? '每週' : '每月'} {goal.targetDays} 天
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {getPeriodLabel(goal.period)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Coins size={16} />
                          <span className="font-bold text-sm">{goal.coinReward}</span>
                        </div>
                        <button
                          onClick={() => onRemoveGoal(goal.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {progress.current} / {progress.target} 天
                        </span>
                        {!completed && (
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            剩餘 {daysRemaining} 天
                          </span>
                        )}
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completed 
                              ? 'bg-green-500' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {completed && (
                      <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Trophy size={16} />
                        <span className="text-sm font-bold">目標達成！</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Goal Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 font-bold"
          >
            <Plus size={20} />
            新增目標
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            完成
          </button>
        </div>

        {/* Add Goal Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Target size={20} className="text-indigo-500" />
                選擇目標
              </h3>

              {/* Presets */}
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">快速設定</p>
                {GOAL_PRESETS.map((preset, i) => {
                  const reward = calculateGoalReward(preset.period, preset.targetDays);
                  return (
                    <button
                      key={i}
                      onClick={() => handleAddPreset(preset.period, preset.targetDays)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl flex items-center justify-between transition-colors group"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {preset.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold text-sm flex items-center gap-1">
                          <Coins size={14} /> {reward}
                        </span>
                        <ChevronRight size={16} className="text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">自訂目標</p>
                <div className="flex gap-2">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as GoalPeriod)}
                    className="flex-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <option value="weekly">每週</option>
                    <option value="monthly">每月</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={selectedPeriod === 'weekly' ? 7 : 31}
                    value={customTarget}
                    onChange={(e) => setCustomTarget(parseInt(e.target.value) || 1)}
                    className="w-20 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-center text-slate-700 dark:text-slate-200 font-medium"
                  />
                  <span className="flex items-center text-slate-500 dark:text-slate-400">天</span>
                </div>
                <button
                  onClick={handleAddCustom}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  新增
                  <span className="text-indigo-200 flex items-center gap-1">
                    (<Coins size={12} /> {calculateGoalReward(selectedPeriod, customTarget)})
                  </span>
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default GoalSettings;
