'use client';

import React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  CompareIcon,
  GearCrateIcon,
  ArchetypeIcon,
  CheckCircleIcon,
  CamlockPowerIcon,
} from '@/components/ui/Icons';

const propsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const propCardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function ValuePropsSection() {
  const advantages = [
    {
      title: 'All Four Production Pillars Connected',
      description:
        'Coordinate production studios, permitted industrial sets, union crew, and turnkey cinema camera packages through one unified marketplace.',
      icon: <ArchetypeIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Verified Engineering Specifications',
      description:
        'Every stage profile details measured clear grid height, 3-phase Camlock amperage, STC 60 acoustic isolation, and drive-in gate clearances.',
      icon: <CamlockPowerIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Standard 10-Hour Commercial Shoot Day',
      description:
        'Standardized shift structures (10h full-day, 5h half-day, 12h extended) with published overtime rates and transparent cyc repaint terms.',
      icon: <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Direct Stage & Vendor Inquiries',
      description:
        'Connect directly with stage operators, location owners, and equipment rental houses with transparent terms and rapid confirmation.',
      icon: <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Side-by-Side Technical Comparison Matrix',
      description:
        'Compare up to 3 stages side-by-side on real engineering parameters with our discrepancy highlighter to evaluate power, grid, and rates.',
      icon: <CompareIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Call Sheet Roster & Payroll Estimator',
      description:
        'Assemble verified IATSE Local 52/600/798 department heads and calculate estimated daily guild payroll before dispatching holds.',
      icon: <GearCrateIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#09090B] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
              THE BOOKMYSTUDIO ADVANTAGE
            </span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            Engineered Around the Realities of the Set.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Built by commercial producers and cinematographers to replace fragmented scouting with verified engineering standards and transparent terms.
          </p>
        </div>

        {/* 6 Advantage Cards Grid with Motion */}
        <motion.div
          variants={propsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {advantages.map((adv) => (
            <motion.div
              key={adv.title}
              variants={propCardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shadow-2xs">
                {adv.icon}
              </div>

              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                {adv.title}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {adv.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
