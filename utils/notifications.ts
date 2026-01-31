// Notification Utilities for Daily Reminders

export interface ReminderSettings {
  enabled: boolean;
  time: string; // Format: "HH:mm" (24-hour)
  habitId?: string; // Optional: specific habit to remind, null = all
}

const STORAGE_KEY = 'growday_reminder_settings';

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

// Check current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Get saved reminder settings
export function getReminderSettings(): ReminderSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load reminder settings:', e);
  }
  return { enabled: false, time: '20:00' };
}

// Save reminder settings
export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save reminder settings:', e);
  }
}

// Show a notification
export function showNotification(
  title: string, 
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }
  
  return new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'growday-reminder',
    ...options,
  });
}

// Schedule daily reminder check
let reminderInterval: number | null = null;

export function startReminderChecker(onReminder: () => void): void {
  // Clear existing interval
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  
  // Check every minute
  reminderInterval = window.setInterval(() => {
    const settings = getReminderSettings();
    if (!settings.enabled) return;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime === settings.time) {
      onReminder();
    }
  }, 60000); // Check every minute
  
  // Also check immediately on start
  const settings = getReminderSettings();
  if (settings.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (currentTime === settings.time) {
      onReminder();
    }
  }
}

export function stopReminderChecker(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

// Send the actual reminder notification
export function sendDailyReminder(habitName?: string): void {
  const title = '🌱 GrowDay 提醒';
  const body = habitName 
    ? `別忘了今天的「${habitName}」打卡！你的小寵物在等你 🐾`
    : '別忘了今天的打卡！你的小寵物在等你 🐾';
  
  showNotification(title, {
    body,
    requireInteraction: true,
  });
}
