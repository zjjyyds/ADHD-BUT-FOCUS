import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../components/Layout';
import CalendarView from '../components/CalendarView';
import { getStoredDates, loadDailyData, createEmptyDailyData, getAllDailyData } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, Flame, Award, Calendar as CalendarIcon } from 'lucide-react';
import { DailyData } from '../types';
import { useAuth } from '../components/AuthProvider';
import { formatDurationText } from '../utils/timeUtils';

export default function StatsPage() {
  const { currentDate, setCurrentDate } = useOutletContext<AppContextType>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DailyData>(createEmptyDailyData(currentDate));
  const [totalFocus, setTotalFocus] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setLoading(true);
      
      const allData = await getAllDailyData();
      if (!isMounted) return;

      const dataMap = new Map(allData.map(d => [d.date, d]));
      
      const dates = allData
        .filter(d => (d.focusMinutes || 0) > 0 || (d.schedule && d.schedule.length > 0) || (d.todos && d.todos.length > 0))
        .map(d => d.date)
        .sort();
        
      setAllDates(dates);

      // Calculate streak
      let currentStreak = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      let checkDate = new Date();
      
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        const data = dataMap.get(dStr) || createEmptyDailyData(dStr);
        if ((data.focusMinutes || 0) > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (dStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Chart data (last 7 days ending on currentDate)
      const newChartData = [];
      for (let i = 6; i >= 0; i--) {
        const [y, m, day] = currentDate.split('-').map(Number);
        const d = new Date(y, m - 1, day);
        d.setDate(d.getDate() - i);
        
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);
        const dStr = localISOTime.split('T')[0];

        const data = dataMap.get(dStr) || createEmptyDailyData(dStr);
        newChartData.push({
          date: dStr,
          dayName: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
          minutes: data.focusMinutes || 0
        });
      }

      // Aggregate totals
      let tFocus = 0;
      let tTasks = 0;
      for (const data of allData) {
        tFocus += data.focusMinutes || 0;
        tTasks += (data.todos || []).filter(t => t.completed).length;
      }

      if (isMounted) {
        setStreak(currentStreak);
        setChartData(newChartData);
        setTotalFocus(tFocus);
        setTotalTasks(tTasks);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, [user, currentDate]);

  useEffect(() => {
    let isMounted = true;
    const fetchSelectedDay = async () => {
      const data = await loadDailyData(currentDate);
      if (isMounted) {
        setSelectedDayData(data);
        setLoading(false);
      }
    };
    fetchSelectedDay();
    return () => { isMounted = false; };
  }, [currentDate, user]);

  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  const isToday = currentDate === todayStr;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c24127]"></div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-5 h-full flex flex-col gap-2 lg:gap-3 overflow-y-auto no-scrollbar">
      {/* Header & Mini Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-2 shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800 mb-0.5">数据统计与历史</h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium">追踪你的生产力与坚持</p>
        </div>
        
        {/* Mini Stats in Top Right */}
        <div className="flex gap-2 items-end">
          <div className="bg-gradient-to-br from-[#fff1ee] to-[#ffe4de] rounded-xl p-1.5 px-3 shadow-sm border border-[#fcd38f]/30 flex flex-col items-center justify-center min-w-[65px] h-[52px] lg:h-[56px] transform hover:scale-105 transition-transform">
            <div className="text-[9px] font-bold tracking-wider text-[#c24127] uppercase mb-0.5 flex items-center gap-1"><Clock size={10}/> 总计</div>
            <div className="text-sm lg:text-base font-black text-[#a33620]">{formatDurationText(totalFocus)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-1.5 px-3 shadow-sm border border-emerald-200/50 flex flex-col items-center justify-center min-w-[65px] h-[52px] lg:h-[56px] transform hover:scale-105 transition-transform">
            <div className="text-[9px] font-bold tracking-wider text-emerald-600 uppercase mb-0.5 flex items-center gap-1"><CheckCircle2 size={10}/> 任务</div>
            <div className="text-sm lg:text-base font-black text-emerald-700">{totalTasks}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-1.5 px-3 shadow-sm border border-orange-200/50 flex flex-col items-center justify-center min-w-[65px] h-[52px] lg:h-[56px] transform hover:scale-105 transition-transform">
            <div className="text-[9px] font-bold tracking-wider text-orange-600 uppercase mb-0.5 flex items-center gap-1"><Flame size={10}/> 连续</div>
            <div className="text-sm lg:text-base font-black text-orange-700">{streak}<span className="text-[9px] text-orange-600/70 ml-0.5">天</span></div>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart & Calendar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3 min-h-0">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-3 lg:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white flex flex-col h-full overflow-hidden">
          <h2 className="text-base lg:text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5 shrink-0">
            <Award className="text-[#c24127]" size={16} /> {isToday ? '专注趋势 (最近7天)' : '专注趋势 (所选7天)'}
          </h2>
          <div className="flex-1 w-full min-h-0 relative mt-1 [&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 5, right: 5, left: -25, bottom: 15 }} 
                  onClick={(state) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      setCurrentDate(state.activePayload[0].payload.date);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c24127" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#eecdc6" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f1f5f9" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#e2e8f0" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="dayName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} 
                    dy={5}
                    onClick={(data) => {
                      // Find the corresponding date from chartData based on the dayName
                      const clickedData = chartData.find(d => d.dayName === data.value);
                      if (clickedData && clickedData.date) {
                        setCurrentDate(clickedData.date);
                      }
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold', outline: 'none', fontSize: '12px', padding: '8px' }}
                    formatter={(value: number) => [`${value} 分钟`, '专注时长']}
                  />
                  <Bar 
                    dataKey="minutes" 
                    radius={[4, 4, 4, 4]} 
                    maxBarSize={30}
                    cursor="pointer"
                    onClick={(data) => {
                      if (data && data.date) {
                        setCurrentDate(data.date);
                      } else if (data && data.payload && data.payload.date) {
                        setCurrentDate(data.payload.date);
                      }
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.date === currentDate ? 'url(#colorFocus)' : 'url(#colorInactive)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex flex-col min-h-0">
          <CalendarView 
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
          />
        </div>
      </div>

      {/* Bottom Row: Daily Details */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-3 lg:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white shrink-0">
        <h2 className="text-lg lg:text-xl font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <CalendarIcon className="text-[#c24127]" size={18} /> 
          {currentDate} 详情
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-3">
          <div className="bg-gradient-to-br from-[#fff1ee]/60 to-white rounded-xl p-2.5 lg:p-3 border border-[#eecdc6]/50 flex flex-col justify-center h-[100px] lg:h-[120px]">
            <div className="text-xs lg:text-sm font-bold text-[#c24127]/70 uppercase tracking-wider mb-0.5">专注时长</div>
            <div className="text-2xl lg:text-3xl font-black text-[#c24127]">{formatDurationText(selectedDayData.focusMinutes)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-2.5 lg:p-3 border border-emerald-100/50 flex flex-col h-[100px] lg:h-[120px]">
            <div className="text-xs lg:text-sm font-bold text-emerald-600/70 uppercase tracking-wider mb-1.5 shrink-0">已完成任务</div>
            <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
              {selectedDayData.todos.filter(t => t.completed).length === 0 ? (
                <div className="text-emerald-600/50 text-sm font-medium">未完成任何任务</div>
              ) : (
                selectedDayData.todos.filter(t => t.completed).map(t => (
                  <div key={t.id} className="flex items-center gap-1.5 text-emerald-800 font-medium text-sm lg:text-base">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{t.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/60 to-white rounded-xl p-2.5 lg:p-3 border border-indigo-100/50 flex flex-col h-[100px] lg:h-[120px]">
            <div className="text-xs lg:text-sm font-bold text-indigo-600/70 uppercase tracking-wider mb-1.5 shrink-0">日程记录</div>
            <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
              {selectedDayData.schedule.length === 0 ? (
                <div className="text-indigo-600/50 text-sm font-medium">无日程记录</div>
              ) : (
                selectedDayData.schedule.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-indigo-800 font-medium text-sm lg:text-base">
                    <div className="text-xs lg:text-sm font-bold text-indigo-400 w-12 shrink-0">{s.startTime}</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                    <span className="truncate">{s.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
