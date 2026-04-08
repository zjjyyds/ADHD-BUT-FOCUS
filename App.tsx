import React, { useState, useEffect, useCallback } from 'react';
import { Settings, CheckCircle2, Clock, BarChart3, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react';
import VisualTimer, { WeekDaysWidget, WeekHoursWidget } from './components/Timer';
import Timeline from './components/TaskList';
import TodoList from './components/TodoList';
import DateNav from './components/DateNav';
import SettingsModal from './components/DataSettings';
import AddToScheduleModal from './components/AddToScheduleModal';
import { loadDailyData, saveDailyData, loadSettings } from './services/storageService';
import { DailyData, ScheduleItem, TodoItem, TimerConfig } from './types';

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
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'todo' | 'schedule'>('todo');
  const [completedTodoToSchedule, setCompletedTodoToSchedule] = useState<TodoItem | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute for the top widgets
    return () => clearInterval(timer);
  }, []);

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

  const handleTodoComplete = (todo: TodoItem) => {
    setCompletedTodoToSchedule(todo);
  };

  const handleAddToSchedule = (item: Omit<ScheduleItem, 'id' | 'type'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: crypto.randomUUID(),
      type: 'manual'
    };
    
    setDailyData(prev => {
      const newSchedule = [...prev.schedule, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...prev, schedule: newSchedule };
    });
    
    // Switch to schedule tab to see the newly added item
    setActiveTab('schedule');
  };

  const reloadData = () => {
    setDailyData(loadDailyData(currentDate));
    setTimerConfig(loadSettings());
  };

  const isToday = currentDate === getTodayString();
  
  // Calculate Stats
  const weeklyTotalMinutes = weeklyData.reduce((acc, curr) => acc + curr.minutes, 0);
  const weeklyHours = Math.floor(weeklyTotalMinutes / 60);
  const weeklyRemainingMinutes = weeklyTotalMinutes % 60;
  
  const totalTasks = dailyData.todos.length;
  const completedTasks = dailyData.todos.filter(t => t.completed).length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const currentDayOfWeek = new Date().getDay(); // 0 is Sunday
  const dayIndex = currentDayOfWeek === 0 ? 7 : currentDayOfWeek; // 1 (Mon) - 7 (Sun)
  const weekProgress = Math.round((dayIndex / 7) * 100);

  return (
    <div className="min-h-screen lg:h-screen w-full text-slate-900 bg-[#f5f5f7] font-sans flex flex-col lg:overflow-hidden">
      
      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        
        {/* Left Sidebar: Scrollable as a single unit for better UX */}
        <div className="lg:col-span-4 xl:col-span-3 lg:h-full lg:overflow-y-auto no-scrollbar flex flex-col gap-6 pb-10">
          
          {/* Header & Nav */}
          <div className="space-y-6">
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

          {/* Visual Timer Widgets - Constrained width for aesthetics */}
          <div className="w-full flex flex-col gap-6">
             <VisualTimer />
             <WeekDaysWidget now={now} />
             <WeekHoursWidget now={now} />
          </div>
        </div>

        {/* Right Content Area: Independently Scrollable on Desktop */}
        <div className="lg:col-span-8 xl:col-span-9 lg:h-full lg:overflow-y-auto no-scrollbar flex flex-col gap-6 pb-20 pt-1">
           
           {!isToday && (
            <div className="w-full bg-amber-50/80 backdrop-blur-sm border border-amber-100 rounded-[2rem] p-4 flex items-center gap-4 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-inner">
                   <Clock size={20} strokeWidth={2.5} />
                </div>
                <div>
                   <div className="font-bold text-sm">历史回顾模式</div>
                   <div className="text-xs font-medium opacity-70 mt-0.5">您正在查看 {currentDate} 的数据。历史记录仅供查阅，不支持修改。</div>
                </div>
             </div>
           )}

           {/* Tabs */}
           <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit mb-2">
             <button 
               onClick={() => setActiveTab('todo')}
               className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'todo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               待办清单
             </button>
             <button 
               onClick={() => setActiveTab('schedule')}
               className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               日程表
             </button>
           </div>

           {/* Active List */}
           <div className="w-full h-full">
             {activeTab === 'todo' ? (
                <TodoList 
                  todos={dailyData.todos || []}
                  onUpdate={handleTodoChange}
                  readOnly={!isToday}
                  onTodoComplete={handleTodoComplete}
                />
             ) : (
               <Timeline 
                  items={dailyData.schedule} 
                  onItemsChange={handleScheduleChange} 
                  readOnly={!isToday}
                />
             )}
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

      <AddToScheduleModal 
        todo={completedTodoToSchedule}
        onClose={() => setCompletedTodoToSchedule(null)}
        onAdd={handleAddToSchedule}
      />
    </div>
  );
};

export default App;