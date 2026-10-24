'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CycloramaCategoryIcon,
  SoundstageIcon,
  SunDaylightIcon,
  WarehouseIcon,
  GearCrateIcon,
  CamlockPowerIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

export function MarketplaceDiscoveryCards() {
  return (
    <section className="py-12 sm:py-16 bg-zinc-50 dark:bg-[#0E0E12] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
                MARKETPLACE DIRECTORY
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              Curated Production Environments
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Purpose-built facilities engineered for cinema lighting, synchronized audio capture, and large commercial crew footprints.
            </p>
          </div>

          <Link
            href="/search"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 shrink-0 transition-colors group cursor-pointer"
          >
            <span>Browse Complete Inventory</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ========================================================
           EDITORIAL ASYMMETRIC DIRECTORY GRID
           ======================================================== */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* ROW 1: Two Anchor Pillars (Cycloramas & Soundstages) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            
            {/* Featured Card 1: Cyclorama Studios */}
            <Link
              href="/studios?category=cyclorama"
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer"
            >
              <div className="relative w-full sm:w-44 h-36 sm:h-36 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                <Image
                  src="/images/studios/greenpoint-cove.svg"
                  alt="Cyclorama Cove Studio"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-zinc-950/80 text-white backdrop-blur-xs">
                  114 Stages
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <CycloramaCategoryIcon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Cyclorama Studios
                  </h3>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  1 &amp; 2-wall seamless infinity coves with ground-level roll-in vehicle loading, pre-rigged space lights, and dedicated cyc repaint services.
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>Explore Cycloramas</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            {/* Featured Card 2: Commercial Soundstages */}
            <Link
              href="/studios?category=soundstage"
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer"
            >
              <div className="relative w-full sm:w-44 h-36 sm:h-36 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                <Image
                  src="/images/studios/apex-stage-c.svg"
                  alt="Soundstage Stage"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-zinc-950/80 text-white backdrop-blur-xs">
                  48 Stages
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <SoundstageIcon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Commercial Soundstages
                  </h3>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  STC 60+ certified soundproof stages with heavy 600A+ 3-phase Camlock power distribution, 24ft+ box truss grids, and silent HVAC.
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>Explore Soundstages</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

          </div>

          {/* ROW 2: Four Specialized Categories (Daylight, Locations, Crew, Equipment) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Card 3: Daylight Lofts */}
            <Link
              href="/studios?category=daylight"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <SunDaylightIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    76 Spaces
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Daylight Lofts
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Factory sash windows, north skylights, and unobstructed natural illumination for editorial stills.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                <span>View Lofts</span>
                <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Card 4: Filming Locations */}
            <Link
              href="/locations"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <WarehouseIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    54 Sets
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Filming Locations
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Raw brick industrial warehouses, cast-iron lofts, maritime piers, and skyline rooftops cleared for filming.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                <span>View Locations</span>
                <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Card 5: Production Crew */}
            <Link
              href="/crew"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <GearCrateIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    90+ Crew
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Production Crew
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Verified IATSE Local 52/600/798 DPs, Gaffers, and Sound Recordists with standard gear packages.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                <span>View Crew Roster</span>
                <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Card 6: Equipment & Grip */}
            <Link
              href="/equipment"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <CamlockPowerIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    120+ Kits
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Equipment Packages
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Turnkey ARRI Alexa 35 systems, high-CRI color LEDs, sound recorders, and hydraulic dollies.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                <span>View Packages</span>
                <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}
