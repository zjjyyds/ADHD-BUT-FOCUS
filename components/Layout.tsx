import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Clock, CheckSquare, BarChart2, Settings, LogIn, LogOut, FileText } from 'lucide-react';
import { DailyData, ScheduleItem, TodoItem } from '../types';
import { loadDailyData, saveDailyData, createEmptyDailyData } from '../services/storageService';
import { useAuth } from './AuthProvider';
import { playChime } from '../utils/audio';

export type AppContextType = {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  dailyData: DailyData;
  setDailyData: React.Dispatch<React.SetStateAction<DailyData>>;
  handleTimerComplete: (title: string, durationMinutes: number) => void;
  
  // Timer State
  taskName: string;
  setTaskName: React.Dispatch<React.SetStateAction<string>>;
  inputMinutes: number;
  setInputMinutes: React.Dispatch<React.SetStateAction<number>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  totalTime: number;
  setTotalTime: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'focus' | 'break';
  setMode: React.Dispatch<React.SetStateAction<'focus' | 'break'>>;
  completedSessions: number;
  setCompletedSessions: React.Dispatch<React.SetStateAction<number>>;
  lastFocusMinutes: number;
  setLastFocusMinutes: React.Dispatch<React.SetStateAction<number>>;
};

export default function Layout() {
  const getTodayString = () => new Date().toLocaleDateString('en-CA');
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [dailyData, setDailyData] = useState<DailyData>(createEmptyDailyData(currentDate));
  const { user, signIn, logOut, loading } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);

  // Timer State
  const [taskName, setTaskName] = useState('Writing Project Proposal');
  const [inputMinutes, setInputMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [lastFocusMinutes, setLastFocusMinutes] = useState(25);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setDataLoaded(false);
      const data = await loadDailyData(currentDate);
      if (isMounted) {
        setDailyData(data);
        setDataLoaded(true);
      }
    };
    if (!loading) {
      loadData();
    }
    return () => { isMounted = false; };
  }, [currentDate, user, loading]);

  useEffect(() => {
    if (dataLoaded) {
      saveDailyData(dailyData);
    }
  }, [dailyData, dataLoaded]);

  const handleTimerComplete = (title: string, durationMinutes: number) => {
    const now = new Date();
    const endStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = new Date(now.getTime() - durationMinutes * 60000);
    const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;

    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      title: title || '专注时钟',
      startTime: startStr,
      endTime: endStr,
      type: 'auto'
    };
    
    setDailyData(prev => {
      const newSchedule = [...(prev.schedule || []), newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { 
        ...prev, 
        schedule: newSchedule,
        focusMinutes: (prev.focusMinutes || 0) + durationMinutes
      };
    });
  };

  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      
      interval = setInterval(() => {
        if (endTimeRef.current) {
          const newTimeLeft = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
          setTimeLeft(newTimeLeft);
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      endTimeRef.current = null;
      playChime();
      
      if (mode === 'focus') {
        handleTimerComplete(taskName, inputMinutes);
        setCompletedSessions(s => s + 1);
        setMode('break');
        setInputMinutes(5);
        setTimeLeft(5 * 60);
        setTotalTime(5 * 60);
        endTimeRef.current = Date.now() + 5 * 60 * 1000;
        // Keep isActive true to auto-start the break
      } else {
        setIsActive(false); // Pause when break ends, waiting for user to start next focus
        setMode('focus');
        setInputMinutes(lastFocusMinutes);
        setTimeLeft(lastFocusMinutes * 60);
        setTotalTime(lastFocusMinutes * 60);
      }
    } else {
      endTimeRef.current = null;
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, taskName, inputMinutes, mode, lastFocusMinutes]);

  const contextValue: AppContextType = {
    currentDate, setCurrentDate,
    dailyData, setDailyData,
    handleTimerComplete,
    taskName, setTaskName,
    inputMinutes, setInputMinutes,
    timeLeft, setTimeLeft,
    totalTime, setTotalTime,
    isActive, setIsActive,
    mode, setMode,
    completedSessions, setCompletedSessions,
    lastFocusMinutes, setLastFocusMinutes
  };

  return (
    <div className="flex h-screen w-full bg-[#fdfbf9] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 flex flex-col items-center py-8 border-r border-slate-100 bg-white/50 backdrop-blur-xl z-20">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-12 overflow-hidden bg-white shadow-sm border border-slate-100 p-1">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <defs>
              <linearGradient id="owlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b4a" />
                <stop offset="100%" stopColor="#c24127" />
              </linearGradient>
              <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
                <stop offset="100%" stopColor="#ffe8e3" stopOpacity="0.95"/>
              </linearGradient>
            </defs>

            {/* Tomato Owl Body */}
            <path d="M 20 45 C 20 15, 80 15, 80 45 C 80 85, 65 92, 50 92 C 35 92, 20 85, 20 45 Z" fill="url(#owlGrad)" />

            {/* Tomato Leaves / Owl Ear Tufts */}
            <path d="M 50 20 C 40 20, 32 12, 28 5 C 38 10, 45 15, 50 18 C 55 15, 62 10, 72 5 C 68 12, 60 20, 50 20 Z" fill="#2e7d32" />
            <path d="M 50 18 Q 52 8, 56 2" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />

            {/* Belly */}
            <path d="M 30 55 C 30 40, 70 40, 70 55 C 70 80, 60 88, 50 88 C 40 88, 30 80, 30 55 Z" fill="url(#bellyGrad)" />

            {/* Task Checkmark on Belly */}
            <path d="M 43 72 L 48 77 L 58 65" fill="none" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />

            {/* Timer Eyes */}
            {/* Left Eye */}
            <circle cx="36" cy="42" r="14" fill="#ffffff" />
            <circle cx="36" cy="42" r="11" fill="none" stroke="#ff6b4a" strokeWidth="2" strokeDasharray="2 4" opacity="0.8" />
            <circle cx="36" cy="42" r="6" fill="#333333" />
            <circle cx="34" cy="40" r="2" fill="#ffffff" />
            
            {/* Right Eye */}
            <circle cx="64" cy="42" r="14" fill="#ffffff" />
            <circle cx="64" cy="42" r="11" fill="none" stroke="#ff6b4a" strokeWidth="2" strokeDasharray="2 4" opacity="0.8" />
            <circle cx="64" cy="42" r="6" fill="#333333" />
            <circle cx="62" cy="40" r="2" fill="#ffffff" />

            {/* Beak */}
            <path d="M 46 48 L 54 48 L 50 56 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" strokeLinejoin="round" />

            {/* Folded Wings */}
            <path d="M 20 45 C 12 55, 15 75, 26 82 C 23 68, 25 55, 30 50 Z" fill="#a9351f" />
            <path d="M 80 45 C 88 55, 85 75, 74 82 C 77 68, 75 55, 70 50 Z" fill="#a9351f" />

            {/* Feet */}
            <line x1="40" y1="90" x2="37" y2="96" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="90" x2="43" y2="96" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="90" x2="57" y2="96" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="90" x2="63" y2="96" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        
        <div className="flex flex-col gap-8 flex-1">
          <NavItem to="/" icon={<Clock size={24} strokeWidth={1.5} />} />
          <NavItem to="/tasks" icon={<CheckSquare size={24} strokeWidth={1.5} />} />
          <NavItem to="/stats" icon={<BarChart2 size={24} strokeWidth={1.5} />} />
          <NavItem to="/report" icon={<FileText size={24} strokeWidth={1.5} />} />
        </div>

        <div className="mt-auto flex flex-col gap-4 items-center">
          {user ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm mb-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-[#c24127] text-white flex items-center justify-center font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors mb-2"
              title="登录"
            >
              <LogIn size={18} />
            </button>
          )}
          <NavItem to="/settings" icon={<Settings size={24} strokeWidth={1.5} />} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative">
        {!dataLoaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c24127]"></div>
          </div>
        ) : (
          <Outlet context={contextValue} />
        )}
      </main>
    </div>
  );
}

function NavItem({ to, icon }: { to: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isActive
            ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`
      }
    >
      {icon}
    </NavLink>
  );
}
