import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, Database, X, Clock, Save, RotateCcw } from 'lucide-react';
import { exportAllData, importData, saveSettings, DEFAULT_TIMER_CONFIG } from '../services/storageService';
import { TimerConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  currentConfig: TimerConfig;
  onConfigSave: (config: TimerConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onDataImported, currentConfig, onConfigSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<TimerConfig>(currentConfig);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file, () => {
        onDataImported();
        onClose();
      });
    }
  };

  const handleConfigChange = (key: keyof TimerConfig, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setConfig(prev => ({ ...prev, [key]: num }));
    }
  };

  const saveConfig = () => {
    saveSettings(config);
    onConfigSave(config);
    setSavedMsg('已保存');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_TIMER_CONFIG);
    setSavedMsg('已重置');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-[#f2f2f7] w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
          <h3 className="font-bold text-slate-900 text-lg">设置</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-8">
          
          {/* Timer Settings Group */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pl-2">
               专注时长配置 (分钟)
            </h4>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 divide-y divide-slate-100">
              <div className="flex items-center justify-between p-4">
                <label className="text-sm font-medium text-slate-700">专注时长</label>
                <input 
                  type="number" 
                  value={config.work}
                  onChange={(e) => handleConfigChange('work', e.target.value)}
                  className="w-20 bg-slate-50 rounded-lg px-3 py-1.5 text-center text-sm font-bold text-slate-900 focus:bg-indigo-50 focus:text-indigo-600 outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <label className="text-sm font-medium text-slate-700">小憩时长</label>
                <input 
                  type="number" 
                  value={config.short}
                  onChange={(e) => handleConfigChange('short', e.target.value)}
                  className="w-20 bg-slate-50 rounded-lg px-3 py-1.5 text-center text-sm font-bold text-slate-900 focus:bg-emerald-50 focus:text-emerald-600 outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <label className="text-sm font-medium text-slate-700">长歇时长</label>
                <input 
                  type="number" 
                  value={config.long}
                  onChange={(e) => handleConfigChange('long', e.target.value)}
                  className="w-20 bg-slate-50 rounded-lg px-3 py-1.5 text-center text-sm font-bold text-slate-900 focus:bg-blue-50 focus:text-blue-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-2">
              <button 
                onClick={resetConfig}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                恢复默认
              </button>
              <div className="flex items-center gap-3">
                 {savedMsg && <span className="text-xs font-medium text-emerald-500 animate-pulse">{savedMsg}</span>}
                 <button 
                  onClick={saveConfig}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  保存更改
                </button>
              </div>
            </div>
          </section>

          {/* Data Management Group */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pl-2">
              数据管理
            </h4>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 divide-y divide-slate-100">
              <button
                onClick={() => exportAllData()}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Download size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900">备份数据</div>
                        <div className="text-xs text-slate-400">导出 JSON 文件</div>
                    </div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Upload size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900">恢复备份</div>
                        <div className="text-xs text-slate-400">导入 JSON 文件</div>
                    </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;