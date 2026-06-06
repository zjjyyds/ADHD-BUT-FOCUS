import React, { useState, useEffect } from 'react';
import TaskLibrary from '../components/scheduler/TaskLibrary';
import ActiveScheduler from '../components/scheduler/ActiveScheduler';
import { RandomTask, AppSettings } from '../types';

const STORAGE_KEY_TASKS = 'random_scheduler_tasks';
const STORAGE_KEY_SETTINGS = 'random_scheduler_settings';

const DEFAULT_SETTINGS: AppSettings = {
  pomodoroMinutes: 45,
  timeSliceMinutes: 5,
  breakMinutes: 5,
  isSoundEnabled: true,
};

export default function RandomSchedulerPage() {
  const [tasks, setTasks] = useState<RandomTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="flex flex-col h-full w-full p-6 lg:p-8 bg-[#fdfbf9] overflow-hidden gap-6">
      {/* Page Header */}
      <div className="shrink-0 pb-4 border-b border-slate-200">
         <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1 block">System Operation Mode</span>
         <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase">ADHD Scheduling</h1>
         <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest">No hyperfocus, just scheduling.</p>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-6">
        {/* Left Plate: Task Library */}
        <div className="w-full md:w-[350px] lg:w-[380px] h-full flex-shrink-0">
          <TaskLibrary tasks={tasks} setTasks={setTasks} />
        </div>

        {/* Right Plate: Scheduler Engine */}
        <div className="flex-1 h-full min-w-0">
          <ActiveScheduler tasks={tasks} settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </div>
  );
}

