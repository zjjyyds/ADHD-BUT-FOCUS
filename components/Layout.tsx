import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Clock, CheckSquare, BarChart2, Settings, LogIn, LogOut } from 'lucide-react';
import { DailyData, ScheduleItem, TodoItem } from '../types';
import { loadDailyData, saveDailyData, createEmptyDailyData } from '../services/storageService';
import { useAuth } from './AuthProvider';

export type AppContextType = {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  dailyData: DailyData;
  setDailyData: React.Dispatch<React.SetStateAction<DailyData>>;
  handleTimerComplete: (title: string, durationMinutes: number) => void;
};

export default function Layout() {
  const getTodayString = () => new Date().toLocaleDateString('en-CA');
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [dailyData, setDailyData] = useState<DailyData>(createEmptyDailyData(currentDate));
  const { user, signIn, logOut, loading } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);

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

  return (
    <div className="flex h-screen w-full bg-[#fdfbf9] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 flex flex-col items-center py-8 border-r border-slate-100 bg-white/50 backdrop-blur-xl z-20">
        <div className="w-10 h-10 rounded-xl bg-[#c24127] text-white flex items-center justify-center font-bold text-xl mb-12 shadow-lg shadow-orange-500/20">
          P
        </div>
        
        <div className="flex flex-col gap-8 flex-1">
          <NavItem to="/" icon={<Clock size={24} strokeWidth={1.5} />} />
          <NavItem to="/tasks" icon={<CheckSquare size={24} strokeWidth={1.5} />} />
          <NavItem to="/stats" icon={<BarChart2 size={24} strokeWidth={1.5} />} />
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
          <Outlet context={{ currentDate, setCurrentDate, dailyData, setDailyData, handleTimerComplete } satisfies AppContextType} />
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
