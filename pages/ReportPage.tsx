import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import { getStoredDates, loadDailyData, createEmptyDailyData, getAllDailyData } from '../services/storageService';
import { Download, FileText, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export default function ReportPage() {
  const { currentDate } = useOutletContext<AppContextType>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [reportData, setReportData] = useState<{
    totalFocus: number;
    totalTasks: number;
    mostProductiveDay: string;
    weeklyData: any[];
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      setLoading(true);
      const allData = await getAllDailyData();
      if (!isMounted) return;

      const dataMap = new Map(allData.map(d => [d.date, d]));
      
      const weeklyData = [];
      let tFocus = 0;
      let tTasks = 0;
      let maxFocus = -1;
      let bestDay = '这周暂无';
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const dayOfWeekStr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
        const fullDayOfWeekStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
        const data = dataMap.get(dStr) || createEmptyDailyData(dStr);
        
        const dayFocus = data.focusMinutes || 0;
        const dayTasks = (data.todos || []).filter(t => t.completed).length;

        weeklyData.push({
          date: dStr,
          dayName: dayOfWeekStr,
          fullDayOfWeekStr,
          focusMinutes: dayFocus,
          tasks: data.todos?.map(t => ({ text: t.text, completed: t.completed })) || [],
          schedule: data.schedule?.map(s => ({ title: s.title, startTime: s.startTime, endTime: s.endTime, type: s.type })) || []
        });
        
        tFocus += dayFocus;
        tTasks += dayTasks;
        
        if (dayFocus > maxFocus) {
          maxFocus = dayFocus;
          if (dayFocus > 0) bestDay = dayOfWeekStr;
        }
      }

      if (isMounted) {
        setReportData({
          totalFocus: tFocus,
          totalTasks: tTasks,
          mostProductiveDay: bestDay,
          weeklyData
        });
        setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [user]);

  const handleExportWeeklyReport = () => {
    if (!reportData) return;
    
    let completedWeeklyTasks: string[] = [];
    reportData.weeklyData.forEach(day => {
      day.tasks.filter((t: any) => t.completed).forEach((t: any) => {
        completedWeeklyTasks.push(t.text);
      });
    });

    const reportList = {
      title: "Weekly Focus & Productivity Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalFocusMinutes: reportData.totalFocus,
        totalFocusHours: (reportData.totalFocus / 60).toFixed(1),
        completedTasksCount: reportData.totalTasks,
        mostProductiveDay: reportData.mostProductiveDay
      },
      dailyLogs: reportData.weeklyData.map(d => ({
        date: d.date,
        dayOfWeek: d.fullDayOfWeekStr,
        focusMinutes: d.focusMinutes,
        tasks: d.tasks,
        schedule: d.schedule
      }))
    };
    
    // Convert to nicely formatted JSON string
    const jsonString = JSON.stringify(reportList, null, 2);
    
    // Create and trigger download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatHours = (mins: number) => (mins / 60).toFixed(1);

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c24127]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 shadow-sm border border-slate-100 bg-white/80 backdrop-blur-xl rounded-2xl p-4 lg:px-6 lg:py-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <FileText className="text-[#c24127]" size={24} /> 周报与洞察
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium max-w-xl">
            专为 AI 总结设计。导出下方的 JSON 数据发送给你的大语言模型助手，获取深度的效率分析与下周建议。
          </p>
        </div>
        
        <button 
          onClick={handleExportWeeklyReport}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg transition-all shadow-md font-semibold text-sm whitespace-nowrap active:scale-95 group"
        >
          <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
          <span>导出为 JSON 格式</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-gradient-to-br from-[#fff1ee] to-white rounded-2xl p-5 border border-[#fcd38f]/30 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-[#c24127]/80 uppercase mb-2 flex items-center gap-1.5">
            <Clock size={14}/> 本周总时长
          </div>
          <div className="text-3xl lg:text-4xl font-black text-[#a33620] mt-auto">
            {formatHours(reportData.totalFocus)}
            <span className="text-lg text-[#c24127]/70 ml-1">小时</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200/50 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-emerald-600/80 uppercase mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14}/> 本周完成任务
          </div>
          <div className="text-3xl lg:text-4xl font-black text-emerald-700 mt-auto">
            {reportData.totalTasks}
            <span className="text-lg text-emerald-600/70 ml-1">项</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-200/50 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-indigo-600/80 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles size={14}/> 最佳专注日
          </div>
          <div className="text-2xl lg:text-3xl font-black text-indigo-700 mt-auto">
            {reportData.mostProductiveDay}
          </div>
        </div>
      </div>

      {/* Weekly Visual Timeline */}
      <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex-1 min-h-0 flex flex-col">
        <h2 className="text-base lg:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
          <Calendar className="text-slate-400" size={18} /> 本周数据预览
        </h2>
        
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 pb-4">
          {reportData.weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="w-20 shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 sm:pr-4">
                <span className="text-xs font-bold text-slate-400">{day.date.substring(5)}</span>
                <span className="text-base font-black text-slate-700">{day.dayName}</span>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="flex flex-col justify-start">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-1 sm:mt-0">总专注时长</span>
                  <div className="font-bold text-slate-700 text-base sm:text-lg">
                    {day.focusMinutes > 0 ? (
                       <span className="text-[#c24127]">{day.focusMinutes} <span className="text-xs sm:text-sm opacity-70">分钟</span></span>
                    ) : (
                      <span className="text-slate-300 font-medium">0 分钟</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col justify-start border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 overflow-hidden">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-1 sm:mt-0">任务完成度</span>
                  <div className="font-bold text-slate-700 text-base sm:text-lg flex items-baseline gap-1 mb-1.5">
                    <span className={day.tasks.filter((t: any) => t.completed).length > 0 ? "text-emerald-600" : "text-slate-300 font-medium"}>
                      {day.tasks.filter((t: any) => t.completed).length}
                    </span>
                    <span className="text-xs font-medium text-slate-400">/ {day.tasks.length} 项</span>
                  </div>
                  {day.tasks.length > 0 && (
                    <div className="text-xs text-slate-500 space-y-1.5 w-full">
                      {day.tasks.filter((t: any) => t.completed).slice(0, 3).map((t: any, idx: number) => (
                        <div key={`comp-${idx}`} className="flex items-center gap-1.5 truncate max-w-[180px] lg:max-w-xs">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{t.text}</span>
                        </div>
                      ))}
                      {day.tasks.filter((t: any) => !t.completed).slice(0, Math.max(0, 3 - day.tasks.filter((t: any) => t.completed).length)).map((t: any, idx: number) => (
                        <div key={`uncomp-${idx}`} className="flex items-center gap-1.5 truncate max-w-[180px] lg:max-w-xs opacity-60">
                          <div className="w-2.5 h-2.5 rounded-full border border-slate-400 shrink-0 mx-[1px]"></div>
                          <span className="truncate">{t.text}</span>
                        </div>
                      ))}
                      {day.tasks.length > 3 && <div className="text-[10px] text-slate-400 pl-4 mt-0.5">...共 {day.tasks.length} 项任务</div>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-start border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 overflow-hidden">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-1 sm:mt-0">日程与记录</span>
                  <div className="font-bold text-slate-700 text-base sm:text-lg mb-1.5">
                    <span className={day.schedule.length > 0 ? "text-indigo-600" : "text-slate-300 font-medium"}>
                      {day.schedule.length} <span className="text-xs sm:text-sm opacity-70">项活动</span>
                    </span>
                  </div>
                  {day.schedule.length > 0 && (
                    <div className="text-xs text-slate-500 space-y-1.5 w-full">
                      {day.schedule.slice(0, 3).map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 truncate max-w-[180px] lg:max-w-xs">
                          <span className="text-indigo-400/90 font-semibold shrink-0 tabular-nums w-[34px]">{s.startTime}</span>
                          <div className="w-1 h-1 rounded-full bg-indigo-300 shrink-0"></div>
                          <span className="truncate" title={s.title}>{s.title}</span>
                        </div>
                      ))}
                      {day.schedule.length > 3 && <div className="text-[10px] text-slate-400 pl-[46px] mt-0.5">...共 {day.schedule.length} 项记录</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
