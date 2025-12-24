import React, { useState, useEffect, useCallback } from 'react';
import { Settings, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import Timer from './components/Timer';
import Timeline from './components/TaskList';
import TodoList from './components/TodoList';
import DateNav from './components/DateNav';
import SettingsModal from './components/DataSettings';
import { loadDailyData, saveDailyData, loadSettings } from './services/storageService';
import { DailyData, ScheduleItem, TodoItem, TimerMode, TimerConfig } from './types';

const App: React.FC = () => {
  const getTodayString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [dailyData, setDailyData] = useState<DailyData>(loadDailyData(getTodayString()));
  const [timerConfig, setTimerConfig] = useState<TimerConfig>(loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{name: string, minutes: number}[]>([]);

  useEffect(() => {
    setDailyData(loadDailyData(currentDate));
  }, [currentDate]);

  useEffect(() => {
    saveDailyData(dailyData);
  }, [dailyData]);

  useEffect(() => {
    const data = [];
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const todayLocal = new Date(today.getTime() - (offset * 60 * 1000));

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayLocal);
      d.setDate(todayLocal.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let minutes = 0;
      if (dateStr === dailyData.date) {
        minutes = dailyData.focusMinutes;
      } else {
        minutes = loadDailyData(dateStr).focusMinutes;
      }

      data.push({
        name: i === 0 ? '今天' : d.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', ''),
        minutes: minutes,
      });
    }
    setWeeklyData(data);
  }, [dailyData]);

  const handleScheduleChange = (newItems: ScheduleItem[]) => {
    setDailyData(prev => ({ ...prev, schedule: newItems }));
  };

  const handleTodoChange = (newTodos: TodoItem[]) => {
    setDailyData(prev => ({ ...prev, todos: newTodos }));
  };

  const handleSessionComplete = useCallback((durationMinutes: number, mode: TimerMode) => {
    if (mode === TimerMode.WORK) {
      const today = getTodayString();
      const now = new Date();
      const endStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const startMs = now.getTime() - durationMinutes * 60 * 1000;
      const startDate = new Date(startMs);
      const startStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

      const newItem: ScheduleItem = {
        id: crypto.randomUUID(),
        startTime: startStr,
        endTime: endStr,
        title: '专注时间',
        type: 'auto'
      };

      if (currentDate === today) {
        setDailyData(prev => ({
          ...prev,
          focusMinutes: prev.focusMinutes + durationMinutes,
          schedule: [...prev.schedule, newItem]
        }));
      } else {
        const todayData = loadDailyData(today);
        todayData.focusMinutes += durationMinutes;
        todayData.schedule.push(newItem);
        saveDailyData(todayData);
      }
    }
  }, [currentDate]);

  const reloadData = () => {
    setDailyData(loadDailyData(currentDate));
    setTimerConfig(loadSettings());
  };

  const isToday = currentDate === getTodayString();
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);

  return (
    <div className="min-h-screen lg:h-screen w-full text-slate-900 bg-[#f5f5f7] font-sans flex flex-col lg:overflow-hidden">
      
      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        
        {/* Left Sidebar: Fixed on Desktop */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 lg:h-full">
          
          {/* Header & Nav Area */}
          <div className="flex-shrink-0 space-y-6">
            <header className="flex items-center justify-between pl-2">
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Productivity</div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Plan & Focus</h1>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-full shadow-sm border border-slate-200 transition-all active:scale-95"
              >
                <Settings size={20} />
              </button>
            </header>

            <DateNav currentDate={currentDate} onDateChange={setCurrentDate} />
          </div>

          {/* Timer Area - Scrollable if height is small, but hidden scrollbar */}
          <div className="flex-1 lg:overflow-y-auto no-scrollbar min-h-0">
             <Timer 
               config={timerConfig}
               onSessionComplete={handleSessionComplete} 
             />
          </div>
        </div>

        {/* Right Content Area: Independently Scrollable on Desktop */}
        <div className="lg:col-span-8 xl:col-span-9 lg:h-full lg:overflow-y-auto no-scrollbar flex flex-col gap-6 pb-20">
           
           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-shrink-0">
              {/* Focus Time */}
              <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col justify-center gap-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wide">
                   <Clock size={14} /> 专注时长
                 </div>
                 <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black text-slate-900 tracking-tight">{Math.floor(dailyData.focusMinutes / 60)}</span>
                   <span className="text-sm font-semibold text-slate-400">h</span>
                   <span className="text-4xl font-black text-slate-900 tracking-tight ml-1">{dailyData.focusMinutes % 60}</span>
                   <span className="text-sm font-semibold text-slate-400">m</span>
                 </div>
              </div>

              {/* Completed Tasks */}
              <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col justify-center gap-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wide">
                   <CheckCircle2 size={14} /> 完成事项
                 </div>
                 <div className="text-4xl font-black text-slate-900 tracking-tight">
                   {dailyData.schedule.length}
                 </div>
              </div>

              {/* Weekly Chart */}
              <div className="md:col-span-2 xl:col-span-2 bg-white p-6 rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col justify-between">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">
                   <BarChart3 size={14} /> 本周概览
                 </div>
                 <div className="h-16 flex items-end justify-between gap-3">
                   {weeklyData.map((day, idx) => {
                     const heightPercent = Math.min((day.minutes / maxMinutes) * 100, 100);
                     const isToday = idx === weeklyData.length - 1;
                     return (
                       <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <div className="w-full flex items-end justify-center h-full relative">
                             <div 
                               style={{ height: `${heightPercent}%` }} 
                               className={`w-full max-w-[16px] rounded-full transition-all duration-500 ease-out
                                 ${isToday ? 'bg-indigo-500 shadow-lg shadow-indigo-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                             />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                            {day.name}
                          </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
           </div>

           {/* Lists Row */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
             <div className="w-full">
               <Timeline 
                  items={dailyData.schedule} 
                  onItemsChange={handleScheduleChange} 
                  readOnly={!isToday}
                />
             </div>
             
             <div className="w-full">
                <TodoList 
                  todos={dailyData.todos || []}
                  onUpdate={handleTodoChange}
                  readOnly={!isToday}
                />
                
                {!isToday && (
                  <div className="text-center py-6 animate-pulse mt-4">
                     <span className="px-5 py-2 bg-slate-200/50 text-slate-500 rounded-full text-xs font-bold tracking-wide">
                       您正在查看历史记录
                     </span>
                  </div>
                )}
             </div>
           </div>

        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onDataImported={reloadData}
        currentConfig={timerConfig}
        onConfigSave={setTimerConfig}
      />
    </div>
  );
};

export default App;