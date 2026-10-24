'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ShieldPolicyIcon } from '@/components/ui/Icons';

export function FinalCta() {
  return (
    <section className="py-14 sm:py-18 bg-white dark:bg-[#09090B] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-zinc-950 dark:bg-[#121216] border border-zinc-800 text-white relative overflow-hidden shadow-xl">
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-amber-400 text-xs font-semibold">
              <ShieldPolicyIcon className="w-3.5 h-3.5" />
              <span>Direct $2,000,000 Production Liability Endorsement</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Spec Your Next Commercial Shoot?
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
              Join vetted commercial line producers, agency directors, and union cinematographers. Lock in verified cycloramas, soundstages, filming locations, and crew with transparent terms.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/studios"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer group"
              >
                <span>Explore Production Studios</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/create-account"
                className="px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                Create Producer Account
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
