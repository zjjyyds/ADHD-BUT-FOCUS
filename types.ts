export interface ScheduleItem {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  title: string;
  description?: string;
  status?: 'completed' | 'in-progress' | 'delayed' | 'upcoming';
  originalStartTime?: string;
  type: 'manual' | 'auto'; // 'auto' for timer generated
  category?: 'learn' | 'work' | 'other';
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface RandomTask {
  id: string;
  title: string;
}

export interface SchedulePreset {
  id: string;
  name: string;
  items: ScheduleItem[];
}

export interface GlobalSettings {
  learningGoal: string;
  presetTimes: number[];
  countdownEvent?: string;
  countdownDate?: string;
  dailyLearnGoalHours?: number;
  dailyWorkGoalHours?: number;
  schedulePresets?: SchedulePreset[];
}

export interface AppSettings {
  pomodoroMinutes: number;
  timeSliceMinutes: number;
  breakMinutes: number;
  isSoundEnabled: boolean;
}

export type AppState = 'idle' | 'running' | 'break';

export interface DailyData {
  date: string; // YYYY-MM-DD
  schedule: ScheduleItem[];
  todos: TodoItem[];
  focusMinutes: number;
}