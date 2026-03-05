import { useEffect } from 'react';
import { getReminderSettings, sendDailyReminder, startReminderChecker, stopReminderChecker } from '../utils/notifications';
import type { Habit } from '../types/habit';

export function useDailyReminder(activeHabit: Habit | null) {
  useEffect(() => {
    startReminderChecker(() => {
      const settings = getReminderSettings();
      if (settings.enabled && activeHabit) {
        sendDailyReminder(activeHabit.name);
      }
    });

    return () => stopReminderChecker();
  }, [activeHabit]);
}

