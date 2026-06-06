import React, { useState, useEffect } from 'react';
import { AppState, RandomTask, AppSettings } from '../../types';
import { AlertCircle } from 'lucide-react';
import { playNotificationSound } from '../../utils/audio';
import SettingsPanel from './SettingsPanel';
import { loadDailyData, saveDailyData } from '../../services/storageService';

interface ActiveSchedulerProps {
  tasks: RandomTask[];
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export default function ActiveScheduler({ tasks, settings, setSettings }: ActiveSchedulerProps) {
  const [appState, setAppState] = useState<AppState>('idle');
  const [pomodoroLeft, setPomodoroLeft] = useState<number>(settings.pomodoroMinutes * 60);
  const [sliceLeft, setSliceLeft] = useState<number>(settings.timeSliceMinutes * 60);
  const [currentTask, setCurrentTask] = useState<RandomTask | null>(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync settings when idle
  useEffect(() => {
    if (appState === 'idle') {
      setPomodoroLeft(settings.pomodoroMinutes * 60);
      setSliceLeft(settings.timeSliceMinutes * 60);
    }
  }, [settings, appState]);

  const addFocusMinutes = async (minutes: number) => {
    // Generate YYYY-MM-DD from local date
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);
    const today = localISOTime.split('T')[0];

    try {
      const data = await loadDailyData(today);
      data.focusMinutes += minutes;

      const now = new Date();
      const start = new Date(now.getTime() - minutes * 60000);
      const formatTimeStr = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      
      data.schedule.push({
          id: crypto.randomUUID(),
          startTime: formatTimeStr(start),
          endTime: formatTimeStr(now),
          title: `ADHD Core Cycle (${minutes}m)`,
          type: 'auto'
      });

      await saveDailyData(data);
    } catch (e) {
      console.error("Failed to save focus data", e);
    }
  };

  // Core Execution Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (appState === 'running' && !isPaused) {
      interval = setInterval(() => {
        setPomodoroLeft(prevPomo => {
          const nextPomo = prevPomo - 1;
          
          if (nextPomo <= 0) {
            // Trigger Break
            addFocusMinutes(settings.pomodoroMinutes);
            if (settings.isSoundEnabled) playNotificationSound('break');
            setAppState('break');
            setPomodoroLeft(settings.breakMinutes * 60);
            setCurrentTask(null);
            return 0;
          }

          // Not breaking yet, let's check slice
          setSliceLeft(prevSlice => {
            const nextSlice = prevSlice - 1;
            if (nextSlice <= 0) {
              // Trigger Task Switch
              if (settings.isSoundEnabled) playNotificationSound('slice');
              drawRandomTask();
              return settings.timeSliceMinutes * 60;
            }
            return nextSlice;
          });

          return nextPomo;
        });
      }, 1000);
    } else if (appState === 'break' && !isPaused) {
      interval = setInterval(() => {
        setPomodoroLeft(prevBreak => {
          const nextBreak = prevBreak - 1;
          if (nextBreak <= 0) {
            // Break is over
            if (settings.isSoundEnabled) playNotificationSound('work');
            resetToIdle();
            return 0;
          }
          return nextBreak;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [appState, isPaused, settings, currentTask, tasks]);

  const drawRandomTask = () => {
    if (tasks.length === 0) {
      setCurrentTask(null);
      return;
    }
    if (tasks.length === 1) {
      setCurrentTask(tasks[0]);
      return;
    }
    
    // Pick randomly, but avoid the immediately previous task if possible
    const availableTasks = tasks.filter(t => t.id !== currentTask?.id);
    const chosen = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    setCurrentTask({ ...chosen });
  };

  const handleStart = () => {
    if (tasks.length === 0) {
      setErrorMsg("Task Library is empty. Please add tasks first.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setPomodoroLeft(settings.pomodoroMinutes * 60);
    setSliceLeft(settings.timeSliceMinutes * 60);
    setIsPaused(false);
    setAppState('running');
    drawRandomTask();
  };

  const resetToIdle = () => {
    if (appState === 'running') {
      const minutesSpent = Math.floor((settings.pomodoroMinutes * 60 - pomodoroLeft) / 60);
      if (minutesSpent > 0) {
        addFocusMinutes(minutesSpent);
      }
    }
    setAppState('idle');
    setIsPaused(false);
    setCurrentTask(null);
    setPomodoroLeft(settings.pomodoroMinutes * 60);
    setSliceLeft(settings.timeSliceMinutes * 60);
  };

  const skipSlice = () => {
    if (appState !== 'running') return;
    if (settings.isSoundEnabled) playNotificationSound('slice');
    drawRandomTask();
    setSliceLeft(settings.timeSliceMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Central Screen Area */}
      <div className="flex-1 flex flex-col m-6 bg-slate-50 border border-slate-200 border-dashed rounded-2xl relative items-center justify-center">
         
         <div className="absolute top-6 left-0 right-0 flex justify-center">
            <span className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors ${appState === 'idle' ? 'text-slate-400 bg-slate-200/50' : 'text-white bg-[#c24127] shadow-md shadow-[#c24127]/20 drop-shadow-sm'}`}>
              {appState === 'idle' ? 'CPU IDLE' : appState === 'running' ? 'ACTIVE DISPATCH' : 'RECOVERY PHASE'}
            </span>
         </div>

         <div className="flex flex-col items-center justify-center p-8 mt-4 text-center z-10 w-full max-w-2xl gap-2">
            {errorMsg && (
              <div className="absolute top-16 flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-2 border border-rose-100">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 drop-shadow-sm line-clamp-2 w-full h-[6rem] flex items-center justify-center leading-tight">
                {appState === 'idle' ? 'Awaiting dispatch...' : appState === 'break' ? 'Break Time. Step away.' : currentTask?.title || 'Loading...'}
            </h2>

            <div className="font-mono text-[7rem] md:text-[9rem] font-medium leading-[0.9] tracking-tighter text-slate-800 tabular-nums">
                {appState === 'idle' ? formatTime(settings.pomodoroMinutes * 60) : appState === 'break' ? formatTime(pomodoroLeft) : formatTime(sliceLeft)}
            </div>
         </div>
      </div>

      {/* Control Buttons row */}
      <div className="px-6 pb-6 flex gap-4 h-16">
        <button 
           onClick={appState === 'idle' ? undefined : (appState === 'running' ? skipSlice : undefined)}
           disabled={appState === 'idle' || appState === 'break'}
           className="flex-1 h-full bg-slate-100 text-slate-500 font-bold tracking-widest text-sm uppercase rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 shadow-sm">
          Skip Slice
        </button>

        {appState === 'idle' ? (
            <button 
              onClick={handleStart}
              className="flex-[2] h-full bg-[#c24127] text-white font-bold tracking-widest text-sm uppercase rounded-2xl shadow-lg shadow-[#c24127]/30 hover:bg-[#a0301a] hover:scale-[1.01] transition-all">
              Start Core
            </button>
        ) : (
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`flex-[2] h-full text-white font-bold tracking-widest text-sm uppercase rounded-2xl shadow-lg transition-all hover:scale-[1.01] ${isPaused ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}>
              {isPaused ? 'Resume Core' : 'Pause Core'}
            </button>
        )}

        <button 
           onClick={resetToIdle}
           disabled={appState === 'idle'}
           className="flex-1 h-full bg-slate-100 text-slate-500 font-bold tracking-widest text-sm uppercase rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 shadow-sm">
          Abort Cycle
        </button>
      </div>

      {/* Footer Info Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50 text-xs font-mono text-slate-500 tracking-wider">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shadow-sm ${appState === 'idle' ? 'bg-slate-300' : appState === 'running' ? 'bg-[#c24127] animate-pulse drop-shadow-[0_0_4px_rgba(194,65,39,0.5)]' : 'bg-blue-400 animate-pulse'}`} />
                <span>CONNECTION: {appState.toUpperCase()}</span>
            </div>
            {appState === 'running' && (
                <span>GLOBAL CYCLE LEFT: {formatTime(pomodoroLeft)}</span>
            )}
         </div>
         <button onClick={() => setShowSettings(true)} className="mt-2 sm:mt-0 hover:text-slate-800 hover:font-bold transition-all">
            [ Configure System ]
         </button>
      </div>

      {showSettings && (
        <SettingsPanel settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
