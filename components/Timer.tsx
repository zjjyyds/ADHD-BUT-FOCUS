import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Sofa } from 'lucide-react';
import { TimerMode, TimerConfig } from '../types';

interface TimerProps {
  config: TimerConfig;
  onSessionComplete: (minutes: number, mode: TimerMode) => void;
}

const Timer: React.FC<TimerProps> = ({ config, onSessionComplete }) => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timeLeft, setTimeLeft] = useState(config.work * 60);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (mode === TimerMode.WORK) setTimeLeft(config.work * 60);
      if (mode === TimerMode.SHORT_BREAK) setTimeLeft(config.short * 60);
      if (mode === TimerMode.LONG_BREAK) setTimeLeft(config.long * 60);
    }
  }, [config, mode, isActive]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
  };

  const resetTimer = useCallback((newMode: TimerMode = mode) => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case TimerMode.WORK:
        setTimeLeft(config.work * 60);
        break;
      case TimerMode.SHORT_BREAK:
        setTimeLeft(config.short * 60);
        break;
      case TimerMode.LONG_BREAK:
        setTimeLeft(config.long * 60);
        break;
    }
  }, [mode, config]);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound();
      
      const duration = mode === TimerMode.WORK ? config.work : mode === TimerMode.SHORT_BREAK ? config.short : config.long;
      onSessionComplete(duration, mode);

      if (Notification.permission === 'granted') {
        new Notification("时间到", { body: mode === TimerMode.WORK ? "休息一下吧" : "该开始工作了" });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onSessionComplete, config]);

  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === TimerMode.WORK ? config.work : mode === TimerMode.SHORT_BREAK ? config.short : config.long;
  // Calculate stroke dashoffset for SVG circle
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (timeLeft / (totalTime * 60)) * circumference;

  const getModeColor = () => {
      switch(mode) {
          case TimerMode.WORK: return '#6366f1'; // Indigo-500
          case TimerMode.SHORT_BREAK: return '#10b981'; // Emerald-500
          case TimerMode.LONG_BREAK: return '#3b82f6'; // Blue-500
          default: return '#6366f1';
      }
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 p-8 flex flex-col items-center relative overflow-hidden">
      
      {/* Mode Switcher - Segmented Control Style */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10 w-full max-w-sm relative">
        <button
          onClick={() => resetTimer(TimerMode.WORK)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex justify-center items-center gap-2 ${
            mode === TimerMode.WORK 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Zap size={16} /> 专注
        </button>
        <button
          onClick={() => resetTimer(TimerMode.SHORT_BREAK)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex justify-center items-center gap-2 ${
            mode === TimerMode.SHORT_BREAK 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Coffee size={16} /> 小憩
        </button>
        <button
          onClick={() => resetTimer(TimerMode.LONG_BREAK)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex justify-center items-center gap-2 ${
            mode === TimerMode.LONG_BREAK 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sofa size={16} /> 长歇
        </button>
      </div>

      {/* Clock Face Container */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Track */}
        <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
           <circle
             cx="50%"
             cy="50%"
             r={radius}
             stroke="#f1f5f9"
             strokeWidth="12"
             fill="none"
           />
           {/* Progress */}
           <circle
             cx="50%"
             cy="50%"
             r={radius}
             stroke={getModeColor()}
             strokeWidth="12"
             fill="none"
             strokeDasharray={circumference}
             strokeDashoffset={offset}
             strokeLinecap="round"
             className="transition-all duration-1000 ease-linear"
           />
        </svg>

        {/* Time Display */}
        <div className="flex flex-col items-center z-10">
           <div className="text-7xl font-light text-slate-800 tracking-tighter tabular-nums">
             {formatTime(timeLeft)}
           </div>
           <div className={`text-sm font-medium mt-2 tracking-wide uppercase ${isActive ? 'text-slate-400' : 'text-slate-300'}`}>
             {isActive ? '正在计时' : '已暂停'}
           </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-10 flex items-center gap-8">
        <button
          onClick={() => resetTimer()}
          className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-95"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={() => setIsActive(!isActive)}
          className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200"
          style={{ backgroundColor: isActive ? '#f59e0b' : getModeColor() }} // Orange to pause, Theme color to start
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default Timer;