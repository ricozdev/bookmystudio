'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import {
  ArchetypeIcon,
  CompareIcon,
  GearCrateIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

const stepsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const stepCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function HowItWorksSteps() {
  const steps = [
    {
      number: '01',
      title: 'Define Project Brief',
      subtitle: 'Timing, Shift & Space Requirements',
      description:
        'Specify your shoot dates, commercial shift standard (10h full-day, 5h half-day, or 12h extended), and technical needs like 3-phase Camlock or drive-in loading.',
      icon: <ArchetypeIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      detail: 'Standard 10h call times · Zero hidden overages',
    },
    {
      number: '02',
      title: 'Compare Verified Specs',
      subtitle: 'Side-by-Side Technical Matrix',
      description:
        'Evaluate up to 3 stages simultaneously on real engineering parameters: measured ceiling grid height, STC 60 acoustic ratings, and drive-in gate clearances.',
      icon: <CompareIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      detail: 'True ceiling clearance · STC 60 certified silent',
    },
    {
      number: '03',
      title: 'Assemble Crew & Gear',
      subtitle: 'Call Sheet Dispatch & Payroll Math',
      description:
        'Select turnkey cinema camera packages and dispatch 48-hour holds directly to verified IATSE Local 52/600/798 DPs and Gaffers with live payroll estimations.',
      icon: <GearCrateIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      detail: 'Union guild rosters · Turnkey cinema packages',
    },
    {
      number: '04',
      title: 'Confirm Booking & Schedule Shoot',
      subtitle: 'Streamlined Shoot Logistics',
      description:
        'Submit date requests, communicate directly with stage coordinators on facility access, and lock in your complete production schedule.',
      icon: <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      detail: 'Clear call times · Verified stage access',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#0E0E12] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
              THE PRODUCTION PROCESS
            </span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            From Project Brief to Final Wrap in Four Steps.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            A standardized, predictable workflow built around commercial film contracts, union call sheets, and facility hold rules.
          </p>
        </div>

        {/* 4-Step Process Grid with Staggered Entrance and Motion */}
        <motion.div
          variants={stepsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepCardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-mono text-xs font-black text-zinc-400 dark:text-zinc-500">
                    STEP {step.number}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    {step.title}
                  </h3>
                  <span className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {step.subtitle}
                  </span>
                  <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-medium">
                {step.detail}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Booking Notice Callout */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400 shadow-xs">
          <div>
            <strong className="text-zinc-950 dark:text-white font-bold block sm:inline mr-2">
              Production Booking Transparency:
            </strong>
            <span>
              Submitting a hold inquiry communicates directly with facility coordinators. Reservations are confirmed upon schedule clearance and insurance certificate delivery.
            </span>
          </div>

          <Link
            href="/studios"
            className="group shrink-0 inline-flex items-center gap-1.5 font-bold text-zinc-950 dark:text-amber-400 hover:text-amber-600 transition-colors"
          >
            <span>Plan Production</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
