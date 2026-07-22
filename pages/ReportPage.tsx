import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import { getStoredDates, loadDailyData, createEmptyDailyData, getAllDailyData } from '../services/storageService';
import { Download, FileText, CheckCircle2, Clock, Calendar, Sparkles, Trophy, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { formatDurationText } from '../utils/timeUtils';

export default function ReportPage() {
  const { currentDate } = useOutletContext<AppContextType>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [copiedWeekly, setCopiedWeekly] = useState(false);
  const [copiedDaily, setCopiedDaily] = useState<string | null>(null);
  
  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  const isToday = currentDate === todayStr;

  const [reportData, setReportData] = useState<{
    totalFocus: number;
    totalTasks: number;
    mostProductiveDay: string;
    averageScore: number;
    weeklyData: any[];
    weekStartDate: string;
    weekEndDate: string;
  } | null>(null);

  const calculateDailyScore = (focusMinutes: number, tasks: any[]) => {
    if (focusMinutes === 0 && tasks.length === 0) {
      return { score: 0, grade: '-', color: 'text-slate-400', bg: 'bg-slate-100', label: '未记录' };
    }

    // Every 120 mins of focus gives 60 points max
    let focusScore = Math.min(60, (focusMinutes / 120) * 60);
    
    // Tasks give 40 points max based on completion rate
    let taskScore = 0;
    if (tasks.length > 0) {
      const completed = tasks.filter(t => t.completed).length;
      taskScore = (completed / tasks.length) * 40;
    } else {
      // If there are no tasks, focus counts towards the full 100 points
      focusScore = Math.min(100, (focusMinutes / 120) * 100);
    }

    const totalScore = Math.round(focusScore + taskScore);

    if (totalScore >= 90) return { score: totalScore, grade: 'S', color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200', label: '极佳' };
    if (totalScore >= 75) return { score: totalScore, grade: 'A', color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200', label: '优秀' };
    if (totalScore >= 60) return { score: totalScore, grade: 'B', color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', label: '良好' };
    if (totalScore > 0) return { score: totalScore, grade: 'C', color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200', label: '及格' };
    
    return { score: 0, grade: '-', color: 'text-slate-400', bg: 'bg-slate-100 border-slate-200', label: '未达标' };
  };

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
      let bestDay = '暂无';
      let totalScoreSum = 0;
      let daysWithRecords = 0;
      
      let weekStartStr = '';
      let weekEndStr = '';

      for (let i = 6; i >= 0; i--) {
        const [y, m, day] = currentDate.split('-').map(Number);
        const d = new Date(y, m - 1, day);
        d.setDate(d.getDate() - (i + weekOffset * 7));
        
        // Correctly format to YYYY-MM-DD in local time
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);
        const dStr = localISOTime.split('T')[0];
        if (i === 6) weekStartStr = dStr;
        if (i === 0) weekEndStr = dStr;
        
        const dayOfWeekStr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
        const fullDayOfWeekStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
        const data = dataMap.get(dStr) || createEmptyDailyData(dStr);
        
        const dayFocus = data.focusMinutes || 0;
        const dayTasks = data.todos || [];
        const scoreInfo = calculateDailyScore(dayFocus, dayTasks);

        weeklyData.push({
          date: dStr,
          dayName: dayOfWeekStr,
          fullDayOfWeekStr,
          focusMinutes: dayFocus,
          tasks: dayTasks.map(t => ({ text: t.text, completed: t.completed })),
          schedule: data.schedule?.map(s => ({ title: s.title, startTime: s.startTime, endTime: s.endTime, type: s.type })) || [],
          scoreInfo
        });
        
        tFocus += dayFocus;
        tTasks += dayTasks.filter(t => t.completed).length;
        
        if (dayFocus > maxFocus) {
          maxFocus = dayFocus;
          if (dayFocus > 0) bestDay = dayOfWeekStr;
        }

        if (scoreInfo.score > 0) {
          totalScoreSum += scoreInfo.score;
          daysWithRecords++;
        }
      }

      const averageScore = daysWithRecords > 0 ? Math.round(totalScoreSum / daysWithRecords) : 0;

      if (isMounted) {
        setReportData({
          totalFocus: tFocus,
          totalTasks: tTasks,
          mostProductiveDay: bestDay,
          averageScore,
          weeklyData,
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr
        });
        setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [user, weekOffset, currentDate]);

  const generateWeeklyMarkdown = () => {
    if (!reportData) return '';
    let md = `# Weekly Focus & Productivity Report\n\n`;
    md += `*Period: ${reportData.weekStartDate} to ${reportData.weekEndDate}*\n`;
    md += `*Generated At: ${new Date().toLocaleString()}*\n\n`;
    md += `## 📊 Summary\n`;
    md += `- **Total Focus Time**: ${formatDurationText(reportData.totalFocus)}\n`;
    md += `- **Completed Tasks**: ${reportData.totalTasks} items\n`;
    md += `- **Most Productive Day**: ${reportData.mostProductiveDay}\n`;
    md += `- **Average Score**: ${reportData.averageScore} / 100\n\n`;
    md += `## 📅 Daily Logs\n\n`;
    reportData.weeklyData.forEach(day => {
      md += `### ${day.date} (${day.dayName})\n`;
      md += `- **Score**: ${day.scoreInfo.score > 0 ? `${day.scoreInfo.grade} (${day.scoreInfo.score} pts)` : 'No Record'}\n`;
      md += `- **Focus Time**: ${day.focusMinutes} minutes\n`;
      if (day.tasks && day.tasks.length > 0) {
        md += `- **Tasks**:\n`;
        day.tasks.forEach((t: any) => {
          md += `  - [${t.completed ? 'x' : ' '}] ${t.text}\n`;
        });
      }
      if (day.schedule && day.schedule.length > 0) {
        md += `- **Schedule / Records**:\n`;
        day.schedule.forEach((s: any) => {
          md += `  - \`${s.startTime || '???'}${s.endTime ? ` - ${s.endTime}` : ''}\`: ${s.title}\n`;
        });
      }
      md += `\n`;
    });
    return md;
  };

  const generateDailyMarkdown = (day: any) => {
    let md = `# Daily Focus & Productivity Report\n\n`;
    md += `*Date: ${day.date} (${day.dayName})*\n`;
    md += `*Generated At: ${new Date().toLocaleString()}*\n\n`;
    md += `## 📊 Summary\n`;
    md += `- **Score**: ${day.scoreInfo.score > 0 ? `${day.scoreInfo.grade} (${day.scoreInfo.score} pts)` : 'No Record'}\n`;
    md += `- **Focus Time**: ${day.focusMinutes} minutes\n`;
    md += `- **Completed Tasks**: ${day.tasks.filter((t: any) => t.completed).length} / ${day.tasks.length}\n\n`;
    if (day.tasks && day.tasks.length > 0) {
      md += `## ✅ Tasks\n`;
      day.tasks.forEach((t: any) => {
        md += `- [${t.completed ? 'x' : ' '}] ${t.text}\n`;
      });
      md += `\n`;
    }
    if (day.schedule && day.schedule.length > 0) {
      md += `## ⏱️ Schedule / Records\n`;
      day.schedule.forEach((s: any) => {
        md += `- \`${s.startTime || '???'}${s.endTime ? ` - ${s.endTime}` : ''}\`: ${s.title}\n`;
      });
      md += `\n`;
    }
    return md;
  };

  const handleExportWeeklyReport = () => {
    const md = generateWeeklyMarkdown();
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${reportData?.weekStartDate}-to-${reportData?.weekEndDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyWeeklyReport = () => {
    const md = generateWeeklyMarkdown();
    if (!md) return;
    navigator.clipboard.writeText(md).then(() => {
      setCopiedWeekly(true);
      setTimeout(() => setCopiedWeekly(false), 2000);
    });
  };

  const handleExportDailyReport = (day: any) => {
    const md = generateDailyMarkdown(day);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${day.date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyDailyReport = (day: any) => {
    const md = generateDailyMarkdown(day);
    navigator.clipboard.writeText(md).then(() => {
      setCopiedDaily(day.date);
      setTimeout(() => setCopiedDaily(null), 2000);
    });
  };

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 shadow-sm border border-slate-100 bg-white/80  rounded-2xl p-4 lg:px-6 lg:py-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <FileText className="text-[#c24127]" size={24} /> 周报与洞察
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium max-w-xl">
            专为 AI 总结设计。导出 Markdown 文本发送给你的大语言模型助手，获取深度的效率分析。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex justify-between items-center bg-slate-100 rounded-xl p-1 shrink-0">
            <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <div className="px-3 text-sm font-bold text-slate-700 min-w-[100px] text-center whitespace-nowrap">
              {isToday 
                ? (weekOffset === 0 ? '本周' : weekOffset === 1 ? '上一周' : `${weekOffset} 周前`) 
                : (reportData ? `${reportData.weekStartDate.slice(5).replace('-', '/')} - ${reportData.weekEndDate.slice(5).replace('-', '/')}` : '...')
              }
            </div>
            <button onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))} disabled={weekOffset === 0} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleCopyWeeklyReport}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all font-semibold text-sm whitespace-nowrap active:scale-95"
            >
              {copiedWeekly ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
              <span>{copiedWeekly ? '已复制' : '复制此页'}</span>
            </button>
            <button 
              onClick={handleExportWeeklyReport}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg transition-all shadow-md font-semibold text-sm whitespace-nowrap active:scale-95 group"
            >
              <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
              <span>导出 Markdown 周报</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-gradient-to-br from-[#fff1ee] to-white rounded-2xl p-5 border border-[#fcd38f]/30 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-[#c24127]/80 uppercase mb-2 flex items-center gap-1.5">
            <Clock size={14}/> {(isToday && weekOffset === 0) ? '本周总时长' : '周期总时长'}
          </div>
          <div className="text-2xl font-black text-[#a33620] mt-auto">
            {formatDurationText(reportData.totalFocus)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200/50 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-emerald-600/80 uppercase mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14}/> {(isToday && weekOffset === 0) ? '本周完成任务' : '周期完成任务'}
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-auto">
            {reportData.totalTasks}
            <span className="text-lg text-emerald-600/70 ml-1">项</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-200/50 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-indigo-600/80 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles size={14}/> 最佳专注日
          </div>
          <div className="text-2xl lg:text-3xl font-black text-indigo-700 mt-auto truncate w-full">
            {reportData.mostProductiveDay}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-200/50 flex flex-col items-start shadow-sm">
          <div className="text-xs font-bold tracking-wider text-amber-600/80 uppercase mb-2 flex items-center gap-1.5">
            <Trophy size={14}/> {(isToday && weekOffset === 0) ? '本周平均分' : '周期平均分'}
          </div>
          <div className="text-3xl font-black text-amber-700 mt-auto">
            {reportData.averageScore}
            <span className="text-lg text-amber-600/70 ml-1">分</span>
          </div>
        </div>
      </div>

      {/* Weekly Visual Timeline */}
      <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-slate-400" size={18} /> {(isToday && weekOffset === 0) ? '本周数据预览' : '周期数据预览'}
          </h2>
          <span className="text-xs font-medium text-slate-400">{reportData.weekStartDate} ~ {reportData.weekEndDate}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 pb-4">
          {reportData.weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors group relative">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all z-10">
                <button 
                  onClick={() => handleCopyDailyReport(day)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-[#c24127] hover:bg-[#c24127]/10 rounded-lg bg-white shadow-sm sm:bg-transparent sm:shadow-none border border-slate-100 sm:border-transparent transition-all"
                  title="复制今日数据"
                >
                  {copiedDaily === day.date ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                <button 
                  onClick={() => handleExportDailyReport(day)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-[#c24127] hover:bg-[#c24127]/10 rounded-lg bg-white shadow-sm sm:bg-transparent sm:shadow-none border border-slate-100 sm:border-transparent transition-all"
                  title="导出今日数据"
                >
                  <Download size={16} />
                </button>
              </div>

              <div className="w-24 shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 sm:pr-4">
                <span className="text-xs font-bold text-slate-400 mb-0.5">{day.date.substring(5)}</span>
                <span className="text-base font-black text-slate-700 mb-1">{day.dayName}</span>
                <div className={`mt-auto w-fit px-2 py-0.5 rounded-full border text-[10px] font-bold ${day.scoreInfo.bg} ${day.scoreInfo.color}`}>
                  {day.scoreInfo.score > 0 ? `${day.scoreInfo.grade}级 · ${day.scoreInfo.score}分` : day.scoreInfo.label}
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-1 sm:pt-0">
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

                <div className="flex flex-col justify-start border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 overflow-hidden pr-8 sm:pr-0">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-1 sm:mt-0">日程与记录</span>
                  <div className="font-bold text-slate-700 text-base sm:text-lg mb-1.5">
                    <span className={day.schedule.length > 0 ? "text-indigo-600" : "text-slate-300 font-medium"}>
                      {day.schedule.length} <span className="text-xs sm:text-sm opacity-70">项活动</span>
                    </span>
                  </div>
                  {day.schedule.length > 0 && (
                    <div className="text-xs text-slate-500 space-y-1.5 w-full">
                      {day.schedule.slice(0, 3).map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 truncate max-w-[150px] lg:max-w-xs">
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
