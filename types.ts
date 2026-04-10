export interface ScheduleItem {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  title: string;
  type: 'manual' | 'auto'; // 'auto' for timer generated
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  schedule: ScheduleItem[];
  todos: TodoItem[];
  focusMinutes: number;
}