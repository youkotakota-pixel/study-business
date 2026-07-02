export function learningProgress(day: number, totalDays: number): number {
  if (day < 1) return 0;
  return Math.min(100, Math.ceil((day / totalDays) * 100));
}

export function progressBarText(day: number, totalDays: number, segments = 10): string {
  const percent = learningProgress(day, totalDays);
  const filled = percent === 0 ? 0 : Math.max(1, Math.round((percent / 100) * segments));
  return `${"▰".repeat(filled)}${"▱".repeat(segments - filled)} ${percent}%`;
}
