import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, Zap, List } from 'lucide-react';
import { ScheduleItem } from '../types';

interface TimelineProps {
  items: ScheduleItem[];
  onItemsChange: (items: ScheduleItem[]) => void;
  readOnly?: boolean;
}

const HOUR_HEIGHT = 80;

const Timeline: React.FC<TimelineProps> = ({ items, onItemsChange, readOnly = false }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState('');
  const [modalEndTime, setModalEndTime] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      setCurrentTimeMinutes(minutes);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && currentTimeMinutes !== null) {
      const scrollPos = (currentTimeMinutes / 60) * HOUR_HEIGHT - HOUR_HEIGHT + 40;
      scrollContainerRef.current.scrollTop = scrollPos > 0 ? scrollPos : 0;
    }
  }, []);

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSlotClick = (hour: number) => {
    if (readOnly) return;
    const startStr = `${hour.toString().padStart(2, '0')}:00`;
    const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    setModalStartTime(startStr);
    setModalEndTime(endStr);
    setModalTitle('');
    setIsModalOpen(true);
  };

  const saveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      startTime: modalStartTime,
      endTime: modalEndTime,
      title: modalTitle.trim(),
      type: 'manual',
    };

    onItemsChange([...items, newItem]);
    setIsModalOpen(false);
  };

  const deleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (readOnly) return;
    if (confirm('确定要删除吗？')) {
      onItemsChange(items.filter(i => i.id !== id));
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col h-[650px] overflow-hidden relative">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
           <List className="text-indigo-500" size={24} /> 日程表
        </h2>
        {!readOnly && (
           <button 
             onClick={() => handleSlotClick(new Date().getHours())}
             className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors border border-slate-100"
           >
             <Plus size={20} />
           </button>
        )}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative scroll-smooth bg-white">
        
        <div className="relative min-h-[1920px] pt-4 pb-20"> 
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="flex box-border group"
              style={{ height: `${HOUR_HEIGHT}px` }}
              onClick={() => handleSlotClick(hour)}
            >
              {/* Time Column */}
              <div className="w-20 flex-shrink-0 text-xs font-semibold text-slate-400 text-right pr-6 -mt-2.5 select-none">
                {hour === 0 ? '' : `${hour}:00`}
              </div>
              
              {/* Grid Line */}
              <div className="flex-1 border-t border-slate-100 relative cursor-pointer">
                 {!readOnly && (
                   <div className="hidden group-hover:flex absolute inset-0 items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="w-full h-full bg-slate-50/40 flex items-center justify-center">
                        <Plus className="text-slate-300" size={24} />
                     </div>
                   </div>
                 )}
              </div>
            </div>
          ))}

          {/* Current Time Indicator - Red Line */}
          {currentTimeMinutes !== null && (
             <div 
               className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
               style={{ top: `${(currentTimeMinutes / 60) * HOUR_HEIGHT + 16}px` }}
             >
                <div className="w-20 text-right pr-6 text-xs font-bold text-red-500">
                   {minutesToTime(currentTimeMinutes)}
                </div>
                <div className="flex-1 flex items-center">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 ring-2 ring-white"></div>
                   <div className="flex-1 h-[2px] bg-red-500 shadow-sm"></div>
                </div>
             </div>
          )}

          {/* Events Overlay - Modern Calendar Blocks */}
          {items.map((item) => {
            const startMin = timeToMinutes(item.startTime);
            const endMin = timeToMinutes(item.endTime);
            const durationMin = Math.max(endMin - startMin, 15);
            
            const top = (startMin / 60) * HOUR_HEIGHT + 16;
            const height = (durationMin / 60) * HOUR_HEIGHT;

            return (
              <div
                key={item.id}
                className={`absolute left-24 right-4 p-3 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] hover:z-30 cursor-default group border
                  ${item.type === 'auto' 
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
                style={{ 
                  top: `${top}px`, 
                  height: `${height - 2}px`, 
                  zIndex: 10 
                }}
              >
                <div className="flex justify-between items-start h-full">
                  <div className="flex flex-col h-full min-w-0 justify-center">
                     <div className="font-bold text-sm truncate flex items-center gap-2">
                        {item.type === 'auto' && <Zap size={14} className="fill-current opacity-70" />}
                        {item.title}
                     </div>
                     <div className="opacity-70 text-xs mt-0.5 font-medium pl-0.5">
                       {item.startTime} - {item.endTime}
                     </div>
                  </div>
                  {!readOnly && (
                    <button 
                      onClick={(e) => deleteItem(e, item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full p-2 transition-all shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Glass Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 animate-[fadeIn_0.2s_ease-out] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-xl">添加事项</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={saveNewItem} className="space-y-5">
                <div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="你想做什么？"
                    value={modalTitle}
                    onChange={e => setModalTitle(e.target.value)}
                    className="w-full text-lg font-bold bg-slate-50 border-transparent rounded-2xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-wide">开始</label>
                    <input
                      type="time"
                      value={modalStartTime}
                      onChange={e => setModalStartTime(e.target.value)}
                      className="w-full bg-slate-50 border-transparent rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-wide">结束</label>
                    <input
                      type="time"
                      value={modalEndTime}
                      onChange={e => setModalEndTime(e.target.value)}
                      className="w-full bg-slate-50 border-transparent rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3 mt-4">
                   <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                   >
                     取消
                   </button>
                   <button 
                    type="submit"
                    className="px-8 py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                   >
                     确认
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;