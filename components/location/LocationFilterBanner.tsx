'use client';

import React from 'react';
import { useLocation } from '@/context/LocationContext';

const RADIUS_OPTIONS: { label: string; value: number | 'all' }[] = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'All', value: 'all' },
];

interface LocationFilterBannerProps {
  categoryName?: string;
  totalFound?: number;
  className?: string;
}

export function LocationFilterBanner({ categoryName, totalFound, className = '' }: LocationFilterBannerProps) {
  const { location, isNeutral, setRadius, openSelector, locationDisplayLabel } = useLocation();

  const radiusText =
    isNeutral || location.radiusKm === 'all'
      ? 'across All India'
      : `within ${location.radiusKm} km of ${location.locality || location.city}`;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-[#27272A] p-4 sm:p-5 shadow-sm transition-all ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Location indicator and change trigger */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400 font-mono">
              {locationDisplayLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>
              Showing {categoryName ? `${categoryName} ` : ''}
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">{radiusText}</span>
              {totalFound !== undefined && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                  {totalFound} available
                </span>
              )}
            </span>
            <button
              onClick={openSelector}
              type="button"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 underline font-semibold text-xs ml-1 transition"
            >
              Change Location
            </button>
          </div>
        </div>

        {/* Right: Radius selection chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Radius:
          </span>
          {RADIUS_OPTIONS.map((opt) => {
            const isSelected = location.radiusKm === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => setRadius(opt.value)}
                type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-zinc-100 dark:bg-[#181820] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

