'use client';

import React from 'react';
import Link from 'next/link';
import {
  SoundstageIcon,
  WarehouseIcon,
  UserIcon,
  GearCrateIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

const CATEGORIES = [
  {
    href: '/studios',
    title: 'Studios',
    subtitle: 'Soundstages & Stages',
    description: 'Soundstages, infinity cycloramas, daylight lofts, and recording spaces for photography and video.',
    icon: SoundstageIcon,
    cta: 'Explore Studios',
  },
  {
    href: '/locations',
    title: 'Filming Locations',
    subtitle: 'Practical Sets & Real Spaces',
    description: 'Industrial warehouses, architectural lofts, residential homes, and outdoor filming sites.',
    icon: WarehouseIcon,
    cta: 'Explore Locations',
  },
  {
    href: '/crew',
    title: 'Crew & Professionals',
    subtitle: 'Creative Production Talent',
    description: 'Directors of photography, gaffers, sound mixers, and specialized production department heads.',
    icon: UserIcon,
    cta: 'Explore Crew',
  },
  {
    href: '/equipment',
    title: 'Equipment',
    subtitle: 'Cinema Gear & Lighting',
    description: 'Cinema camera packages, prime lenses, 3-phase lighting packages, and field grip gear.',
    icon: GearCrateIcon,
    cta: 'Explore Equipment',
  },
] as const;

export function ProductionCategoryNav() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Production Categories</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Explore All Four Production Pillars
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Dedicated stages, locations, qualified crew, and cinema equipment across India.
            </p>
          </div>

          <Link
            href="/search"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1.5 transition-colors group shrink-0"
          >
            <span>Search All Resources</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-zinc-500 mb-2 px-1">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Swipe categories horizontally &rarr;
          </span>
          <span className="font-mono text-[10px]">4 Pillars</span>
        </div>

        {/* 4 Category Cards (Swipe carousel on mobile, 2/4-col grid on tablet/desktop) */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className="w-[260px] sm:w-auto shrink-0 snap-start group relative p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-100/80 dark:hover:bg-[#16161C] transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 mb-4 group-hover:scale-105 transition-transform duration-200 border border-amber-500/20">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {cat.subtitle}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 transition-colors">
                  <span>{cat.cta}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

