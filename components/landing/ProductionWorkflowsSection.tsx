'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightIcon, CheckCircleIcon } from '@/components/ui/Icons';

export function ProductionWorkflowsSection() {
  const workflows = [
    {
      id: 'commercial-film',
      title: 'Commercial Film & Video Campaigns',
      shortTitle: 'Commercial & Film',
      subtitle: 'Large soundstages, sync dialogue audio, and heavy power distribution',
      image: '/images/studios/apex-stage-c.svg',
      outcome: 'Acoustically isolated stages with zero audio bleed and turnkey box truss rigging.',
      facilities: ['STC 60+ Soundproof Isolation', '600A 3-Phase Camlock', '24ft Clear Rigging Grid'],
      team: 'IATSE Local 600 DP, Local 728 Gaffer, Boom Sound Recordist',
      gearPackage: 'ARRI Alexa 35 Kit, Cooke S4/i Primes, J.L. Fisher Dolly',
      ctaLabel: 'Explore Soundstages',
      ctaHref: '/studios?category=soundstage',
    },
    {
      id: 'fashion-editorial',
      title: 'Fashion & Editorial Photography',
      shortTitle: 'Fashion & Cyclorama',
      subtitle: 'Seamless infinity cycloramas, natural daylight lofts, and hero car bays',
      image: '/images/studios/greenpoint-cove.svg',
      outcome: 'Flawless infinity backgrounds, soft north-facing light, and ground-floor drive-in vehicle access.',
      facilities: ['1 & 2-Wall Seamless Cycloramas', 'Drive-in Roll-up Gate', 'North-Facing Daylight Sash Windows'],
      team: 'Editorial Photographer, Hair/Makeup Dept Head, Wardrobe Stylist',
      gearPackage: 'Profoto Strobes, Pre-hung Space Lights, Steamer Racks',
      ctaLabel: 'Explore Cycloramas',
      ctaHref: '/studios?category=cyclorama',
    },
    {
      id: 'tabletop-culinary',
      title: 'Product & Culinary Commercials',
      shortTitle: 'Tabletop & Food',
      subtitle: 'Specialized kitchen sets, macro cinematography, and prep kitchens',
      image: '/images/studios/mercer-skylight.svg',
      outcome: 'Fully permitted commercial culinary kitchens with clean power and macro tabletop staging.',
      facilities: ['Commercial Gas Ranges & Hoods', 'Clean 200A Single-Phase', 'Prep Kitchen & Food Styling Island'],
      team: 'Commercial Food Stylist, High-Speed DP, Prop Fabricator',
      gearPackage: 'High-speed Phantom Camera, Macro Cine Lenses, Aputure CS15',
      ctaLabel: 'Explore Kitchen Stages',
      ctaHref: '/studios?category=kitchen',
    },
    {
      id: 'industrial-sets',
      title: 'Raw Industrial & Architectural Filming',
      shortTitle: 'Industrial & Locations',
      subtitle: 'Cleared warehouses, landmark cast-iron lofts, and maritime piers',
      image: '/images/locations/bushwick-brick-warehouse.svg',
      outcome: 'Authentic architectural character with pre-cleared production access and truck parking.',
      facilities: ['Exposed Brick & Timber Beams', 'Freight Elevator Loading', 'Skyline Rooftop Filming Access'],
      team: 'Location Manager, Production Sound Mixer, Key Grip',
      gearPackage: 'Generator Tie-in Cable, Mobile Grip Truck Package',
      ctaLabel: 'Explore Filming Locations',
      ctaHref: '/locations',
    },
  ];

  const [activeTab, setActiveTab] = useState(workflows[0].id);
  const activeWorkflow = workflows.find((w) => w.id === activeTab) || workflows[0];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#09090B] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
              PRODUCTION USE CASES
            </span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            Engineered for Creative Outcomes.
            <span className="block text-zinc-400 dark:text-zinc-500 font-bold mt-1">
              Not Just a List of Buildings.
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Every production has unique engineering constraints. BookMyStudio connects the right space specifications with verified heads of department and camera packages for your specific workflow.
          </p>
        </div>

        {/* Workflow Category Navigation Tabs with Sliding Layout Indicator */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-zinc-200 dark:border-zinc-800 relative">
          {workflows.map((wf) => {
            const isCurrent = activeTab === wf.id;
            return (
              <button
                key={wf.id}
                type="button"
                onClick={() => setActiveTab(wf.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'text-white dark:text-zinc-950'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="workflowActiveTabPill"
                    className="absolute inset-0 bg-zinc-950 dark:bg-amber-500 rounded-xl shadow-xs"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{wf.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Workflow Blueprint Detail Panel with Animated Crossfade */}
        <div className="mt-8 p-6 sm:p-8 lg:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121216] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[460px]">
          
          {/* Left: Workflow Specifications & Execution Blueprint (7 Cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWorkflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 font-mono">
                    WORKFLOW BLUEPRINT
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white mt-1">
                    {activeWorkflow.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {activeWorkflow.outcome}
                  </p>
                </div>

                {/* Spec Breakdown Blocks */}
                <div className="space-y-4 pt-2">
                  {/* Facilities */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                      1. Essential Stage Specifications
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeWorkflow.facilities.map((fac) => (
                        <span
                          key={fac}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{fac}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Department Heads & Gear Package */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                        2. Recommended Crew Roster
                      </span>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {activeWorkflow.team}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                        3. Turnkey Cinema Gear
                      </span>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {activeWorkflow.gearPackage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action CTA Link */}
                <div className="pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                    <Link
                      href={activeWorkflow.ctaHref}
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 text-xs sm:text-sm font-bold transition-all shadow-sm"
                    >
                      <span>{activeWorkflow.ctaLabel}</span>
                      <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Atmospheric Visual Frame (5 Cols) with Animated Transition */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWorkflow.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activeWorkflow.image}
                    alt={activeWorkflow.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-400 block">
                      PROVEN PRODUCTION STAGING
                    </span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      Verified Set Architecture
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
