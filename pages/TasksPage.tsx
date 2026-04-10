import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import TodoList from '../components/TodoList';
import TaskList from '../components/TaskList';
import AddToScheduleModal from '../components/AddToScheduleModal';
import CalendarView from '../components/CalendarView';
import { TodoItem, ScheduleItem } from '../types';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function TasksPage() {
  const { currentDate, setCurrentDate, dailyData, setDailyData } = useOutletContext<AppContextType>();
  const [todoToSchedule, setTodoToSchedule] = useState<TodoItem | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleTodoChange = (newTodos: TodoItem[]) => {
    setDailyData(prev => ({ ...prev, todos: newTodos }));
  };

  const handleScheduleChange = (newItems: ScheduleItem[]) => {
    setDailyData(prev => ({ ...prev, schedule: newItems }));
  };

  const handleTodoComplete = (todo: TodoItem) => {
    if (!todo.completed) return;
    
    const now = new Date();
    const endStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const start = new Date(now.getTime() - 25 * 60000);
    const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;

    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      title: `[完成] ${todo.text}`,
      startTime: startStr,
      endTime: endStr,
      type: 'auto'
    };
    
    setDailyData(prev => {
      const newSchedule = [...prev.schedule, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...prev, schedule: newSchedule };
    });
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
    setTodoToSchedule(null);
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">任务与日程</h1>
        <div className="relative z-50">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <CalendarIcon size={16} className="text-[#c24127]" />
            {currentDate}
          </button>
          
          {showCalendar && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
              <div className="absolute top-full right-0 mt-2 w-80 h-auto z-50">
                <CalendarView 
                  currentDate={currentDate}
                  onDateSelect={(date) => {
                    setCurrentDate(date);
                    setShowCalendar(false);
                  }}
                  className="shadow-2xl"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <div className="h-full overflow-hidden">
          <TodoList 
            todos={dailyData.todos} 
            onUpdate={handleTodoChange}
            onTodoComplete={handleTodoComplete}
          />
        </div>
        <div className="h-full overflow-hidden">
          <TaskList 
            items={dailyData.schedule} 
            onItemsChange={handleScheduleChange}
          />
        </div>
      </div>

      {todoToSchedule && (
        <AddToScheduleModal 
          todo={todoToSchedule}
          onClose={() => setTodoToSchedule(null)}
          onAdd={handleAddToSchedule}
        />
      )}
    </div>
  );
}
