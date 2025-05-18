// Create a shared color map
const groupColorMap = new Map<string, string>();

export const getGroupColor = (group: string): string => {
  if (groupColorMap.has(group)) return groupColorMap.get(group)!;

  // Generate random RGB values
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Apply 80% opacity (0.8)
  const randomColor = `rgba(${r}, ${g}, ${b})`;

  groupColorMap.set(group, randomColor);
  return randomColor;
};
