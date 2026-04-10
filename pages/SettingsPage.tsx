import React from 'react';
import DataSettings from '../components/DataSettings';

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 h-full flex flex-col gap-6 overflow-hidden">
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">设置</h1>
      
      <div className="flex-1 overflow-y-auto no-scrollbar max-w-2xl">
        <DataSettings />
      </div>
    </div>
  );
}
