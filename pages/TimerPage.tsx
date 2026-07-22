import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Award, CheckCircle2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import { getStoredDates, loadDailyData, getAllDailyData } from '../services/storageService';
import { TodayDotsWidget, WeekDotsWidget, TimePerceptionWidget } from '../components/TimeWidgets';
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
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
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
    </>
  );
};

export default function TimerPage() {
  const { 
    handleTimerComplete, dailyData,
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
    nextMilestone: '10h Club',
    progressToMilestone: 0
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

      const milestones = [1, 5, 10, 50, 100, 500, 1000];
      let nextM = milestones.find(m => m > totalHrs) || milestones[milestones.length - 1];
      let prevM = milestones.slice().reverse().find(m => m <= totalHrs) || 0;
      
      let progressPct = 0;
      if (nextM > prevM) {
        progressPct = ((totalHrs - prevM) / (nextM - prevM)) * 100;
      } else {
        progressPct = 100;
      }

      if (isMounted) {
        setStats({
          last5Days: last5,
          todayFormatted,
          trend,
          nextMilestone: `${nextM}h Club`,
          progressToMilestone: Math.min(100, Math.max(0, progressPct))
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
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-orange-50/40 blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-red-50/40 blur-3xl"></div>
      </div>

      {/* Left Sidebar Widgets (Time Context) */}
      <div className="w-[340px] p-6 flex flex-col relative z-10 overflow-y-auto no-scrollbar border-r border-slate-100/50 bg-white/30 backdrop-blur-sm">
        <div className="flex flex-col gap-8 my-auto">
          <TimePerceptionWidget currentTime={currentTime} />
          <TodayDotsWidget currentTime={currentTime} />
          <WeekDotsWidget currentTime={currentTime} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        
        {/* Header Texts */}
        <div className="text-center mb-12">
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
              className="transition-all duration-1000 linear" 
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center">
            {isEditingTime ? (
              <div className="mb-4">
                <TimeWheelPicker 
                  value={inputMinutes} 
                  onChange={handleWheelChange} 
                  onClose={() => setIsEditingTime(false)} 
                />
              </div>
            ) : (
              <div 
                className={`text-[80px] font-mono font-semibold text-slate-800 tabular-nums tracking-tighter leading-none mb-6 relative z-10 ${!isActive ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                onClick={handleTimeClick}
              >
                {formatTime(timeLeft)}
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
      <div className="w-[320px] p-8 flex flex-col relative z-10 overflow-y-auto no-scrollbar border-l border-slate-100/50 bg-white/30 backdrop-blur-sm">
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
                  className={`flex-1 rounded-t-lg transition-all duration-1000 ${isToday ? 'bg-[#c24127] shadow-[0_4px_15px_rgba(194,65,39,0.3)]' : 'bg-[#eecdc6]'}`}
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
        <div className="bg-white/80  rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/50 flex items-center gap-4 relative overflow-hidden shrink-0">
          <div className="absolute bottom-0 left-0 h-1.5 bg-[#c24127]/10 w-full">
            <div className="h-full bg-[#c24127] transition-all duration-1000 rounded-r-full" style={{ width: `${stats.progressToMilestone}%` }}></div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fcd38f] flex items-center justify-center text-[#c24127] shrink-0">
            <Award size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              下一个里程碑
            </div>
            <div className="font-medium text-slate-800">
              {stats.nextMilestone}
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
              className="h-full bg-indigo-500 transition-all duration-1000" 
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
                  className="h-full bg-indigo-400 transition-all duration-1000" 
                  style={{ width: `${(todayLearnMins / (todayLearnMins + todayWorkMins)) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000" 
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
    </div>
  );
}
