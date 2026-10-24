'use client';

import React from 'react';
import Link from 'next/link';
import { SearchIcon, ArchetypeIcon, CheckCircleIcon } from '@/components/ui/Icons';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Discover & Technical Scouting',
      description:
        'Browse verified cycloramas, soundproof stages, filming locations, union department heads, and cinema packages with transparent power and dimension specs.',
      icon: <SearchIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      number: '02',
      title: 'Compare Rigging & Power Specs',
      description:
        'Evaluate 3-phase Camlock amperage, STC acoustic ratings, drive-in roll-up door clearances, ceiling grid heights, and standard 10-hour day rates.',
      icon: <ArchetypeIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      number: '03',
      title: 'Production Hold & Direct COI',
      description:
        'Submit a shoot date inquiry or multi-day hold. Facility coordinators confirm stage availability and deliver your $2,000,000 direct production insurance certificate.',
      icon: <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white dark:bg-[#09090B] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              COMMERCIAL BOOKING PROCESS
            </span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            How BookMyStudio Works
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            From technical scouting to wrapped shoot days, our streamlined workflow removes friction for commercial film and photography productions.
          </p>
        </div>

        {/* 3-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bento-card-interactive p-6 rounded-2xl bg-zinc-50/80 dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-black/40 space-y-4 relative h-full flex flex-col justify-between transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-2xs">
                    {step.icon}
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    STEP {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Transparency Guarantee */}
        <div className="mt-8 p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            <strong className="text-zinc-900 dark:text-zinc-200">Production Booking Transparency:</strong> Submitting a shoot date or hold request initiates facility coordination. Final reservation confirmation and stage access codes are issued upon schedule clearance and insurance delivery.
          </span>
          <Link
            href="/terms"
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Read Booking Terms &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
}
