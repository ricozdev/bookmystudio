'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CompareIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';

export function ComparisonTray() {
  const pathname = usePathname();
  const { comparedStudios, removeFromCompare, clearCompare, compareLimit } = useMarketplace();
  const [isExpanded, setIsExpanded] = useState(false);

  // Hide on auth pages, admin routes, the comparison page itself, or if nothing is selected
  const isAuthOrAdmin =
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/create-account' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';

  const isDetailScreen =
    /^\/studios\/[^/]+\/?$/.test(pathname) ||
    /^\/locations\/[^/]+\/?$/.test(pathname) ||
    /^\/crew\/[^/]+\/?$/.test(pathname) ||
    /^\/equipment\/[^/]+\/?$/.test(pathname);

  if (isAuthOrAdmin || pathname === '/compare' || comparedStudios.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Studio Comparison Dock"
      className={`fixed z-40 right-4 sm:right-6 bottom-20 lg:bottom-6 transition-all duration-200 ${
        isDetailScreen ? 'hidden lg:block' : ''
      }`}
    >
      {/* ========================================================
         COMPACT COLLAPSED PILL DOCK (Default Non-Intrusive State)
         ======================================================== */}
      {!isExpanded ? (
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white/95 dark:bg-[#121216]/95 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-md animate-scale-in">
          {/* Overlapping Thumbnails Stack */}
          <div className="flex -space-x-2 shrink-0">
            {comparedStudios.map((studio) => (
              <div
                key={studio.id}
                className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 shrink-0"
              >
                <Image
                  src={studio.imageUrl || '/images/studios/apex-stage-c.svg'}
                  alt={studio.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Active Count & Label */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            aria-label="Expand stage comparison tray"
          >
            <span>Compare ({comparedStudios.length})</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal hidden sm:inline">
              · Review Specs
            </span>
          </button>

          {/* Direct CTA to /compare */}
          <Link
            href="/compare"
            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1 shrink-0 shadow-2xs active:scale-95"
          >
            <span>Matrix</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>

          {/* Quick Clear Button */}
          <button
            type="button"
            onClick={clearCompare}
            className="w-5 h-5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 flex items-center justify-center text-[10px] transition-colors cursor-pointer mr-0.5"
            aria-label="Clear all compared stages"
            title="Clear all"
          >
            ✕
          </button>
        </div>
      ) : (
        /* ========================================================
           EXPANDED MINI-DRAWER (When user explicitly toggles details)
           ======================================================== */
        <div className="w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl bg-white/95 dark:bg-[#121216]/95 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl p-4 animate-scale-in">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CompareIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold tracking-tight">
                Comparison Shortlist
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {comparedStudios.length} / {compareLimit}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-red-500 font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
                aria-label="Collapse comparison dock"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Stage List */}
          <div className="mt-3 space-y-2">
            {comparedStudios.map((studio) => (
              <div
                key={studio.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={studio.imageUrl || '/images/studios/apex-stage-c.svg'}
                      alt={studio.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {studio.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      ${studio.dayRate10h.toLocaleString()}/10h · {studio.specs.sqFt.toLocaleString()} sq ft
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCompare(studio.id)}
                  className="w-5 h-5 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-500 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                  aria-label={`Remove ${studio.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2 py-1.5 font-medium cursor-pointer"
            >
              Minimize Dock
            </button>

            <Link
              href="/compare"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>Open Matrix</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      )}
    </aside>
  );
}
