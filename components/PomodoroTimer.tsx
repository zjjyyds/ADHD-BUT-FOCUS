import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Brain } from 'lucide-react';

interface PomodoroTimerProps {
  onTimerComplete: (title: string, duration: number) => void;
}

const TimeWheelPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
  onClose: () => void;
}> = ({ value, onChange, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48;
  const minutes = Array.from({length: 120}, (_, i) => i + 1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (value - 1) * itemHeight;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const index = Math.round(top / itemHeight);
    const newVal = minutes[index];
    if (newVal && newVal !== value) {
      onChange(newVal);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div 
        className="relative z-20 h-[144px] w-32 overflow-hidden flex flex-col items-center justify-center"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)', 
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' 
        }}
      >
        <div className="absolute top-1/2 left-0 w-full h-[48px] -translate-y-1/2 border-y-2 border-indigo-500/20 bg-indigo-50/10 pointer-events-none rounded-xl"></div>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
          style={{ paddingTop: '48px', paddingBottom: '48px' }}
        >
          {minutes.map(m => (
            <div 
              key={m} 
              className={`h-[48px] flex items-center justify-center snap-center text-4xl xl:text-5xl font-mono tabular-nums tracking-tight transition-all cursor-pointer ${m === value ? 'text-indigo-600 font-bold' : 'text-slate-300 opacity-50 hover:opacity-100 scale-75'}`}
              onClick={() => {
                onChange(m);
                onClose();
              }}
            >
              {m.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onTimerComplete }) => {
  const [taskName, setTaskName] = useState('');
  const [inputMinutes, setInputMinutes] = useState<number | string>(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);

  useEffect(() => {
    if (!isActive && !isEditingTime) {
      const mins = Number(inputMinutes) || 0;
      setTimeLeft(mins * 60);
      setTotalTime(mins * 60);
    }
  }, [inputMinutes, isActive, isEditingTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      onTimerComplete(taskName || '专注时钟', Number(inputMinutes) || 25);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, taskName, inputMinutes, onTimerComplete]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      // Reset if trying to start when time is 0
      const mins = Number(inputMinutes) || 0;
      setTimeLeft(mins * 60);
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsEditingTime(false);
    const mins = Number(inputMinutes) || 0;
    setTimeLeft(mins * 60);
  };

  const handleTimeClick = () => {
    if (!isActive) {
      setIsEditingTime(true);
    }
  };

  const handleWheelChange = (mins: number) => {
    setInputMinutes(mins);
    setTimeLeft(mins * 60);
    setTotalTime(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0;

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 p-5 xl:p-6 flex flex-col items-center h-full overflow-y-auto no-scrollbar relative">
       <h3 className="font-bold text-slate-800 w-full text-left mb-4 flex items-center justify-between flex-shrink-0">
         <div className="flex items-center gap-2">
           <Brain className="text-indigo-500" size={20} /> <span className="text-sm">专注时钟</span>
         </div>
       </h3>

       {/* Inputs */}
       <div className="w-full flex mb-6 flex-shrink-0">
         <input 
           type="text" 
           placeholder="任务名称..." 
           value={taskName}
           onChange={(e) => setTaskName(e.target.value)}
           disabled={isActive}
           className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 disabled:opacity-50"
         />
       </div>

       {/* Timer Display */}
       <div className="relative w-40 h-40 xl:w-48 xl:h-48 flex items-center justify-center mb-6 flex-shrink-0">
         <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none drop-shadow-sm" viewBox="0 0 224 224">
           <defs>
             <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#818cf8" />
               <stop offset="100%" stopColor="#4f46e5" />
             </linearGradient>
           </defs>
           <circle cx="112" cy="112" r="102" fill="none" stroke="#f1f5f9" strokeWidth="6" />
           <circle 
             cx="112" cy="112" r="102" fill="none" 
             stroke="url(#timerGradient)" 
             strokeWidth="8" strokeLinecap="round" 
             strokeDasharray={2 * Math.PI * 102} 
             strokeDashoffset={2 * Math.PI * 102 * (1 - progress)} 
             className="transition-all duration-1000 linear drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" 
           />
         </svg>
         {isEditingTime ? (
           <TimeWheelPicker 
             value={Number(inputMinutes) || 25} 
             onChange={handleWheelChange} 
             onClose={() => setIsEditingTime(false)} 
           />
         ) : (
           <div 
             className={`relative z-10 text-5xl xl:text-6xl font-mono font-light tabular-nums tracking-tight ${!isActive ? 'cursor-pointer hover:scale-105 transition-transform' : ''} bg-clip-text text-transparent bg-gradient-to-b from-slate-800 to-slate-500`}
             onClick={handleTimeClick}
             title={!isActive ? "点击修改时间" : ""}
           >
             {formatTime(timeLeft)}
           </div>
         )}
       </div>

       {/* Controls */}
       <div className="flex items-center gap-4 flex-shrink-0">
         <button onClick={resetTimer} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors active:scale-95">
           <RotateCcw size={18} />
         </button>
         <button onClick={toggleTimer} className={`w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 hover:scale-105 bg-indigo-500 shadow-indigo-500/30`}>
           {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
         </button>
       </div>
    </div>
  );
}

export default PomodoroTimer;
