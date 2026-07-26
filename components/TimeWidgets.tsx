import React, { memo } from 'react';
import { motion } from 'motion/react';

export const TodayDotsWidget: React.FC<{ currentTime: Date }> = memo(({ currentTime }) => {
  const totalHours = 24;
  const filledHours = currentTime.getHours();
  
  return (
    <div className="bg-white/80  rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0">
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
});

export const WeekDotsWidget: React.FC<{ currentTime: Date }> = memo(({ currentTime }) => {
  const totalHours = 168;
  // Assuming Monday is the first day of the week (0-6)
  const dayOfWeek = (currentTime.getDay() + 6) % 7; 
  const filledHours = dayOfWeek * 24 + currentTime.getHours();
  
  return (
    <div className="bg-white/80  rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0">
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
});

export const TimePerceptionWidget: React.FC<{ currentTime: Date, className?: string }> = memo(({ currentTime, className = '' }) => {
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
    <div className={`bg-white/80 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0 flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-5 shrink-0">
        <div className="font-bold text-slate-800 text-base">时间感知</div>
        <div className="text-[10px] font-bold text-[#c24127] bg-[#c24127]/10 px-2 py-1 rounded-full uppercase tracking-wider">概览</div>
      </div>
      
      <div className="flex items-center gap-6 flex-1">
        <div className="relative shrink-0" style={{ width: svgSize, height: svgSize }}>
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {/* Tracks */}
            <circle cx={center} cy={center} r={radius.y} fill="none" stroke="#fff1ee" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={radius.m} fill="none" stroke="#fff1ee" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={radius.d} fill="none" stroke="#fff1ee" strokeWidth={strokeWidth} />
            
            {/* Progress */}
            <circle cx={center} cy={center} r={radius.y} fill="none" stroke="#8c2b1a" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={Math.PI * radius.y * 2} strokeDashoffset={calcOffset(radius.y, yearProgress)} className="" />
            <circle cx={center} cy={center} r={radius.m} fill="none" stroke="#c24127" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={Math.PI * radius.m * 2} strokeDashoffset={calcOffset(radius.m, monthProgress)} className="" />
            <circle cx={center} cy={center} r={radius.d} fill="none" stroke="#e87a65" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={Math.PI * radius.d * 2} strokeDashoffset={calcOffset(radius.d, dayProgress)} className="" />
          </svg>
          
          {/* Labels */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-4 h-4 bg-[#8c2b1a] rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm" style={{ top: `${center - radius.y}px`, left: `${center}px`, transform: 'translate(-50%, -50%)' }}>Y</div>
            <div className="absolute w-4 h-4 bg-[#c24127] rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm" style={{ top: `${center - radius.m}px`, left: `${center}px`, transform: 'translate(-50%, -50%)' }}>M</div>
            <div className="absolute w-4 h-4 bg-[#e87a65] rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm" style={{ top: `${center - radius.d}px`, left: `${center}px`, transform: 'translate(-50%, -50%)' }}>D</div>
          </div>
        </div>
        
        <div className="w-full flex flex-col justify-center gap-4 h-full">
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="font-bold text-slate-800 text-sm">{dayText}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today</div>
            </div>
            <div className="h-1.5 bg-[#fff1ee] rounded-full overflow-hidden">
              <div className="h-full bg-[#e87a65] rounded-full " style={{ width: `${dayProgress * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="font-bold text-slate-800 text-sm">{monthText}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Month</div>
            </div>
            <div className="h-1.5 bg-[#fff1ee] rounded-full overflow-hidden">
              <div className="h-full bg-[#c24127] rounded-full " style={{ width: `${monthProgress * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="font-bold text-slate-800 text-sm">{yearText}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Year</div>
            </div>
            <div className="h-1.5 bg-[#fff1ee] rounded-full overflow-hidden">
              <div className="h-full bg-[#8c2b1a] rounded-full " style={{ width: `${yearProgress * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const CountdownWidget: React.FC<{ eventName?: string, targetDate?: string, className?: string }> = memo(({ eventName, targetDate, className = '' }) => {
  if (!eventName || !targetDate) return null;
  const target = new Date(targetDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return null;

  return (
    <div className={`bg-white/80 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white shrink-0 relative overflow-hidden flex flex-col ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c24127]/5 rounded-bl-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#c24127]/5 rounded-tr-[100px] -z-10"></div>
      <div className="flex justify-between items-center mb-5 shrink-0">
        <div className="font-bold text-slate-800 text-base">倒数日</div>
        <div className="text-[10px] font-bold text-[#c24127] bg-[#c24127]/10 px-2 py-1 rounded-full uppercase tracking-wider">目标</div>
      </div>
      <div className="flex flex-col flex-1 items-center justify-center relative">
         <div className="text-6xl font-bold text-[#c24127] tabular-nums tracking-tighter mb-1 drop-shadow-sm">{daysLeft}</div>
         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Days Left</div>
         <div className="flex items-center justify-between w-full px-4 py-3 bg-white/60 rounded-2xl border border-white/50 backdrop-blur-sm">
            <div className="font-semibold text-slate-700 text-sm truncate pr-4">{eventName}</div>
            <div className="text-xs font-bold text-slate-400 shrink-0">{targetDate}</div>
         </div>
      </div>
    </div>
  );
});

export const FlippableTimeWidget: React.FC<{ currentTime: Date, eventName?: string, targetDate?: string }> = memo(({ currentTime, eventName, targetDate }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  let showCountdown = false;
  if (eventName && targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (daysLeft >= 0) showCountdown = true;
  }

  if (!showCountdown) {
    return <TimePerceptionWidget currentTime={currentTime} />;
  }

  return (
    <div className="relative w-full cursor-pointer shrink-0" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: 1000 }}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'tween', ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full relative"
      >
        {/* Render TimePerception always relative so it gives the container height */}
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="relative w-full">
           <TimePerceptionWidget currentTime={currentTime} className="h-full w-full" />
        </div>
        {/* Render Countdown absolute on top */}
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }} className="absolute inset-0 w-full h-full">
           <CountdownWidget eventName={eventName} targetDate={targetDate} className="h-full w-full" />
        </div>
      </motion.div>
    </div>
  );
});
