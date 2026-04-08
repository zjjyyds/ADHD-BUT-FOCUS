import React, { useState, useEffect } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import { TodoItem, ScheduleItem } from '../types';

interface AddToScheduleModalProps {
  todo: TodoItem | null;
  onClose: () => void;
  onAdd: (item: Omit<ScheduleItem, 'id' | 'type'>) => void;
}

const AddToScheduleModal: React.FC<AddToScheduleModalProps> = ({ todo, onClose, onAdd }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.text);
      
      // Default to current time
      const now = new Date();
      const startStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setStartTime(startStr);
      
      // Default end time to +25 mins
      const end = new Date(now.getTime() + 25 * 60000);
      const endStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      setEndTime(endStr);
    }
  }, [todo]);

  if (!todo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    onAdd({ title, startTime, endTime });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 animate-[fadeIn_0.2s_ease-out] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <CalendarPlus className="text-indigo-500" size={20} /> 添加到日程表
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">任务名称</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">开始时间</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">结束时间</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md transition-all active:scale-95"
            >
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToScheduleModal;
