"use client";

import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle(): React.ReactElement | null {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
      aria-label="테마 전환"
    >
      {currentTheme === 'dark' ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}