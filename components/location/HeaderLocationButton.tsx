'use client';

import React from 'react';
import { useLocation } from '@/context/LocationContext';

export function HeaderLocationButton({
  className = '',
  variant = 'compact',
}: {
  className?: string;
  variant?: 'compact' | 'detailed';
}) {
  const { location, isNeutral, openSelector } = useLocation();

  const radiusLabel = isNeutral ? 'All India' : location.radiusKm === 'all' ? 'All' : `${location.radiusKm}km`;

  const shortText = React.useMemo(() => {
    if (isNeutral) return 'Select Location';
    if (!location.locality) return location.city || location.name;
    if (location.city && !location.locality.toLowerCase().includes(location.city.toLowerCase())) {
      return `${location.locality}, ${location.city}`;
    }
    return location.locality;
  }, [isNeutral, location.locality, location.city, location.name]);

  const buttonTitle = isNeutral
    ? 'Select production location (All India discovery active) — Click to choose city or area'
    : `Current Location: ${location.name} (Search radius: ${radiusLabel}) — Click to change`;

  const ariaLabel = isNeutral
    ? 'Select production location, currently All India'
    : `Change production location, currently ${location.name}`;

  if (variant === 'detailed') {
    return (
      <button
        onClick={openSelector}
        type="button"
        className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#141418] dark:hover:bg-[#1A1A22] border border-zinc-300 dark:border-[#27272A] hover:border-amber-500/40 text-xs transition-colors shadow-xs text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${className}`}
        title={buttonTitle}
        aria-label={ariaLabel}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{shortText}</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Radius: {radiusLabel}</span>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={openSelector}
      type="button"
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#141418] dark:hover:bg-[#1A1A22] border border-zinc-300 dark:border-[#27272A] hover:border-amber-500/40 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all shadow-xs text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0 ${className}`}
      title={buttonTitle}
      aria-label={ariaLabel}
    >
      <span className="text-amber-500 group-hover:scale-105 transition-transform shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </span>

      <span className="font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white truncate max-w-[110px] sm:max-w-[145px]">
        {shortText}
      </span>

      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 shrink-0">
        ({radiusLabel})
      </span>

      <svg
        className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors ml-0.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

