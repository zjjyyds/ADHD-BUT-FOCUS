import { DailyData, TimerConfig } from '../types';

const STORAGE_PREFIX = 'plan_focus_data_';
const SETTINGS_KEY = 'plan_focus_settings';

// Default Settings
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  work: 25,
  short: 5,
  long: 15,
};

export const createEmptyDailyData = (date: string): DailyData => ({
  date,
  schedule: [],
  todos: [],
  focusMinutes: 0,
});

export const saveDailyData = (data: DailyData): void => {
  try {
    const key = `${STORAGE_PREFIX}${data.date}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data", error);
  }
};

export const loadDailyData = (date: string): DailyData => {
  const key = `${STORAGE_PREFIX}${date}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Migration: Ensure all fields exist
      if (!parsed.schedule) parsed.schedule = [];
      if (!parsed.todos) parsed.todos = [];
      return parsed;
    } catch (e) {
      console.error("Data corruption", e);
    }
  }
  return createEmptyDailyData(date);
};

export const getStoredDates = (): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
             const data = JSON.parse(item);
             // Check if date has meaningful content
             if (data.focusMinutes > 0 || (data.schedule && data.schedule.length > 0) || (data.todos && data.todos.length > 0)) {
                 if (data.date) dates.push(data.date);
             }
        }
      } catch (e) {}
    }
  }
  return dates;
};

// Settings Management
export const saveSettings = (config: TimerConfig) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
};

export const loadSettings = (): TimerConfig => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return DEFAULT_TIMER_CONFIG;
};

// Export/Import
export const exportAllData = (): void => {
  const allData: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(STORAGE_PREFIX) || key === SETTINGS_KEY)) {
      try {
        allData[key] = JSON.parse(localStorage.getItem(key) || '{}');
      } catch (e) {}
    }
  }
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `plan_focus_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importData = (file: File, onSuccess: () => void): void => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target?.result as string);
      Object.keys(json).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX) || key === SETTINGS_KEY) {
          localStorage.setItem(key, JSON.stringify(json[key]));
        }
      });
      alert(`数据恢复成功`);
      onSuccess();
    } catch (e) {
      alert("文件格式错误");
    }
  };
  reader.readAsText(file);
};