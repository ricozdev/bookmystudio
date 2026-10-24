'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { ArrowRightIcon, CheckCircleIcon } from '@/components/ui/Icons';

const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function ProductionProblemSection() {
  const painPoints = [
    {
      step: '01',
      problemTitle: 'Fragmented Sourcing',
      problemDescription:
        'Booking a stage on one website, negotiating cinema camera packages with separate equipment houses, and cold-emailing union crew from personal phone contacts.',
      solutionTitle: 'Unified Production Ecosystem',
      solutionDescription:
        'Coordinate certified stages, raw locations, IATSE department heads, and camera packages under one cohesive booking umbrella with synchronized call times.',
      tag: 'Disconnected Workflows',
    },
    {
      step: '02',
      problemTitle: 'Opaque Technical Specifications',
      problemDescription:
        'Arriving on shoot day to discover the facility only provides 100A household power instead of 3-phase Camlock, or ceiling pipe height is too low for your box truss.',
      solutionTitle: 'Verified Engineering Specs',
      solutionDescription:
        'Every profile publishes verified technical specs: true clear ceiling height, 3-phase Camlock amperage, STC 60 acoustic isolation, and drive-in roll-up door dimensions.',
      tag: 'Unpredictable Sets',
    },
    {
      step: '03',
      problemTitle: 'Logistics & Booking Friction',
      problemDescription:
        'Scrambling days before roll to coordinate stage access, negotiate shift overtime terms, and reconcile disconnected quotes from separate vendors.',
      solutionTitle: 'Standardized Shifts & Direct Inquiries',
      solutionDescription:
        'Transparent shoot day shift guidelines, published overtime rates, and streamlined inquiry workflows directly between producers and host stages.',
      tag: 'Coordinated Bookings',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#0E0E12] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
              THE PRODUCTION CHALLENGE
            </span>
          </div>
          
          <h2 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            Coordinating a Commercial Shoot Shouldn&apos;t Require 20 Disconnected Tabs.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Creative production is demanding enough. Sourcing verified facilities, hiring skilled department heads, and securing compliant insurance shouldn&apos;t be a logistical roadblock.
          </p>
        </div>

        {/* 3 Friction & Solution Columns with Staggered Entrance and Motion */}
        <motion.div
          variants={sectionContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {painPoints.map((item) => (
            <motion.div
              key={item.step}
              variants={cardItemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    PROBLEM {item.step}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400">
                    {item.tag}
                  </span>
                </div>

                {/* The Friction */}
                <div className="mt-4 space-y-1.5">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    {item.problemTitle}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.problemDescription}
                  </p>
                </div>

                {/* The BookMyStudio Resolution */}
                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>The BookMyStudio Standard</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.solutionTitle}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.solutionDescription}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/studios"
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <span>Explore Verified Options</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
