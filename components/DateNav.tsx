import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import CalendarView from './CalendarView';

interface DateNavProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

const DateNav: React.FC<DateNavProps> = ({ currentDate, onDateChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const dStr = d.toISOString().split('T')[0];
    const tStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' };
    const text = d.toLocaleDateString('zh-CN', options);
    
    return dStr === tStr ? `今天, ${text}` : text;
  };

  const adjustDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  return (
    <>
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => adjustDate(-1)}
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all group"
          onClick={() => setIsCalendarOpen(true)}
        >
          <CalendarIcon size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-800">
            {formatDateDisplay(currentDate)}
          </span>
        </button>

        <button 
          onClick={() => adjustDate(1)}
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {isCalendarOpen && (
        <CalendarView 
          currentDate={currentDate}
          onDateSelect={(date) => {
            onDateChange(date);
            setIsCalendarOpen(false);
          }}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
    </>
  );
};

export default DateNav;