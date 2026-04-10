import React, { useRef, useState } from 'react';
import { Download, Upload, Database, X, User as UserIcon, LogOut, Loader2 } from 'lucide-react';
import { exportAllData, importData } from '../services/storageService';
import { useAuth } from './AuthProvider';

export default function DataSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logOut, signIn } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      try {
        await importData(file, () => {
          window.location.reload();
        });
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAllData();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* User Profile Section */}
      <section>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pl-2">
          账号
        </h4>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 p-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                    <UserIcon size={24} />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">{user.displayName || 'User'}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <UserIcon size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">未登录</div>
                  <div className="text-sm text-slate-500">登录以在云端同步您的数据</div>
                </div>
              </div>
              <button
                onClick={signIn}
                className="px-4 py-2 text-sm font-medium text-white bg-[#c24127] hover:bg-[#a33620] rounded-xl transition-colors shadow-sm shadow-orange-500/20"
              >
                登录 / 注册
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Data Management Group */}
      <section>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pl-2">
          数据管理
        </h4>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 divide-y divide-slate-100">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                </div>
                <div>
                    <div className="text-sm font-semibold text-slate-900">备份数据</div>
                    <div className="text-xs text-slate-400">导出 JSON 文件</div>
                </div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                    {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
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
  );
}