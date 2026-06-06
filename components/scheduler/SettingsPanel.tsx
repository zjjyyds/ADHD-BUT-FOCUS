import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { X } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, setSettings, onClose }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleApply = () => {
    setSettings({
      pomodoroMinutes: Math.max(1, Math.min(120, localSettings.pomodoroMinutes)),
      timeSliceMinutes: Math.max(1, Math.min(localSettings.pomodoroMinutes, localSettings.timeSliceMinutes)),
      breakMinutes: Math.max(1, Math.min(30, localSettings.breakMinutes)),
      isSoundEnabled: localSettings.isSoundEnabled
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 tracking-tight">System Configuration</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <label className="block">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Global Cycle (Minutes)</div>
            <input
              type="number"
              min="1"
              max="120"
              value={localSettings.pomodoroMinutes}
              onChange={(e) => setLocalSettings({ ...localSettings, pomodoroMinutes: Number(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c24127]/20 focus:border-[#c24127] font-mono text-center text-lg"
            />
          </label>

          <label className="block">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Time Slice (Minutes)</div>
            <input
              type="number"
              min="1"
              max="120"
              value={localSettings.timeSliceMinutes}
              onChange={(e) => setLocalSettings({ ...localSettings, timeSliceMinutes: Number(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c24127]/20 focus:border-[#c24127] font-mono text-center text-lg"
            />
          </label>

          <label className="block">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Break Time (Minutes)</div>
            <input
              type="number"
              min="1"
              max="30"
              value={localSettings.breakMinutes}
              onChange={(e) => setLocalSettings({ ...localSettings, breakMinutes: Number(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c24127]/20 focus:border-[#c24127] font-mono text-center text-lg"
            />
          </label>

          <label className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              checked={localSettings.isSoundEnabled}
              onChange={(e) => setLocalSettings({ ...localSettings, isSoundEnabled: e.target.checked })}
              className="w-5 h-5 text-[#c24127] rounded focus:ring-[#c24127] border-slate-300"
            />
            <span className="text-sm font-bold text-slate-700 tracking-wide">Enable Audio Notifications</span>
          </label>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleApply}
            className="w-full py-4 bg-[#c24127] text-white rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-[#a0301a] shadow-lg shadow-[#c24127]/20 transition-all hover:scale-[1.02]"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
