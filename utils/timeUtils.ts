export const formatDurationText = (mins: number) => {
  if (mins <= 0) return '0分钟';
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  if (h > 0 && m > 0) return `${h}小时${m}分钟`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
};
