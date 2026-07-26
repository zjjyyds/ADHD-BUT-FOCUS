import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Award, CheckCircle2, X, Lock } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import { getStoredDates, loadDailyData, getAllDailyData } from '../services/storageService';
import { TodayDotsWidget, WeekDotsWidget, FlippableTimeWidget } from '../components/TimeWidgets';
import { formatDurationText } from '../utils/timeUtils';

const TimeWheelPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
  onClose: () => void;
}> = ({ value, onChange, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 64; // Increased height for larger font
  const minutes = Array.from({length: 120}, (_, i) => i + 1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (value - 1) * itemHeight;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const index = Math.round(top / itemHeight);
    const newVal = minutes[index];
    if (newVal && newVal !== value) {
      onChange(newVal);
    }
  };

  return (
    <div 
      className="relative z-20 h-[192px] w-48 overflow-hidden flex flex-col items-center justify-center"
      style={{ 
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)', 
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' 
      }}
    >
        <div className="absolute top-1/2 left-0 w-full h-[64px] -translate-y-1/2 border-y-2 border-[#c24127]/20 bg-[#c24127]/5 pointer-events-none rounded-2xl"></div>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
          style={{ paddingTop: '64px', paddingBottom: '64px' }}
        >
          {minutes.map(m => (
            <div 
              key={m} 
              className={`h-[64px] flex items-center justify-center snap-center text-[64px] font-light tabular-nums tracking-tight transition-all cursor-pointer ${m === value ? 'text-[#c24127] font-normal' : 'text-slate-300 opacity-50 hover:opacity-100 scale-75'}`}
              onClick={() => {
                onChange(m);
                onClose();
              }}
            >
              {m.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
  );
};

export const MILESTONES = [
  { h: 1, name: "初露锋芒 (1h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 5, name: "渐入佳境 (5h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 10, name: "十时之约 (10h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 25, name: "小有所成 (25h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 50, name: "坚韧不拔 (50h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 100, name: "百炼成钢 (100h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 200, name: "心如止水 (200h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 300, name: "虚室生白 (300h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 500, name: "大道至简 (500h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 1000, name: "时光领主 (1000h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 2000, name: "破壁人 (2000h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 5000, name: "超凡入圣 (5000h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" },
  { h: 10000, name: "永恒真理 (10000h)", iconColor: "text-[#c24127]", iconBg: "bg-[#c24127]/10", barBg: "bg-[#c24127]/10", bar: "bg-[#c24127]" }
];

export default function TimerPage() {
  const { 
    handleTimerComplete, dailyData,
    globalSettings,
    taskName, setTaskName,
    category, setCategory,
    inputMinutes, setInputMinutes,
    timeLeft, setTimeLeft,
    totalTime, setTotalTime,
    isActive, setIsActive,
    mode, setMode,
    completedSessions, setCompletedSessions,
    lastFocusMinutes, setLastFocusMinutes
  } = useOutletContext<AppContextType>();
  
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const [stats, setStats] = useState({
    last5Days: [0, 0, 0, 0, 0],
    todayFormatted: '0m',
    trend: 0,
    nextMilestone: MILESTONES[0],
    progressToMilestone: 0,
    totalHours: 0
  });

  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0;

  const todayLearnMins = dailyData.schedule?.filter(s => s.category === 'learn').reduce((acc, curr) => {
    // Parse start and end time to calculate duration
    const [h1, m1] = curr.startTime.split(':').map(Number);
    const [h2, m2] = curr.endTime.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // handle cross midnight
    return acc + diff;
  }, 0) || 0;

  const todayWorkMins = dailyData.schedule?.filter(s => s.category === 'work').reduce((acc, curr) => {
    const [h1, m1] = curr.startTime.split(':').map(Number);
    const [h2, m2] = curr.endTime.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    return acc + diff;
  }, 0) || 0;

  const midnight = new Date(currentTime);
  midnight.setHours(23, 59, 59, 999);
  const minutesUntilMidnight = Math.floor((midnight.getTime() - currentTime.getTime()) / 60000);
  
  const learningGoalMins = 8 * 60;
  const remainingLearningMins = Math.max(0, learningGoalMins - todayLearnMins);
  const diffMins = minutesUntilMidnight - remainingLearningMins;



  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const allData = await getAllDailyData();
      const dataMap = new Map(allData.map(d => [d.date, d]));
      
      const today = new Date();
      const last5 = [];
      for(let i=4; i>=0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - (offset * 60 * 1000));
        const dateStr = local.toISOString().split('T')[0];
        const data = dataMap.get(dateStr);
        last5.push(data?.focusMinutes || 0);
      }

      // Calculate week hours
      let weekMins = 0;
      for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - (offset * 60 * 1000));
        const dateStr = local.toISOString().split('T')[0];
        const data = dataMap.get(dateStr);
        weekMins += (data?.focusMinutes || 0);
      }

      const todayMins = last5[4];
      const yesterdayMins = last5[3];
      
      let todayFormatted = '';
      if (todayMins < 60) {
        todayFormatted = `${todayMins}m`;
      } else {
        todayFormatted = `${(todayMins / 60).toFixed(1)}h`;
      }

      let trend = 0;
      if (yesterdayMins > 0) {
        trend = Math.round(((todayMins - yesterdayMins) / yesterdayMins) * 100);
      } else if (todayMins > 0) {
        trend = 100;
      }

      let totalMins = 0;
      for (const data of allData) {
        totalMins += data.focusMinutes || 0;
      }
      const totalHrs = totalMins / 60;

      const nextMIndex = MILESTONES.findIndex(m => m.h > totalHrs);
      const nextMilestone = nextMIndex !== -1 ? MILESTONES[nextMIndex] : MILESTONES[MILESTONES.length - 1];
      const prevM = nextMIndex > 0 ? MILESTONES[nextMIndex - 1].h : 0;
      
      let progressPct = 0;
      if (nextMilestone.h > prevM) {
        progressPct = ((totalHrs - prevM) / (nextMilestone.h - prevM)) * 100;
      } else {
        progressPct = 100;
      }

      if (isMounted) {
        setStats({
          last5Days: last5,
          todayFormatted,
          trend,
          nextMilestone,
          progressToMilestone: Math.min(100, Math.max(0, progressPct)),
          totalHours: totalHrs
        });
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [dailyData.focusMinutes]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsEditingTime(false);
    setTimeLeft(inputMinutes * 60);
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'focus') {
      const spentMinutes = Math.floor((totalTime - timeLeft) / 60);
      if (spentMinutes > 0) {
        handleTimerComplete(taskName, spentMinutes, category);
      }
      setCompletedSessions(s => s + 1);
      setMode('break');
      setInputMinutes(5);
      setTimeLeft(5 * 60);
      setTotalTime(5 * 60);
    } else {
      setMode('focus');
      setInputMinutes(lastFocusMinutes);
      setTimeLeft(lastFocusMinutes * 60);
      setTotalTime(lastFocusMinutes * 60);
    }
  };

  const resetSessions = () => setCompletedSessions(0);

  const handleTimeClick = () => {
    if (!isActive) {
      setIsEditingTime(true);
    }
  };

  const handleWheelChange = (mins: number) => {
    setInputMinutes(mins);
    setTimeLeft(mins * 60);
    setTotalTime(mins * 60);
    if (mode === 'focus') {
      setLastFocusMinutes(mins);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 h-full flex relative overflow-hidden bg-[#fdfbf9]">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-orange-50/40"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-red-50/40"></div>
      </div>

      {/* Left Sidebar Widgets (Time Context) */}
      <div className="w-[340px] p-6 flex flex-col relative z-10 overflow-y-auto no-scrollbar border-r border-slate-100/50 bg-white/30">
        <div className="flex flex-col gap-8 my-auto">
          <FlippableTimeWidget currentTime={currentTime} eventName={globalSettings.countdownEvent} targetDate={globalSettings.countdownDate} />
          <TodayDotsWidget currentTime={currentTime} />
          <WeekDotsWidget currentTime={currentTime} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        
        {/* Header Texts */}
        <div className="text-center mb-12">
          {globalSettings.learningGoal && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[#c24127]/5 border border-[#c24127]/10 rounded-2xl text-[#c24127] text-sm font-medium">
              <Award size={16} className="shrink-0" />
              <span>目标：{globalSettings.learningGoal}</span>
            </div>
          )}
          <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">
            {mode === 'focus' ? '当前专注' : '休息一下'}
          </div>
          <input 
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="text-xl sm:text-2xl font-medium text-slate-700 bg-white border-2 border-slate-100 hover:border-slate-200 focus:border-[#c24127]/50 focus:ring-4 focus:ring-[#c24127]/10 outline-none text-center w-full max-w-md py-3 px-6 rounded-2xl transition-all shadow-sm leading-normal"
            placeholder="你正在专注什么？"
          />
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setCategory('learn')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors border ${category === 'learn' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50'}`}
            >
              学习
            </button>
            <button
              onClick={() => setCategory('work')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors border ${category === 'work' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50'}`}
            >
              工作
            </button>
            <button
              onClick={() => setCategory('other')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors border ${category === 'other' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50'}`}
            >
              其他
            </button>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="relative w-[340px] h-[340px] flex items-center justify-center mb-16">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 400 400">
            {/* Outer Track */}
            <circle cx="200" cy="200" r="180" fill="none" stroke="#f0f0f0" strokeWidth="6" />
            {/* Inner Dashed Track (Analog feel) */}
            <circle cx="200" cy="200" r="160" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 8" />
            {/* Progress */}
            <circle 
              cx="200" cy="200" r="180" fill="none" 
              stroke={mode === 'focus' ? "#c24127" : "#10b981"} 
              strokeWidth="10" strokeLinecap="round" 
              strokeDasharray={2 * Math.PI * 180} 
              strokeDashoffset={2 * Math.PI * 180 * (1 - progress)} 
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center">
            {isEditingTime ? (
              <div className="flex flex-col items-center mb-6 relative z-20">
                <div className="fixed inset-0 z-10" onClick={() => setIsEditingTime(false)} />
                <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 flex flex-col items-center gap-4 relative z-20">
                  <TimeWheelPicker 
                    value={inputMinutes} 
                    onChange={handleWheelChange} 
                    onClose={() => setIsEditingTime(false)} 
                  />
                  {globalSettings.presetTimes && globalSettings.presetTimes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center max-w-[200px]">
                      {globalSettings.presetTimes.map(pt => (
                        <button
                          key={pt}
                          onClick={() => {
                            setInputMinutes(pt);
                            setTimeLeft(pt * 60);
                            setTotalTime(pt * 60);
                            setIsEditingTime(false);
                          }}
                          className={`w-[52px] h-10 rounded-xl text-sm font-semibold transition-all ${inputMinutes === pt ? 'bg-[#c24127] text-white shadow-md shadow-[#c24127]/20' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:scale-105'}`}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsEditingTime(false)} 
                    className="w-full py-2.5 mt-2 bg-[#c24127]/10 text-[#c24127] rounded-xl text-sm font-bold tracking-widest hover:bg-[#c24127]/20 transition-colors uppercase"
                  >
                    确定
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div 
                  className={`text-[80px] font-mono font-semibold text-slate-800 tabular-nums tracking-tighter leading-none mb-6 relative z-10 ${!isActive ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                  onClick={handleTimeClick}
                >
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}
            {/* Session Dots */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">专注轮次</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i < (completedSessions % 4) ? 'bg-[#c24127] shadow-[0_0_6px_rgba(194,65,39,0.4)]' : 'bg-slate-200'}`}
                  ></div>
                ))}
              </div>
              <button onClick={resetSessions} className="ml-1 text-slate-400 hover:text-[#c24127] transition-colors" title="Reset Sessions">
                <RotateCcw size={12} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button onClick={resetTimer} className="text-slate-400 hover:text-slate-600 transition-colors" title="Reset Timer">
            <RotateCcw size={24} strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={toggleTimer} 
            className={`flex items-center gap-2 px-8 py-4 ${mode === 'focus' ? 'bg-[#c24127] hover:bg-[#a83822] shadow-[0_8px_20px_rgba(194,65,39,0.3)] hover:shadow-[0_10px_25px_rgba(194,65,39,0.4)]' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)]'} text-white rounded-full font-medium transition-all active:scale-95`}
          >
            {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span>{isActive ? '暂停' : (mode === 'focus' ? '开始专注' : '开始休息')}</span>
          </button>

          <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600 transition-colors" title="Skip to next phase">
            <SkipForward size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Right Sidebar Widgets */}
      <div className="w-[320px] p-8 flex flex-col relative z-10 overflow-y-auto no-scrollbar border-l border-slate-100/50 bg-white/30">
        <div className="flex flex-col gap-6 my-auto">
          {/* Today's Streak */}
        <div className="bg-white/80  rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/50 shrink-0">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-6">
            今日专注趋势
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-24 mb-6">
            {stats.last5Days.map((mins, idx) => {
              const maxMins = Math.max(...stats.last5Days, 60); // min scale is 60 mins
              const heightPct = Math.max(10, (mins / maxMins) * 100);
              const isToday = idx === 4;
              return (
                <div 
                  key={idx}
                  className={`flex-1 rounded-t-lg  ${isToday ? 'bg-[#c24127] shadow-[0_4px_15px_rgba(194,65,39,0.3)]' : 'bg-[#eecdc6]'}`}
                  style={{ height: `${heightPct}%` }}
                ></div>
              );
            })}
          </div>

          <div className="flex items-end justify-between">
            <div className="text-3xl font-medium text-slate-800">{stats.todayFormatted}</div>
            <div className={`text-sm font-medium mb-1 ${stats.trend >= 0 ? 'text-[#c24127]' : 'text-slate-400'}`}>
              {stats.trend > 0 ? '+' : ''}{stats.trend}%
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        <div 
          className="bg-white/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/50 flex items-center gap-4 relative overflow-hidden shrink-0 cursor-pointer hover:bg-white transition-colors group"
          onClick={() => setIsMilestoneModalOpen(true)}
        >
          <div className={`absolute bottom-0 left-0 h-1.5 w-full ${stats.nextMilestone.barBg}`}>
            <div className={`h-full rounded-r-full transition-all duration-1000 ${stats.nextMilestone.bar}`} style={{ width: `${stats.progressToMilestone}%` }}></div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stats.nextMilestone.iconBg} ${stats.nextMilestone.iconColor}`}>
            <Award size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              下一个里程碑
            </div>
            <div className={`font-bold ${stats.nextMilestone.color}`}>
              {stats.nextMilestone.name}
            </div>
          </div>
        </div>

        {/* Learning Goal Widget */}
        <div className="bg-white/80  rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/50 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              今日学习目标
            </div>
            <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
              8h
            </div>
          </div>
          
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-2xl font-medium text-slate-800">
                {formatDurationText(todayLearnMins)}
              </div>
              <div className="text-xs text-slate-400 mt-1">已学习</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-slate-600">
                {formatDurationText(todayWorkMins)}
              </div>
              <div className="text-xs text-slate-400 mt-1">工作</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4 flex">
            <div 
              className="h-full bg-indigo-500 " 
              style={{ width: `${Math.min(100, (todayLearnMins / (8 * 60)) * 100)}%` }}
            ></div>
          </div>
          
          {/* Ratio Bar */}
          {todayLearnMins + todayWorkMins > 0 ? (
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex justify-between">
                <span>学习 {(todayLearnMins / (todayLearnMins + todayWorkMins) * 100).toFixed(0)}%</span>
                <span>工作 {(todayWorkMins / (todayLearnMins + todayWorkMins) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-indigo-400 " 
                  style={{ width: `${(todayLearnMins / (todayLearnMins + todayWorkMins)) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-emerald-400 " 
                  style={{ width: `${(todayWorkMins / (todayLearnMins + todayWorkMins)) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase text-center mt-2">
              暂无学习或工作记录
            </div>
          )}

          {/* Goal Analysis */}
          <div className="mt-5 pt-4 border-t border-slate-100/50">
            {remainingLearningMins === 0 ? (
              <div className="text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} /> 今日学习目标已达成！
              </div>
            ) : diffMins >= 0 ? (
              <div className="text-xs text-slate-500 leading-relaxed">
                距0点还有 <span className="font-medium text-slate-700">{formatDurationText(minutesUntilMidnight)}</span>，
                需学习 <span className="font-medium text-indigo-600">{formatDurationText(remainingLearningMins)}</span>。<br/>
                宽裕 <span className="font-medium text-emerald-600">{formatDurationText(diffMins)}</span>，时间充足。
              </div>
            ) : (
              <div className="text-xs text-slate-500 leading-relaxed">
                距0点还有 <span className="font-medium text-slate-700">{formatDurationText(minutesUntilMidnight)}</span>，
                需学习 <span className="font-medium text-indigo-600">{formatDurationText(remainingLearningMins)}</span>。<br/>
                缺口 <span className="font-medium text-[#c24127]">{formatDurationText(-diffMins)}</span>，需抓紧时间。
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMilestoneModalOpen(false)} />
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col relative z-10 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-800">成就记录</h3>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-slate-50/50">
              <div className="text-center mb-4">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">累计专注时间</div>
                <div className="text-4xl font-bold text-slate-800 tabular-nums">
                  {stats.totalHours.toFixed(1)} <span className="text-xl text-slate-400 font-medium">小时</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {MILESTONES.map((m, i) => {
                  const isAchieved = stats.totalHours >= m.h;
                  const isNext = !isAchieved && (i === 0 || stats.totalHours >= MILESTONES[i-1].h);
                  const progress = isAchieved ? 100 : (i === 0 ? (stats.totalHours / m.h) * 100 : (isNext ? ((stats.totalHours - MILESTONES[i-1].h) / (m.h - MILESTONES[i-1].h)) * 100 : 0));
                  
                  return (
                    <div key={m.h} className={`p-4 rounded-2xl border ${isAchieved ? 'bg-white border-white shadow-sm' : isNext ? 'bg-white border-indigo-100 shadow-md shadow-indigo-500/5' : 'bg-slate-50 border-transparent opacity-60'} transition-all relative overflow-hidden`}>
                      {isNext && (
                        <div className={`absolute bottom-0 left-0 h-1.5 w-full ${m.barBg}`}>
                          <div className={`h-full rounded-r-full transition-all duration-1000 ${m.bar}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isAchieved ? m.iconBg : isNext ? m.iconBg : 'bg-slate-200'} ${isAchieved ? m.iconColor : isNext ? m.iconColor : 'text-slate-400'}`}>
                          {isAchieved ? <Award size={24} strokeWidth={2} /> : isNext ? <Award size={24} strokeWidth={2} /> : <Lock size={20} strokeWidth={2} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className={`font-bold text-sm ${isAchieved || isNext ? m.iconColor : 'text-slate-600'}`}>{m.name}</div>
                            {isAchieved && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </div>
                          <div className="text-xs font-semibold text-slate-400">
                            {isAchieved ? `已达成` : `需达到 ${m.h} 小时`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
