import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStoredDates } from '../services/storageService';

interface CalendarViewProps {
  currentDate: string;
  onDateSelect: (date: string) => void;
  className?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, onDateSelect, className = '' }) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const fetchDates = async () => {
      const dates = await getStoredDates();
      if (isMounted) {
        setActiveDates(new Set(dates));
      }
    };
    fetchDates();
    return () => { isMounted = false; };
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
    <div className={`bg-white w-full rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden flex flex-col h-full ${className}`}>
      
      {/* Header */}
      <div className="p-4 lg:p-5 flex justify-between items-center border-b border-slate-100 shrink-0">
         <h3 className="text-lg font-bold text-slate-800">{year}年 {monthNames[month]}</h3>
         <div className="flex items-center gap-1">
             <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={18} /></button>
             <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronRight size={18} /></button>
         </div>
      </div>
      
      <div className="p-4 lg:p-5 flex-1 flex flex-col justify-center">
          {/* Grid */}
          <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-4 text-center">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="text-[10px] lg:text-xs font-bold text-slate-400">{d}</div>
              ))}
          </div>
          <div className="grid grid-cols-7 gap-1 lg:gap-2">
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
                              relative h-8 w-8 lg:h-10 lg:w-10 mx-auto flex items-center justify-center text-sm font-medium transition-all rounded-full
                              ${selected 
                                  ? 'bg-[#c24127] text-white shadow-lg shadow-orange-500/30' 
                                  : 'text-slate-700 hover:bg-slate-100'}
                              ${today && !selected ? 'text-[#c24127] font-bold' : ''}
                          `}
                      >
                          {day}
                          {active && !selected && (
                              <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          )}
                      </button>
                  )
              })}
          </div>
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
           <button 
              onClick={() => {
                  const d = new Date();
                  const offset = d.getTimezoneOffset();
                  const local = new Date(d.getTime() - (offset * 60 * 1000));
                  onDateSelect(local.toISOString().split('T')[0]);
              }}
              className="w-full py-2.5 bg-white text-slate-700 text-sm font-bold rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
           >
              回到今天
           </button>
      </div>
    </div>
  );
};

export default CalendarView;