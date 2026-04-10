import React from 'react';

export const TodayDotsWidget: React.FC<{ currentTime: Date }> = ({ currentTime }) => {
  const totalHours = 24;
  const filledHours = currentTime.getHours();
  
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0">
      <div className="flex justify-between items-center mb-5">
        <div className="font-bold text-slate-800 text-base">今日</div>
        <div className="text-xs font-bold text-[#c24127] bg-[#c24127]/10 px-2.5 py-1 rounded-full">{filledHours} / {totalHours} H</div>
      </div>
      
      <div className="grid grid-cols-12 gap-3">
        {Array.from({ length: totalHours }).map((_, i) => {
          const isFilled = i < filledHours;
          const isCurrent = i === filledHours;
          return (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full mx-auto transition-all duration-500
                ${isFilled ? 'bg-[#eecdc6]' : isCurrent ? 'bg-[#c24127] shadow-[0_0_8px_rgba(194,65,39,0.6)] scale-125' : 'bg-slate-100'}
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

export const WeekDotsWidget: React.FC<{ currentTime: Date }> = ({ currentTime }) => {
  const totalHours = 168;
  // Assuming Monday is the first day of the week (0-6)
  const dayOfWeek = (currentTime.getDay() + 6) % 7; 
  const filledHours = dayOfWeek * 24 + currentTime.getHours();
  
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0">
      <div className="flex justify-between items-center mb-5">
        <div className="font-bold text-slate-800 text-base">本周</div>
        <div className="text-xs font-bold text-[#c24127] bg-[#c24127]/10 px-2.5 py-1 rounded-full">{filledHours} / {totalHours} H</div>
      </div>
      
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {Array.from({ length: totalHours }).map((_, i) => {
          const isFilled = i < filledHours;
          const isCurrent = i === filledHours;
          return (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-500 mx-auto
                ${isFilled ? 'bg-[#eecdc6]' : isCurrent ? 'bg-[#c24127] shadow-[0_0_6px_rgba(194,65,39,0.6)] scale-125 z-10 relative' : 'bg-slate-100'}
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

export const TimePerceptionWidget: React.FC<{ currentTime: Date }> = ({ currentTime }) => {
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const dayProgress = currentHour / 24;
  
  const daysInMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
  const monthProgress = currentTime.getDate() / daysInMonth;
  
  const startOfYear = new Date(currentTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((currentTime.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const yearProgress = dayOfYear / (currentTime.getFullYear() % 4 === 0 ? 366 : 365);

  const dayText = `${Math.floor(currentHour)}/24`;
  const monthText = `${currentTime.getDate()}/${daysInMonth}`;
  const yearText = `${dayOfYear}/${currentTime.getFullYear() % 4 === 0 ? 366 : 365}`;

  const radius = { y: 55, m: 38, d: 21 };
  const strokeWidth = 10;
  const center = 65;
  const svgSize = 130;
  
  const calcOffset = (r: number, p: number) => {
    const c = Math.PI * (r * 2);
    return ((100 - (p * 100)) / 100) * c;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0">
      <div className="flex justify-between items-center mb-5">
        <div className="font-bold text-slate-800 text-base">时间感知</div>
        <div className="text-[10px] font-bold text-[#c24127] bg-[#c24127]/10 px-2 py-1 rounded-full uppercase tracking-wider">概览</div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: svgSize, height: svgSize }}>
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {/* Tracks */}
            <circle cx={center} cy={center} r={radius.y} fill="none" stroke="#fff1ee" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={radius.m} fill="none" stroke="#fff1ee" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={radius.d} fill="none" stroke="#fff1ee" strokeWidth={strokeWidth} />
            
            {/* Progress */}
            <circle cx={center} cy={center} r={radius.y} fill="none" stroke="#8c2b1a" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={Math.PI * radius.y * 2} strokeDashoffset={calcOffset(radius.y, yearProgress)} className="transition-all duration-1000" />
            <circle cx={center} cy={center} r={radius.m} fill="none" stroke="#c24127" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={Math.PI * radius.m * 2} strokeDashoffset={calcOffset(radius.m, monthProgress)} className="transition-all duration-1000" />
            <circle cx={center} cy={center} r={radius.d} fill="none" stroke="#e87a65" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={Math.PI * radius.d * 2} strokeDashoffset={calcOffset(radius.d, dayProgress)} className="transition-all duration-1000" />
          </svg>
          
          {/* Labels */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-4 h-4 bg-[#8c2b1a] rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm" style={{ top: `${center - radius.y}px`, left: `${center}px`, transform: 'translate(-50%, -50%)' }}>Y</div>
            <div className="absolute w-4 h-4 bg-[#c24127] rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm" style={{ top: `${center - radius.m}px`, left: `${center}px`, transform: 'translate(-50%, -50%)' }}>M</div>
            <div className="absolute w-4 h-4 bg-[#e87a65] rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm" style={{ top: `${center - radius.d}px`, left: `${center}px`, transform: 'translate(-50%, -50%)' }}>D</div>
          </div>
        </div>
        
        <div className="w-full flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="font-bold text-slate-800 text-sm">{dayText}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today</div>
            </div>
            <div className="h-1.5 bg-[#fff1ee] rounded-full overflow-hidden">
              <div className="h-full bg-[#e87a65] rounded-full transition-all duration-1000" style={{ width: `${dayProgress * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="font-bold text-slate-800 text-sm">{monthText}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Month</div>
            </div>
            <div className="h-1.5 bg-[#fff1ee] rounded-full overflow-hidden">
              <div className="h-full bg-[#c24127] rounded-full transition-all duration-1000" style={{ width: `${monthProgress * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="font-bold text-slate-800 text-sm">{yearText}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Year</div>
            </div>
            <div className="h-1.5 bg-[#fff1ee] rounded-full overflow-hidden">
              <div className="h-full bg-[#8c2b1a] rounded-full transition-all duration-1000" style={{ width: `${yearProgress * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
