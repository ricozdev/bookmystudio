'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import {
  CamlockPowerIcon,
  SoundstageIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CompareIcon,
} from '@/components/ui/Icons';

const techContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const techCardVariants: Variants = {
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

export function TechnicalClaritySection() {
  const specs = [
    {
      title: 'Electrical Camlock Service',
      badge: 'POWER DISTRIBUTION',
      metric: '200A – 1200A 3-Phase',
      description:
        'Verified Camlock tie-in panels engineered for heavy cinema lighting loads, eliminating generator permits on city streets.',
      icon: <CamlockPowerIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Acoustic STC 60+ Isolation',
      badge: 'SOUNDPROOFING',
      metric: 'STC 60 Certified',
      description:
        'Acoustically decoupled wall baffles, sound lock entry vestibules, and silent baffled HVAC for clean sync dialogue capture.',
      icon: <SoundstageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'True Clear Grid Rigging Height',
      badge: 'RIGGING CLEARANCE',
      metric: '18ft – 28ft Clearance',
      description:
        'Measured clearance under pipe and box truss, ensuring your gaffer and key grip know exact overhead rigging boundaries.',
      icon: <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Drive-In Roll-Up Loading Gates',
      badge: 'VEHICLE ACCESS',
      metric: 'Up to 16ft Roll-Up',
      description:
        'Ground-level roll-in bay dimensions verified for 5-ton grip trucks, camera vans, and hero vehicles directly onto the cyc.',
      icon: <TruckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
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
              TECHNICAL CLARITY &amp; TRUST
            </span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            Zero Guesswork on Set.
            <span className="block text-zinc-400 dark:text-zinc-500 font-bold mt-1">
              Every Metric Verified Before Roll.
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            A film set is an engineering environment. We document real technical parameters so your director, DP, and gaffer never encounter surprise limitations on shoot day.
          </p>
        </div>

        {/* 4 Technical Metrics Grid with Motion */}
        <motion.div
          variants={techContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {specs.map((item) => (
            <motion.div
              key={item.title}
              variants={techCardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121216] shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {item.badge}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400 block">
                    {item.metric}
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>On-Site Stage Verified</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Callout Link */}
        <div className="mt-8 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121216] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CompareIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                Side-by-Side Spec Comparison Engine
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">
                Compare electrical tie-ins, acoustic decibel ratings, and dimensions across up to 3 stages simultaneously.
              </span>
            </div>
          </div>

          <Link
            href="/compare"
            className="group shrink-0 inline-flex items-center gap-1.5 font-bold text-zinc-950 dark:text-amber-400 hover:text-amber-600 transition-colors"
          >
            <span>Open Comparison Tool</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
