'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { ArrowRightIcon, CheckCircleIcon, WarehouseIcon, GearCrateIcon } from '@/components/ui/Icons';

const marketplaceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const marketplaceCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function TwoSidedMarketplaceSection() {
  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#0E0E12] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
              TWO-SIDED MARKETPLACE
            </span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            Built for Commercial Producers.
            <span className="block text-zinc-400 dark:text-zinc-500 font-bold mt-1">
              Partnered with Stage Operators.
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Whether securing a cyclorama for a brand shoot or filling dark days on a multi-stage cinema lot, BookMyStudio delivers predictability to both sides of the set.
          </p>
        </div>

        {/* 3 Audience Cards with Staggered Motion */}
        <motion.div
          variants={marketplaceContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          
          {/* Card 1: For Commercial Producers */}
          <motion.div
            variants={marketplaceCardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-7 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-5 h-5" />
              </div>

              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">
                FOR PRODUCERS &amp; DIRECTORS
              </span>

              <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mt-1">
                Scout Confidently, Wrap on Time
              </h3>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Centralized discovery for verified soundstages, permitted filming locations, union department heads, and cinema packages with transparent 10-hour day rates.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Side-by-side technical spec matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Call sheet crew dispatch &amp; payroll math</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>$2,000,000 direct insurance on every shoot</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/studios"
                className="group inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Scout Production Stages</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: For Studio & Soundstage Operators */}
          <motion.div
            variants={marketplaceCardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-7 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <WarehouseIcon className="w-5 h-5" />
              </div>

              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">
                FOR STAGE OWNERS &amp; OPERATORS
              </span>

              <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mt-1">
                Monetize Production Footprint
              </h3>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Connect your soundstage or cyclorama cove with verified commercial brand productions, streaming units, and advertising agencies seeking certified stages.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Transparent 10% platform fee</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Direct inquiries from qualified production teams</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Instant hold notifications &amp; direct booking requests</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/partner"
                className="group inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 text-zinc-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <span>Become a Partner</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: For Creative Crew & Equipment Houses */}
          <motion.div
            variants={marketplaceCardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-7 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <GearCrateIcon className="w-5 h-5" />
              </div>

              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">
                FOR UNION CREW &amp; GEAR HOUSES
              </span>

              <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mt-1">
                Publish Credits &amp; Turnkey Kits
              </h3>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Showcase IATSE Local 52/600/798 guild credits, standard kit inclusions, and receive verified booking inquiries directly from commercial producers.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Verified union affiliation badges</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Turnkey camera &amp; lighting package bundling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>48-hour preliminary hold dispatch</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/crew"
                className="group inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 text-zinc-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <span>Browse Crew Roster</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
