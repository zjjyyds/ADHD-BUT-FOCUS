const fs = require('fs');
let content = fs.readFileSync('pages/TimerPage.tsx', 'utf8');

const originalComponent = `const TimeWheelPicker: React.FC<{
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
              className="h-[64px] flex items-center justify-center snap-center text-[64px] font-light tabular-nums tracking-tight transition-all cursor-pointer " + (m === value ? "text-[#c24127] font-normal" : "text-slate-300 opacity-50 hover:opacity-100 scale-75")
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
};`;

// replace everything from const TimeInputPicker to its end.
const startIdx = content.indexOf('const TimeInputPicker: React.FC');
const endIdx = content.indexOf('export default function TimerPage()');
if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + originalComponent + "\n\n" + content.substring(endIdx);
    content = content.replace(/<TimeInputPicker/g, '<TimeWheelPicker');
    fs.writeFileSync('pages/TimerPage.tsx', content);
    console.log("TimerPage successfully reverted");
} else {
    console.log("Could not find boundaries");
}
