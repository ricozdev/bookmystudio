'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';

export interface ThemeToggleProps {
  /**
   * Visual presentation style:
   * - 'header': Compact circular button for navigation bars (default)
   * - 'menu': Full-width list item with label and current mode badge for dropdowns/drawers
   * - 'segmented': Explicit Light / Dark segmented pill selector for settings panels
   */
  variant?: 'header' | 'menu' | 'segmented';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = 'header',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 shadow-inner ${className}`}
        role="group"
        aria-label="Theme preference"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={!isDark}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            !isDark
              ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <SunIcon className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={isDark}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isDark
              ? 'bg-[#121216] text-white shadow-xs border border-zinc-700 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <MoonIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer select-none text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <span className="font-medium">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-bold">
          {theme}
        </span>
      </button>
    );
  }

  // Default: variant === 'header'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center gap-1.5 min-w-[38px] h-[38px] px-2 rounded-full border border-zinc-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#121216]/90 hover:bg-zinc-100 dark:hover:bg-[#18181E] text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 transition-all duration-180 shadow-xs cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <SunIcon className="w-4 h-4 text-amber-400 transition-transform duration-200 group-hover:rotate-45" />
        ) : (
          <MoonIcon className="w-4 h-4 text-amber-600 transition-transform duration-200 group-hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold pr-1">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}

