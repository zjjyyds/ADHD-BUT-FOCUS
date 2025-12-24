import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getStoredDates } from '../services/storageService';

interface CalendarViewProps {
  currentDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, onDateSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dates = getStoredDates();
    setActiveDates(new Set(dates));
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (d: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  };

  const isSelected = (d: number) => {
    const selected = new Date(currentDate);
    return selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d;
  };

  const hasData = (d: number) => {
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    return activeDates.has(dateStr);
  };

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 animate-[fadeIn_0.2s_ease-out] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-slate-50">
           <h3 className="text-lg font-bold text-slate-900">{year}年 {monthNames[month]}</h3>
           <div className="flex items-center gap-1">
               <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={20} /></button>
               <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronRight size={20} /></button>
           </div>
        </div>
        
        <div className="p-6">
            {/* Grid */}
            <div className="grid grid-cols-7 gap-1 mb-3 text-center">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <div key={d} className="text-xs font-semibold text-slate-400">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    
                    const selected = isSelected(day);
                    const today = isToday(day);
                    const active = hasData(day);
                    
                    return (
                        <button
                            key={day}
                            onClick={() => {
                                const mStr = (month + 1).toString().padStart(2, '0');
                                const dStr = day.toString().padStart(2, '0');
                                onDateSelect(`${year}-${mStr}-${dStr}`);
                            }}
                            className={`
                                relative h-9 w-9 mx-auto flex items-center justify-center text-sm font-medium transition-all rounded-full
                                ${selected 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                    : 'text-slate-700 hover:bg-slate-100'}
                                ${today && !selected ? 'text-indigo-600 font-bold' : ''}
                            `}
                        >
                            {day}
                            {active && !selected && (
                                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-slate-300"></div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
        
        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
             <button 
                onClick={() => {
                    const d = new Date();
                    const offset = d.getTimezoneOffset();
                    const local = new Date(d.getTime() - (offset * 60 * 1000));
                    onDateSelect(local.toISOString().split('T')[0]);
                }}
                className="w-full py-3 bg-white text-indigo-600 text-sm font-bold rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
             >
                回到今天
             </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;