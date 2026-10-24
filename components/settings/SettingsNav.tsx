'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavTab {
  label: string;
  href: string;
  active: boolean;
  icon: React.ReactNode;
  badge?: string;
}

export function SettingsNav() {
  const pathname = usePathname();

  const tabs: NavTab[] = [
    {
      label: 'Account & Security',
      href: '/account/settings',
      active: pathname === '/account/settings',
      icon: (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px mb-8 overflow-x-auto scrollbar-none flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const isActive = tab.active;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-3 min-h-[44px] text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 hidden sm:inline">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
