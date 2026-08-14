import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Info, AlertCircle, Circle, Check, Plus, Edit2, Play, Trash2, X, List } from 'lucide-react';
import { ScheduleItem } from '../types';

interface MustDoTimelineProps {
  items: ScheduleItem[];
  onItemsChange: (items: ScheduleItem[]) => void;
  onStartTask: (item: ScheduleItem) => void;
  onOpenEditor: () => void;
}

function MustDoTimeline({ items, onItemsChange, onStartTask, onOpenEditor }: MustDoTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Helper to determine display status if not explicitly set
  const getItemStatus = (item: ScheduleItem) => {
    if (item.status === 'completed') return 'completed';
    if (item.status === 'delayed') return 'delayed';
    
    const startMins = timeToMinutes(item.startTime);
    const endMins = timeToMinutes(item.endTime);
    
    if (currentMinutes >= startMins && currentMinutes < endMins) return 'in-progress';
    if (currentMinutes >= endMins) return 'delayed'; // Overdue but not completed
    return 'upcoming';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除此任务吗？')) {
      onItemsChange(items.filter(i => i.id !== id));
    }
  };

  // Remove the static demo items completely, use real items
  const displayItems = items;

  return (
    <div className="bg-white h-full flex flex-col rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#c24127] rounded-full"></div>
          必达时间线
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenEditor}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md"
          >
            <List size={16} />
            批量编辑
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute left-[104px] top-8 bottom-8 w-px bg-slate-200"></div>

        {displayItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10">
            <Clock size={48} className="mb-4 opacity-20" />
            <p className="font-medium text-slate-500">当前没有安排任务</p>
            <button 
              onClick={onOpenEditor}
              className="mt-4 text-orange-600 font-bold hover:underline"
            >
              + 批量添加排期
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {displayItems.map((item, index) => {
              const status = getItemStatus(item);
              
              return (
                <div 
                  key={item.id || index} 
                  className="flex relative z-10 group"
                >
                  {/* Time Column */}
                  <div className="w-20 shrink-0 text-right pr-6 flex flex-col justify-start pt-1">
                    {status === 'delayed' ? (
                      <>
                        <div className="text-sm font-bold text-red-500 mb-0.5">{item.startTime}</div>
                        {item.originalStartTime && (
                           <div className="text-xs text-red-300 line-through mb-1">{item.originalStartTime}</div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm font-bold text-slate-800 mb-1">{item.startTime}</div>
                    )}
                    <div className="text-xs text-slate-400">{item.endTime}</div>
                  </div>

                  {/* Node Icon */}
                  <div className="absolute left-[104px] -translate-x-1/2 top-1 flex items-center justify-center">
                    {status === 'completed' && (
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center border-4 border-white shadow-[0_0_0_1px_rgba(194,65,39,0.1)]">
                        <Check size={12} className="text-white stroke-[3]" />
                      </div>
                    )}
                    {status === 'in-progress' && (
                      <div className="w-6 h-6 rounded-full bg-white border-[5px] border-slate-800 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                      </div>
                    )}
                    {status === 'delayed' && (
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-red-500 flex items-center justify-center text-red-500">
                        <AlertCircle size={14} />
                      </div>
                    )}
                    {status === 'upcoming' && (
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      </div>
                    )}
                  </div>

                  {/* Card Column */}
                  <div className="flex-1 pl-12 relative group/card">
                    <div className={`p-5 rounded-xl border transition-all ${
                      status === 'in-progress' 
                        ? 'bg-white border-slate-800 border-2 shadow-[4px_4px_0px_rgba(30,41,59,1)] scale-[1.02] transform' 
                        : status === 'delayed'
                        ? 'bg-red-50/50 border-red-200 hover:bg-red-50'
                        : 'bg-slate-50/80 border-slate-100 hover:bg-slate-50'
                    }`}>
                      
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-bold text-base ${status === 'delayed' ? 'text-slate-800' : 'text-slate-800'}`}>
                          {item.title}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          {/* Quick Actions overlay on hover */}
                          <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onOpenEditor(); }}
                              className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                              title="批量编辑"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {status === 'in-progress' && (
                            <span className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-md tracking-wider">
                              进行中
                            </span>
                          )}
                          {status === 'delayed' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-md tracking-wider">
                              <Clock size={10} /> 已顺延
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onStartTask(item); }}
                          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            status === 'in-progress'
                              ? 'bg-[#c24127] text-white hover:bg-[#a0301a]'
                              : 'bg-slate-800 text-white hover:bg-slate-700'
                          }`}
                        >
                          <Play size={14} className={status === 'in-progress' ? 'fill-current text-white' : 'fill-current text-white'} />
                          开始计时
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default React.memo(MustDoTimeline);
