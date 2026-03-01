// src/lib/utils.ts
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getContrastColor(bgColor: string): string {
  // Simple contrast calculation for demo purposes
  return bgColor.startsWith('#0a0a0a') ? '#ededed' : '#171717';
}