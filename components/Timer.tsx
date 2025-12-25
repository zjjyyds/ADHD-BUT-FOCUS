import React, { useState, useEffect } from 'react';

// Shared Card Component for consistent dashboard styling
const Card = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 ${className}`}>
    {children}
  </div>
);

export const DayProgressWidget: React.FC<{ now: Date }> = ({ now }) => {
  const currentHour = now.getHours();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="relative overflow-hidden flex flex-col justify-center min-h-[160px]">
       <div className="flex items-center justify-between mb-6 z-10 px-1">
          <span className="text-sm font-bold text-slate-500">今日</span>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">
             {currentHour}/24 H
          </span>
       </div>
       
       <div className="flex items-center justify-center z-10 px-1">
          {/* 6 columns x 4 rows = 24 hours. Compact and clean. */}
          <div className="grid grid-cols-6 gap-x-5 gap-y-5">
             {hours.map(h => {
                const isPast = h < currentHour;
                const isCurrent = h === currentHour;
                
                return (
                   <div key={h} className="flex items-center justify-center">
                      <div 
                        className={`
                          w-2.5 h-2.5 rounded-full transition-all duration-500
                          ${isPast ? 'bg-slate-800' : ''}
                          ${isCurrent ? 'bg-orange-500 scale-125 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}
                          ${!isPast && !isCurrent ? 'bg-slate-200' : ''}
                        `}
                        title={`${h}:00`}
                      />
                   </div>
                );
             })}
          </div>
       </div>
    </Card>
  );
};

export const WeekDaysWidget: React.FC<{ now: Date }> = ({ now }) => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  // Convert getDay() (0=Sun...6=Sat) to (0=Mon...6=Sun)
  const jsDay = now.getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const currentDayName = days[currentDayIndex];

  return (
    <Card className="flex flex-col h-full min-h-[160px] relative overflow-hidden">
       {/* Header */}
       <div className="flex justify-between items-start z-10">
          <span className="text-sm font-bold text-slate-500">本周进度</span>
       </div>
       
       {/* Content */}
       <div className="z-10 flex flex-col items-center justify-center flex-1 gap-5 pb-2">
          <div className="text-5xl font-black text-slate-800 tracking-tight mt-1">
            {currentDayName}
          </div>
          
          <div className="flex gap-4 mt-2">
             {days.map((_, i) => {
               const isPast = i < currentDayIndex;
               const isCurrent = i === currentDayIndex;
               return (
                 <div 
                   key={i}
                   className={`
                     w-3 h-3 rounded-full transition-all duration-500
                     ${isPast ? 'bg-slate-800' : ''}
                     ${isCurrent ? 'bg-orange-500 scale-110' : ''}
                     ${!isPast && !isCurrent ? 'bg-slate-200' : ''}
                   `}
                 />
               );
             })}
          </div>
       </div>
    </Card>
  );
};

export const WeekHoursWidget: React.FC<{ now: Date }> = ({ now }) => {
  const jsDay = now.getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon
  const currentHour = now.getHours();
  
  // Calculate total hours passed in the week
  const hoursPassed = currentDayIndex * 24 + currentHour;
  const totalHours = 168;

  return (
    <Card className="flex flex-col h-full min-h-[160px] relative overflow-hidden">
       <div className="flex justify-between items-center z-10 mb-6">
          <span className="text-sm font-bold text-slate-500">本周小时数</span>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">
             {hoursPassed}/{totalHours} H
          </span>
       </div>
       
       <div className="flex-1 flex flex-col justify-between z-10 w-full px-0.5">
             {Array.from({ length: 7 }).map((_, dayIdx) => (
                <div key={dayIdx} className="flex items-center w-full justify-between">
                      {Array.from({ length: 24 }).map((_, hourIdx) => {
                         const absoluteHour = dayIdx * 24 + hourIdx;
                         const isPast = absoluteHour < hoursPassed;
                         const isCurrent = absoluteHour === hoursPassed;
                         
                         return (
                            <div 
                              key={hourIdx}
                              className={`
                                w-2 h-2 rounded-full transition-all duration-300
                                ${isPast ? 'bg-slate-800' : ''}
                                ${isCurrent ? 'bg-orange-500 scale-110 shadow-[0_0_4px_rgba(249,115,22,0.4)]' : ''}
                                ${!isPast && !isCurrent ? 'bg-slate-200' : ''}
                              `} 
                            />
                         );
                      })}
                </div>
             ))}
       </div>
    </Card>
  );
};

export const TimeRingsWidget: React.FC<{ now: Date }> = ({ now }) => {
  // --- Calculations ---
  
  // Year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1; // 1-based
  const isLeap = (year: number) => new Date(year, 1, 29).getMonth() === 1;
  const daysInYear = isLeap(now.getFullYear()) ? 366 : 365;
  const yearProgress = dayOfYear / daysInYear;

  // Month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const monthProgress = dayOfMonth / daysInMonth;

  // Day (Today) - Using hours passed
  const hour = now.getHours();
  // We can use precise minutes for smoother progress
  const dayProgress = (hour * 60 + now.getMinutes()) / (24 * 60);

  // --- SVG Config ---
  const size = 180;
  const center = size / 2;
  const strokeWidth = 14;
  
  // Radii (Outer to Inner)
  const rYear = 70;
  const rMonth = 50;
  const rDay = 30;

  const getCircleProps = (r: number, p: number) => {
    const circum = 2 * Math.PI * r;
    return {
      r,
      strokeDasharray: circum,
      strokeDashoffset: circum - (p * circum)
    };
  };

  // Marker Component
  const Marker = ({ r, p, label, color }: { r: number, p: number, label: string, color: string }) => {
     const angle = p * 2 * Math.PI;
     const x = center + r * Math.cos(angle);
     const y = center + r * Math.sin(angle);

     return (
        <g>
           <circle cx={x} cy={y} r={7} fill={color} stroke="white" strokeWidth="2" />
           <text 
             x={x} 
             y={y} 
             dy="0.35em" 
             textAnchor="middle" 
             fill="white" 
             fontSize="7" 
             fontWeight="900" 
             transform={`rotate(90, ${x}, ${y})`}
             style={{ fontFamily: 'Arial, sans-serif' }}
           >
             {label}
           </text>
        </g>
     );
  };

  // Colors
  const cYear = "#1e293b"; // slate-900
  const cMonth = "#64748b"; // slate-500
  const cDay = "#94a3b8"; // slate-400

  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
             <h3 className="font-bold text-slate-900 text-sm">时间感知</h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                Overview
             </span>
        </div>

        <div className="flex items-center justify-between gap-2">
            {/* Left: Concentric Rings */}
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 overflow-visible">
                    {/* Tracks */}
                    <circle cx={center} cy={center} r={rYear} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} strokeLinecap="round" />
                    <circle cx={center} cy={center} r={rMonth} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} strokeLinecap="round" />
                    <circle cx={center} cy={center} r={rDay} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} strokeLinecap="round" />

                    {/* Progress */}
                    <circle cx={center} cy={center} fill="none" stroke={cYear} strokeWidth={strokeWidth} strokeLinecap="round" className="transition-all duration-1000 ease-out" {...getCircleProps(rYear, yearProgress)} />
                    <circle cx={center} cy={center} fill="none" stroke={cMonth} strokeWidth={strokeWidth} strokeLinecap="round" className="transition-all duration-1000 ease-out" {...getCircleProps(rMonth, monthProgress)} />
                    <circle cx={center} cy={center} fill="none" stroke={cDay} strokeWidth={strokeWidth} strokeLinecap="round" className="transition-all duration-1000 ease-out" {...getCircleProps(rDay, dayProgress)} />

                    {/* Markers at Tips */}
                    <Marker r={rYear} p={yearProgress} label="Y" color={cYear} />
                    <Marker r={rMonth} p={monthProgress} label="M" color={cMonth} />
                    <Marker r={rDay} p={dayProgress} label="D" color={cDay} />
                </svg>
            </div>

            {/* Right: Statistics */}
            <div className="flex flex-col justify-center gap-4 flex-1 min-w-0 pl-2">
                
                {/* Today */}
                <div className="group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black text-slate-700 tabular-nums">{hour}<span className="text-slate-300 text-xs font-semibold">/{24}</span></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">Today</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${dayProgress * 100}%` }}></div>
                    </div>
                </div>

                {/* Month */}
                <div className="group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black text-slate-800 tabular-nums">{dayOfMonth}<span className="text-slate-300 text-xs font-semibold">/{daysInMonth}</span></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-600 transition-colors">Month</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-600 rounded-full" style={{ width: `${monthProgress * 100}%` }}></div>
                    </div>
                </div>

                {/* Year */}
                <div className="group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black text-slate-900 tabular-nums">{dayOfYear}<span className="text-slate-300 text-xs font-semibold">/{daysInYear}</span></span>
                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Year</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${yearProgress * 100}%` }}></div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </Card>
  );
};

const VisualTimer: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
       <DayProgressWidget now={now} />
       <TimeRingsWidget now={now} />
    </div>
  );
};

export default VisualTimer;