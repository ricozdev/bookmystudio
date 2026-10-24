'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  ShieldPolicyIcon,
  CheckCircleIcon,
  CycloramaCategoryIcon,
} from '@/components/ui/Icons';

export default function AboutPage() {
  return (
    <div className="py-8 bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'About BookMyStudio' },
          ]}
          className="mb-6"
        />

        {/* Hero Section */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              MISSION &amp; ARCHITECTURAL STANDARD
            </span>
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Built for Commercial Shoots, Not Event Hall Rentals
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            BookMyStudio is the first architectural marketplace engineered exclusively for commercial directors, executive producers, and union Heads of Department.
          </p>
        </div>

        {/* The Problem & Our Origin */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Why We Built BookMyStudio
            </h2>

            <p>
              In high-stakes commercial filming, episodic television, and editorial photography, time on set is valued at thousands of dollars per minute. Yet for decades, line producers relied on fragmented spreadsheets, generic peer-to-peer venue sites, and opaque broker fees.
            </p>

            <p>
              Generic marketplace platforms list party halls, wedding lofts, and residential apartments alongside genuine production studios. Too many commercial shoots have been derailed by blown 15-amp residential breakers, uncertified ceiling grids that cannot hold a 500-pound lighting rig, or street noise bleeding through thin windows during intimate dialogue takes.
            </p>

            <p>
              BookMyStudio was founded in Brooklyn by commercial line producers, cinematographers, and stage managers who demanded a higher technical standard. We only list verified facilities with real 3-phase Camlock power, true seamless cyclorama curves, documented acoustic ratings, and drive-in roll-up doors.
            </p>
          </div>

          {/* Quick Stats Sidebar (Span 5) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Marketplace at a Glance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-[#18181E] rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">140+</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Vetted Stages &amp; Studios</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-[#18181E] rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">$2M</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Direct Liability Policy</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-[#18181E] rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">600A+</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">3-Phase Camlock Minimum</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-[#18181E] rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">STC 60</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Acoustic Isolation Standard</div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-200 font-semibold">
                <ShieldPolicyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Automated COI Delivery</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Every reservation includes an automated Certificate of Insurance endorsed with host facility name and address prior to production load-in.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              OUR TECHNICAL PILLARS
            </span>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              The Three Standards of BookMyStudio
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-4">
                <CycloramaCategoryIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                1. Architectural Rigor
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                We physically measure ceiling heights under structural steel, test roll-up door dimensions for production cube trucks, inspect infinity cove radius consistency, and verify silent HVAC performance on every soundstage.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-4">
                <ShieldPolicyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                2. Direct Production Insurance
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                No third-party broker delays. Every stage booking is backed by our $2,000,000 comprehensive liability policy, providing instant Certificates of Insurance (COI) that satisfy city permitting and host requirements.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                3. Unified Call Sheet
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Production stages, raw architectural locations, verified IATSE Local 52 &amp; Local 600 department heads, and cinema packages are all coordinated on one seamless digital roster with predictable 10-hour shoot day rules.
              </p>
            </div>
          </div>
        </div>

        {/* Explore Links Banner */}
        <div className="mt-16 p-8 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Ready to Book Your Next Stage or Call Sheet?
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
              Explore verified cycloramas in Greenpoint, soundstages in LIC, raw filming locations, or join our studio host network.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/studios"
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Explore Studios
            </Link>
            <Link
              href="/list-your-studio"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
            >
              List Your Stage
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
