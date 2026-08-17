const fs = require('fs');
let content = fs.readFileSync('pages/DailyPlanPage.tsx', 'utf8');

const timeSelectCode = `
const TimeSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const parts = (value || '00:00').split(':');
  const h = parts[0] || '00';
  const m = parts[1] || '00';
  
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(\`\${e.target.value}:\${m}\`);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(\`\${h}:\${e.target.value}\`);
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 transition-colors">
      <select 
        value={h} 
        onChange={handleHourChange} 
        className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none text-center text-center"
      >
        {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <span className="text-slate-400 font-bold -mx-0.5">:</span>
      <select 
        value={m} 
        onChange={handleMinChange} 
        className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none text-center"
      >
        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(min => (
          <option key={min} value={min}>{min}</option>
        ))}
      </select>
    </div>
  );
};
`;

const insertIndex = content.indexOf('export default function DailyPlanPage()');
if (insertIndex !== -1) {
    content = content.substring(0, insertIndex) + timeSelectCode + "\n" + content.substring(insertIndex);
    
    // Replace <input type="time" ... /> with <TimeSelect />
    // Find first input time block
    content = content.replace(
        /<input\s+type="time"\s+value=\{item\.startTime\}\s+onChange=\{\(e\) => updateDraftRow\(item\.id, 'startTime', e\.target\.value\)\}\s+className="[^"]+"\s+\/>/g,
        `<TimeSelect value={item.startTime} onChange={(val) => updateDraftRow(item.id, 'startTime', val)} />`
    );
    
    // Find second input time block
    content = content.replace(
        /<input\s+type="time"\s+value=\{item\.endTime\}\s+onChange=\{\(e\) => updateDraftRow\(item\.id, 'endTime', e\.target\.value\)\}\s+className="[^"]+"\s+\/>/g,
        `<TimeSelect value={item.endTime} onChange={(val) => updateDraftRow(item.id, 'endTime', val)} />`
    );

    fs.writeFileSync('pages/DailyPlanPage.tsx', content);
    console.log("DailyPlanPage successfully patched");
} else {
    console.log("Failed to patch DailyPlanPage");
}
