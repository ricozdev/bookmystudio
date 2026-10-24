'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LocationPinIcon,
  ArchetypeIcon,
  CalendarIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  ShieldPolicyIcon,
  CheckIcon,
  SearchIcon,
} from '@/components/ui/Icons';
import { LOCATION_OPTIONS, STAGE_TYPE_OPTIONS, SHIFT_OPTIONS } from '@/lib/data';

interface HeroSearchProps {
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  selectedStageType: string;
  onSelectStageType: (type: string) => void;
  selectedShift: { label: string; times: string };
  onSelectShift: (shift: { label: string; times: string }) => void;
  activeQuickFilters: string[];
  onToggleQuickFilter: (filterKey: string) => void;
  onFindStudios?: () => void;
}

export function HeroSearch({
  selectedLocation,
  onSelectLocation,
  selectedStageType,
  onSelectStageType,
  selectedShift,
  onSelectShift,
  activeQuickFilters,
  onToggleQuickFilter,
  onFindStudios,
}: HeroSearchProps) {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'stage' | 'date' | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Outside click and Escape key dismissal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchClick = () => {
    if (onFindStudios) {
      onFindStudios();
      return;
    }
    const params = new URLSearchParams();
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedStageType) params.set('stageType', selectedStageType);
    if (activeQuickFilters.length > 0) params.set('filters', activeQuickFilters.join(','));
    router.push(`/search?${params.toString()}`);
  };

  const quickFilterOptions = [
    { key: 'camlockPower', label: '600A Camlock' },
    { key: 'driveInAccess', label: 'Drive-in Bay' },
    { key: 'stc60Certified', label: 'STC 60+ Soundproof' },
    { key: 'northDaylight', label: 'North Daylight' },
  ];

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 bg-white dark:bg-[#09090B] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================
           SPLIT HERO COMPOSITION (7 Col Left / 5 Col Right)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ----------------------------------------------------
             LEFT COLUMN: Editorial Copy & Rebuilt Search Matrix
             ---------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
                COMMERCIAL PRODUCTION MARKETPLACE
              </span>
            </div>

            {/* Main Headline with Controlled Rhythm */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Production Studios &amp; Soundstages.
              <span className="block text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                Built for Commercial Wrap.
              </span>
            </h1>

            {/* Concise Supporting Explanation */}
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl font-normal">
              Direct booking for certified cycloramas, STC 60 soundstages, daylight lofts, and industrial filming locations across New York with transparent 10-hour day rates.
            </p>

            {/* RE-ENGINEERED SEARCH MATRIX (What · Where · When · Action) */}
            <div className="pt-2" ref={searchContainerRef}>
              <div className="p-2 rounded-2xl bg-zinc-100/90 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  
                  {/* Field 1: WHAT — Space Type (Span 4) */}
                  <div className="sm:col-span-4 relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'stage' ? null : 'stage')}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800/90 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors text-left cursor-pointer border border-zinc-200/80 dark:border-zinc-700 min-h-[44px]"
                      aria-expanded={activeDropdown === 'stage'}
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300">
                        <ArchetypeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                          1. Space Archetype
                        </span>
                        <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {selectedStageType}
                        </span>
                      </div>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </button>

                    {/* Dropdown Options */}
                    {activeDropdown === 'stage' && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-dropdown-in">
                        <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Select Space Category
                        </div>
                        {STAGE_TYPE_OPTIONS.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              onSelectStageType(type);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              selectedStageType === type
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span>{type}</span>
                            {selectedStageType === type && <CheckIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Field 2: WHERE — Production Hub (Span 4) */}
                  <div className="sm:col-span-4 relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800/90 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors text-left cursor-pointer border border-zinc-200/80 dark:border-zinc-700 min-h-[44px]"
                      aria-expanded={activeDropdown === 'location'}
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300">
                        <LocationPinIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                          2. Market Hub
                        </span>
                        <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {selectedLocation}
                        </span>
                      </div>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </button>

                    {/* Dropdown Options */}
                    {activeDropdown === 'location' && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-dropdown-in">
                        <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Select Market Location
                        </div>
                        {LOCATION_OPTIONS.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              onSelectLocation(loc);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              selectedLocation === loc
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span>{loc}</span>
                            {selectedLocation === loc && <CheckIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Field 3: WHEN & ACTION (Span 4) */}
                  <div className="sm:col-span-4 flex items-center gap-2">
                    {/* Shift Dropdown */}
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800/90 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors text-left cursor-pointer border border-zinc-200/80 dark:border-zinc-700 min-h-[44px]"
                        aria-expanded={activeDropdown === 'date'}
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                            3. Shift
                          </span>
                          <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {selectedShift.label.split(' ')[0]} Shift
                          </span>
                        </div>
                        <ChevronDownIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                      </button>

                      {/* Dropdown Options */}
                      {activeDropdown === 'date' && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-dropdown-in">
                          <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Shoot Day Call Times
                          </div>
                          {SHIFT_OPTIONS.map((shift) => (
                            <button
                              key={shift.label}
                              type="button"
                              onClick={() => {
                                onSelectShift(shift);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                selectedShift.label === shift.label
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <div>
                                <div>{shift.label}</div>
                                <div className="text-[10px] text-zinc-400">{shift.times}</div>
                              </div>
                              {selectedShift.label === shift.label && <CheckIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Primary Search CTA Button */}
                    <button
                      type="button"
                      onClick={handleSearchClick}
                      className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 min-h-[44px]"
                      aria-label="Search Stages"
                    >
                      <SearchIcon className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Subordinate Quick Technical Filters */}
              <div className="mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1">
                  Filters:
                </span>
                {quickFilterOptions.map((filter) => {
                  const active = activeQuickFilters.includes(filter.key);
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => onToggleQuickFilter(filter.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                        active
                          ? 'bg-amber-500 text-white dark:text-zinc-950 font-bold border-amber-600 dark:border-amber-400 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* Subordinate Insurance & Standard Note */}
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <ShieldPolicyIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[11px]">
                  All bookings include $2,000,000 direct production liability insurance naming host as additional insured.
                </span>
              </div>
            </div>

          </div>

          {/* ----------------------------------------------------
             RIGHT COLUMN: Editorial Visual Storytelling Anchor
             ---------------------------------------------------- */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-zinc-950 shadow-2xl group">
              
              {/* Primary High-Resolution Stage Image */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-zinc-950">
                <Image
                  src="/images/studios/apex-stage-c.svg"
                  alt="Apex Soundstage 4 with overhead box truss lighting grid"
                  fill
                  priority
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />
                
                {/* Subtle gradient vignette for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />

                {/* Top Badge: Certified Commercial Soundstage */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-zinc-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                    STAGE SPECIMEN #04
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    LIVE
                  </span>
                </div>
              </div>

              {/* Anchored Technical Metadata Card */}
              <div className="p-4 sm:p-5 bg-zinc-950/95 dark:bg-[#121216]/95 border-t border-zinc-800/80 backdrop-blur-md space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Apex Soundstage 4
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Long Island City, Queens · STC 60+ Certified Silent
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-sm sm:text-base font-mono font-extrabold text-amber-400">
                      $2,800
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                      10h Day Rate
                    </span>
                  </div>
                </div>

                {/* Key Technical Specs Pill Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-xs">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                      Dimensions
                    </span>
                    <span className="font-mono font-semibold text-zinc-200 text-xs">
                      5,500 sq ft
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                      Rigging Grid
                    </span>
                    <span className="font-mono font-semibold text-zinc-200 text-xs">
                      24&apos; Clear
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                      Power
                    </span>
                    <span className="font-mono font-semibold text-zinc-200 text-xs">
                      600A 3-Phase
                    </span>
                  </div>
                </div>

                {/* Action CTA Link */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <Link
                    href="/studios/apex-cinema-lot-stage-c"
                    className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect Technical Rigging Specs</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] text-zinc-500">
                    Drive-in Vehicle Gate
                  </span>
                </div>
              </div>

            </div>

            {/* Overlapping Floating Daylight Lofts Thumbnail Pill */}
            <div className="hidden sm:flex absolute -bottom-4 -left-4 items-center gap-3 p-2.5 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-md">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                <Image
                  src="/images/studios/greenpoint-cove.svg"
                  alt="Greenpoint Cyclorama Cove"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-zinc-950 dark:text-white">
                  The Greenpoint Cove
                </span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Seamless 2-Wall Cyc · $1,400/day
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
