/**
 * Returns the current date formatted as YYYY-MM-DD
 * Uses local time to ensure the user sees the correct "today"
 */
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month =String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Generates an array of dates for the current calendar view (month)
 */
export const getCalendarDays = (year: number, month: number): (string | null)[] => {
  const days: (string | null)[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
  const totalDays = lastDay.getDate();

  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add actual days
  for (let i = 1; i <= totalDays; i++) {
    const dayStr = String(i).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    days.push(`${year}-${monthStr}-${dayStr}`);
  }

  return days;
};

/**
 * Basic formatting for display headers (e.g., "2023年 10月")
 */
export const formatMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('zh-TW', { month: 'long', year: 'numeric' });
};
