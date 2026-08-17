import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import MustDoTimeline from '../components/MustDoTimeline';
import { ScheduleItem, SchedulePreset } from '../types';
import { X, Plus, Trash2, Bookmark, Save } from 'lucide-react';


const TimeSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const parts = (value || '00:00').split(':');
  const h = parts[0] || '00';
  const m = parts[1] || '00';
  
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}:${m}`);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${h}:${e.target.value}`);
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 transition-colors">
      <select 
        value={h} 
        onChange={handleHourChange} 
        className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none text-center text-center"
      >
        {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <span className="text-slate-400 font-bold -mx-0.5">:</span>
      <select 
        value={m} 
        onChange={handleMinChange} 
        className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none text-center"
      >
        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(min => (
          <option key={min} value={min}>{min}</option>
        ))}
      </select>
    </div>
  );
};

export default function DailyPlanPage() {
  const { 
    dailyData, setDailyData,
    setTaskName, setCategory, setInputMinutes, setTotalTime, setTimeLeft,
    globalSettings, setGlobalSettings, setActiveScheduleId
  } = useOutletContext<AppContextType>();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<ScheduleItem[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Sync draft schedule when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      if (dailyData.schedule && dailyData.schedule.length > 0) {
        setDraftSchedule([...dailyData.schedule]);
      } else {
        // Provide an initial empty row if schedule is empty
        setDraftSchedule([{
          id: Date.now().toString(),
          title: '',
          startTime: '09:00',
          endTime: '10:00',
          type: 'manual'
        }]);
      }
    }
  }, [isDrawerOpen, dailyData.schedule]);

  const handleScheduleChange = useCallback((newItems: ScheduleItem[]) => {
    setDailyData(prev => ({ ...prev, schedule: newItems }));
  }, [setDailyData]);

  const handleStartTask = useCallback((item: ScheduleItem) => {
    setTaskName(item.title);
    if (item.category) {
      setCategory(item.category);
    }
    
    // Calculate duration in minutes
    let durationMins = 25;
    if (item.startTime && item.endTime) {
      const [sh, sm] = item.startTime.split(':').map(Number);
      const [eh, em] = item.endTime.split(':').map(Number);
      durationMins = Math.max(1, (eh * 60 + em) - (sh * 60 + sm));
    }
    
    setInputMinutes(durationMins);
    setTotalTime(durationMins * 60);
    setTimeLeft(durationMins * 60);

    // Record the task as currently active
    setActiveScheduleId(item.id);

    // Update the task's start time to NOW, and end time to NOW + duration
    const now = new Date();
    const startStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const end = new Date(now.getTime() + durationMins * 60000);
    const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    setDailyData(prev => ({
      ...prev,
      schedule: (prev.schedule || []).map(s => 
        s.id === item.id 
          ? { 
              ...s, 
              startTime: startStr, 
              endTime: endStr, 
              originalStartTime: s.originalStartTime || s.startTime,
              status: 'in-progress' 
            }
          : s
      ).sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));

    // Jump to timer page
    navigate('/');
  }, [navigate, setActiveScheduleId, setCategory, setDailyData, setInputMinutes, setTaskName, setTimeLeft, setTotalTime]);

  const displaySchedule = useMemo(() => dailyData.schedule || [], [dailyData.schedule]);

  const handleOpenEditor = useCallback(() => setIsDrawerOpen(true), []);

  const handleAddDraftRow = () => {
    setDraftSchedule(prev => [
      ...prev, 
      {
        id: Date.now().toString(),
        title: '',
        startTime: '10:00',
        endTime: '11:00',
        type: 'manual'
      }
    ]);
  };

  const updateDraftRow = (id: string, field: keyof ScheduleItem, value: string) => {
    setDraftSchedule(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteDraftRow = (id: string) => {
    setDraftSchedule(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveDraft = () => {
    // Filter out completely empty rows
    const validItems = draftSchedule.filter(i => i.title.trim() !== '');
    
    // Sort by start time
    validItems.sort((a, b) => {
      const [ah, am] = a.startTime.split(':').map(Number);
      const [bh, bm] = b.startTime.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

    handleScheduleChange(validItems);
    setIsDrawerOpen(false);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const validItems = draftSchedule.filter(i => i.title.trim() !== '');
    validItems.sort((a, b) => {
      const [ah, am] = a.startTime.split(':').map(Number);
      const [bh, bm] = b.startTime.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

    const newPreset: SchedulePreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      items: validItems
    };

    setGlobalSettings(prev => ({
      ...prev,
      schedulePresets: [...(prev.schedulePresets || []), newPreset]
    }));
    setPresetName('');
    setShowSavePreset(false);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = globalSettings.schedulePresets?.find(p => p.id === presetId);
    if (preset) {
      const newItems = preset.items.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(7)
      }));
      setDraftSchedule(newItems);
    }
  };

  const handleDeletePreset = (presetId: string) => {
    setGlobalSettings(prev => ({
      ...prev,
      schedulePresets: (prev.schedulePresets || []).filter(p => p.id !== presetId)
    }));
  };

  return (
    <div className="flex h-full bg-transparent relative">
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-hidden min-h-0">
        <div className="max-w-5xl mx-auto h-full">
           <MustDoTimeline 
             items={displaySchedule}
             onItemsChange={handleScheduleChange}
             onStartTask={handleStartTask}
             onOpenEditor={handleOpenEditor}
           />
        </div>
      </div>

      {/* Editor Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Editor Drawer Panel (Slide from Left) */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[500px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800">批量编辑今日排期</h2>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* Preset Module */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark size={14} /> 排期套装
              </span>
              <button 
                onClick={() => setShowSavePreset(!showSavePreset)}
                className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
              >
                <Save size={12} /> 保存当前为套装
              </button>
            </div>

            {showSavePreset && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <input 
                  autoFocus
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="套装名称，如：周末充电" 
                  className="flex-1 px-3 py-1.5 text-sm font-bold text-slate-700 bg-white rounded-lg border-transparent outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <button 
                  onClick={handleSavePreset}
                  className="text-sm px-4 py-1.5 bg-[#c24127] text-white font-bold rounded-lg hover:bg-[#a0301a] shadow-sm transition-colors"
                >
                  保存
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {globalSettings.schedulePresets?.map(p => (
                <div 
                  key={p.id} 
                  className="group flex items-center bg-white border border-slate-200 rounded-lg shadow-sm hover:border-orange-300 hover:shadow transition-all cursor-pointer overflow-hidden"
                  onClick={() => handleLoadPreset(p.id)}
                >
                  <span className="text-sm font-bold text-slate-700 px-3 py-1.5">{p.name}</span>
                  <div className="w-px h-4 bg-slate-100"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePreset(p.id); }}
                    className="px-2.5 py-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-50 group-hover:opacity-100"
                    title="删除套装"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!globalSettings.schedulePresets || globalSettings.schedulePresets.length === 0) && (
                <div className="text-xs text-slate-400 font-medium">
                  暂无套装，可保存当前排期方便日后一键加载。
                </div>
              )}
            </div>
          </div>

          <div className="flex text-xs font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider">
            <div className="w-[190px]">时间范围</div>
            <div className="flex-1 pl-4">任务名称</div>
          </div>
          
          <div className="space-y-3">
            {draftSchedule.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-center group bg-white p-2 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-1.5 shrink-0">
                  <TimeSelect value={item.startTime} onChange={(val) => updateDraftRow(item.id, 'startTime', val)} />
                  <span className="text-slate-300">-</span>
                  <TimeSelect value={item.endTime} onChange={(val) => updateDraftRow(item.id, 'endTime', val)} />
                </div>
                
                <input 
                  type="text" 
                  value={item.title} 
                  onChange={(e) => updateDraftRow(item.id, 'title', e.target.value)}
                  placeholder="输入任务事项..."
                  className="flex-1 px-3 py-2 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:bg-slate-50 rounded-lg"
                />
                
                <button 
                  onClick={() => deleteDraftRow(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAddDraftRow}
            className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            添加事项
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSaveDraft}
            className="px-8 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            保存更改
          </button>
        </div>
      </div>

    </div>
  );
}
