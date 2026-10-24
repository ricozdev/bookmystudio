'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRightIcon, ShieldPolicyIcon, CheckCircleIcon } from '@/components/ui/Icons';

export function LandingFinalCta() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-[#09090B] transition-colors duration-150 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Main CTA Container with Subtle Scale Entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          />

          <div className="max-w-3xl relative space-y-6">
            
            {/* Monospace Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-zinc-900 border border-amber-500/20 dark:border-zinc-800 text-amber-600 dark:text-amber-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>THE PRODUCTION AGGREGATOR</span>
            </div>

            {/* Display Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-zinc-900 dark:text-white">
              Your Next Production Starts Here.
            </h2>

            {/* Concise Value Summary */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl">
              Stop juggling disconnected vendor emails, opaque electrical limits, and separate insurance policies. Discover verified soundstages, book union department heads, and rent cinema gear with transparent 10-hour day rates.
            </p>

            {/* Action Buttons Cluster with Motion Micro-Interactions */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/studios"
                  className="group px-7 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Plan Your Production</span>
                  <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/partner"
                  className="px-6 py-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Become a Partner</span>
                </Link>
              </motion.div>
            </div>

            {/* Value Guarantees Footnote */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldPolicyIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">$2,000,000 Direct Liability Insurance</span>
              </div>
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Standard 10-Hour Commercial Shoot Day</span>
              </div>
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">·</span>
              <span>Direct Hold Inquiries</span>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}
