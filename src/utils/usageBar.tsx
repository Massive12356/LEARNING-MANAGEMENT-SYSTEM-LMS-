// Helper function
 export const getUsageBar = (used: string, total: string) => {
  // Extract numeric values (handles units like "2.4TB" or "500GB")
  const parseValue = (v: string) => {
    const num = parseFloat(v);
    if (v.toLowerCase().includes('tb')) return num * 1000; // convert to GB
    return num;
  };

  const usedGB = parseValue(used);
  const totalGB = parseValue(total);
  const percentage = totalGB ? Math.min((usedGB / totalGB) * 100, 100) : 0;

  let color = 'bg-green-600';
  if (percentage >= 80) color = 'bg-red-600';
  else if (percentage >= 60) color = 'bg-yellow-500';

  return { percentage, color };
};
