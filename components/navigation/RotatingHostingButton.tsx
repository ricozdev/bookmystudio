'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * EXACT 4 ROTATING LABELS REQUIRED:
 * 1. List Your Crew
 * 2. List Your Location
 * 3. List Your Studio
 * 4. List Your Equipment
 */
const ROTATING_LABELS = [
  'List Your Crew',
  'List Your Location',
  'List Your Studio',
  'List Your Equipment',
] as const;

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

interface RotatingHostingButtonProps {
  className?: string;
  onClick?: () => void;
}

export function RotatingHostingButton({ className = '', onClick }: RotatingHostingButtonProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Synchronously subscribe to media query via React 19 useSyncExternalStore (0 effect cascading renders)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Smoothly rotate through the 4 labels every 2.5 seconds (2-3 seconds specification)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_LABELS.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Single appropriate hosting entry point:
  // Authenticated users enter the hosting flow (/list-your-studio).
  // Unauthenticated users are routed to login with return path to hosting onboarding.
  const destinationHref = user ? '/list-your-studio' : '/login?next=/list-your-studio';

  return (
    <Link
      href={destinationHref}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-1.5 px-2 min-[360px]:px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-full border border-zinc-300 dark:border-zinc-800 hover:border-amber-500/50 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#121216] dark:hover:bg-[#18181E] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all duration-200 select-none shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0 ${className}`}
      aria-label="List your creative assets and services on BookMyStudio"
    >
      {/* Subtle pulsating amber indicator dot */}
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:bg-amber-300 group-hover:scale-125 transition-transform duration-200 shrink-0"
      />

      {/*
        CSS Grid 1x1 Overlay Stack:
        All 4 labels reside in col-start-1 row-start-1.
        The container width is naturally bounded by the widest label ("List Your Equipment"),
        ensuring EXACT zero layout shifts (0.00px CLS) during every transition cycle.
      */}
      <span
        aria-live="polite"
        className="grid grid-cols-1 grid-rows-1 text-[10px] min-[360px]:text-[11px] sm:text-xs font-semibold whitespace-nowrap overflow-hidden"
      >
        {ROTATING_LABELS.map((label, idx) => {
          const isActive = idx === currentIndex;
          return (
            <span
              key={label}
              aria-hidden={!isActive}
              className={`col-start-1 row-start-1 flex items-center justify-center transition-all duration-300 ease-out ${
                isActive
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : prefersReducedMotion
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
              style={{
                transitionProperty: prefersReducedMotion ? 'opacity' : 'opacity, transform',
              }}
            >
              {label}
            </span>
          );
        })}
      </span>
    </Link>
  );
}
