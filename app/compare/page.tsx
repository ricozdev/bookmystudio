'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { BookingModal } from '@/components/modals/BookingModal';
import {
  CompareIcon,
  StarIcon,
  CheckCircleIcon,
  ShieldPolicyIcon,
  PlusIcon,
} from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';
import { StudioSpace } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';

export default function ComparePage() {
  const {
    comparedStudios,
    comparedStudioIds,
    removeFromCompare,
    clearCompare,
    addToCompare,
    compareLimit,
  } = useMarketplace();

  const [bookingStudio, setBookingStudio] = useState<StudioSpace | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  const [allStudios, setAllStudios] = useState<StudioSpace[]>([]);

  useEffect(() => {
    let active = true;
    marketplaceApi.getStudios().then((res) => {
      if (active && res.success && Array.isArray(res.data)) {
        setAllStudios(res.data);
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Studios available to add (not currently compared)
  const availableStudios = allStudios.filter(
    (s) => !comparedStudioIds.includes(s.id)
  );

  const handleAddDefaultPair = () => {
    clearCompare();
    if (allStudios[0]) addToCompare(allStudios[0].id);
    if (allStudios[1]) addToCompare(allStudios[1].id);
  };

  const handleOpenBooking = (studio: StudioSpace) => {
    setBookingStudio(studio);
    setIsBookingOpen(true);
  };

  return (
    <div className="py-8 bg-white dark:bg-[#09090B] min-h-[calc(100vh-140px)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Studios', href: '/studios' },
            { label: 'Technical Comparison' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                TECHNICAL BENCHMARK MATRIX
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Studio &amp; Soundstage Comparison
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Evaluate floor geometries, overhead rigging capacities, 3-phase Camlock power amperages, acoustic sound isolation ratings, and commercial shoot day rates side-by-side.
            </p>
          </div>

          {/* Top Actions */}
          {comparedStudios.length > 0 && (
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer select-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                />
                <span>Highlight Discrepancies</span>
              </label>

              <button
                type="button"
                onClick={clearCompare}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Matrix
              </button>
            </div>
          )}
        </div>

        {/* Empty State: 0 Studios Selected */}
        {comparedStudios.length === 0 ? (
          <div className="mt-12 space-y-8">
            <EmptyState
              title="No Production Stages Selected for Comparison"
              description="Select up to three commercial cycloramas or soundstages from our directory to evaluate rigging clearances, Camlock distribution, acoustic isolation, and commercial shoot rates side-by-side."
              actionLabel="Explore All Studios"
              actionHref="/studios"
            />

            {/* Quick Demo Comparison Launcher */}
            <div className="max-w-xl mx-auto p-6 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90 text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                ONE-TAP BENCHMARK PRESET
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Compare Our Top 2 NYC Soundstages
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Instantly load Greenpoint Cove vs. Apex Cinema Lot Stage C into the side-by-side comparison matrix.
              </p>
              <button
                type="button"
                onClick={handleAddDefaultPair}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <CompareIcon className="w-4 h-4" />
                <span>Load 2-Stage Comparison Preset</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            
            {/* Low selection prompt: 1 Studio Selected */}
            {comparedStudios.length === 1 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    You have selected <strong>{comparedStudios[0].name}</strong>. Add at least 1 more stage (up to 3 total) to see side-by-side technical differences.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  + Add 2nd Studio
                </button>
              </div>
            )}

            {/* Mobile swipe affordance cue */}
            <div className="sm:hidden flex items-center justify-between text-xs text-zinc-400 px-1 py-1">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Swipe horizontally to compare specs &rarr;
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {comparedStudios.length} {comparedStudios.length === 1 ? 'stage' : 'stages'}
              </span>
            </div>

            {/* Main Comparison Matrix Container */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121216] shadow-sm -mx-4 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[720px]">
                
                {/* Table Header: Studio Visual Cards */}
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
                    <th className="sticky left-0 z-20 bg-zinc-50 dark:bg-[#18181E] p-4 sm:p-6 w-48 sm:w-64 align-top border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                          SPECIFICATION
                        </span>
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                          Comparing {comparedStudios.length} of {compareLimit} Stages
                        </span>
                      </div>
                    </th>

                    {comparedStudios.map((studio) => (
                      <th
                        key={studio.id}
                        className="p-4 sm:p-6 align-top w-72 border-r border-zinc-200/60 dark:border-zinc-800/60 last:border-r-0"
                      >
                        <div className="space-y-3">
                          {/* Image Thumbnail with Remove Button */}
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-zinc-950">
                            <Image
                              src={studio.imageUrl || '/images/studios/apex-stage-c.svg'}
                              alt={studio.name}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeFromCompare(studio.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-950/80 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                              aria-label={`Remove ${studio.name} from comparison`}
                              title="Remove from comparison"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Category & Name */}
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                              {studio.categoryLabel}
                            </span>
                            <h3 className="text-base font-extrabold text-zinc-950 dark:text-white line-clamp-1 mt-0.5">
                              <Link href={`/studios/${studio.slug}`} className="hover:underline">
                                {studio.name}
                              </Link>
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {studio.location}
                            </p>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                            <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{studio.rating.toFixed(2)}</span>
                            <span className="text-[11px] font-normal text-zinc-400">({studio.reviewCount} wraps)</span>
                          </div>

                          {/* Primary Shoot Day Rate & Action CTA */}
                          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase block">10h Flat Commercial Day</span>
                              <div className="text-lg font-black text-zinc-950 dark:text-white">
                                ${studio.dayRate10h.toLocaleString()}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenBooking(studio)}
                              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-xs active:scale-95 cursor-pointer text-center block"
                            >
                              Request Date Hold
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Add Slot if < 3 */}
                    {comparedStudios.length < compareLimit && (
                      <th className="p-4 sm:p-6 align-top w-72 bg-zinc-50/40 dark:bg-zinc-900/20 border-dashed border-2 border-zinc-200 dark:border-zinc-800/80 rounded-2xl">
                        <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                            <PlusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                              Add 3rd Stage
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                              Compare up to 3 certified spaces side-by-side
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Browse Stages to Add
                          </button>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Table Body: Grouped Attributes */}
                <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70 text-xs">
                  
                  {/* GROUP 1: DIMENSIONS & RIGGING */}
                  <tr className="bg-zinc-100/70 dark:bg-zinc-900/80 font-bold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <td colSpan={comparedStudios.length + 2} className="py-2.5 px-4 sm:px-6">
                      <span className="sticky left-4 sm:left-6 inline-block">
                        1. Dimensions, Geometries &amp; Truss Rigging
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Total Floor Area
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className={`py-3.5 px-4 sm:px-6 font-bold tabular-nums border-r border-zinc-200/60 dark:border-zinc-800/60 ${
                          highlightDifferences ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {s.specs.sqFt.toLocaleString()} sq ft
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Ceiling / Truss Clear Height
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className={`py-3.5 px-4 sm:px-6 font-bold tabular-nums border-r border-zinc-200/60 dark:border-zinc-800/60 ${
                          highlightDifferences ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {s.specs.gridHeight}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Loading Gate &amp; Access
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 text-zinc-800 dark:text-zinc-200 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        {s.specs.access}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Max Crew / Client Capacity
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 font-semibold text-zinc-800 dark:text-zinc-200 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        {Math.round(s.specs.sqFt / 65)} max personnel
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  {/* GROUP 2: POWER & ACOUSTICS */}
                  <tr className="bg-zinc-100/70 dark:bg-zinc-900/80 font-bold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <td colSpan={comparedStudios.length + 2} className="py-2.5 px-4 sm:px-6">
                      <span className="sticky left-4 sm:left-6 inline-block">
                        2. Electrical Camlock Service &amp; Soundproofing
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      3-Phase Camlock Amperage
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 font-bold text-amber-700 dark:text-amber-400 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        {s.specs.power}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Acoustic Sound Isolation
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 text-zinc-800 dark:text-zinc-200 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        {s.features.stc60Certified ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircleIcon className="w-4 h-4 shrink-0" />
                            <span>STC 60+ Certified Soundstage</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500">Daylight Studio (Non-Soundstage)</span>
                        )}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Drive-In Vehicle Access
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 text-zinc-800 dark:text-zinc-200 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        {s.features.driveInAccess ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Yes, Direct Roll-up Ramp</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500">Freight Elevator Only</span>
                        )}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  {/* GROUP 3: EQUIPMENT & FACILITIES */}
                  <tr className="bg-zinc-100/70 dark:bg-zinc-900/80 font-bold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <td colSpan={comparedStudios.length + 2} className="py-2.5 px-4 sm:px-6">
                      <span className="sticky left-4 sm:left-6 inline-block">
                        3. Included Equipment &amp; Stage Amenities
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Included Gear Highlight
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        {s.equipmentHighlight}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Amenities &amp; Production Support
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        <div className="space-y-1">
                          {s.amenities.slice(0, 4).map((a) => (
                            <div key={a} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  {/* GROUP 4: COMMERCIAL PRICING SHIFTS */}
                  <tr className="bg-zinc-100/70 dark:bg-zinc-900/80 font-bold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <td colSpan={comparedStudios.length + 2} className="py-2.5 px-4 sm:px-6">
                      <span className="sticky left-4 sm:left-6 inline-block">
                        4. Commercial Pricing Shifts &amp; Insurance
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      5-Hour Half Day Shift
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 font-bold tabular-nums text-zinc-900 dark:text-zinc-100 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        ${Math.round(s.dayRate10h * 0.6).toLocaleString()}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      12-Hour Overnight Shift
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 font-bold tabular-nums text-zinc-900 dark:text-zinc-100 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        ${Math.round(s.dayRate10h * 1.25).toLocaleString()}
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                  <tr>
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#121216] py-3.5 px-4 sm:px-6 font-semibold text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                      Production Liability Insurance
                    </td>
                    {comparedStudios.map((s) => (
                      <td
                        key={s.id}
                        className="py-3.5 px-4 sm:px-6 border-r border-zinc-200/60 dark:border-zinc-800/60"
                      >
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                          <ShieldPolicyIcon className="w-4 h-4 shrink-0" />
                          <span>$2M Direct Endorsement Included</span>
                        </div>
                      </td>
                    ))}
                    {comparedStudios.length < compareLimit && <td className="bg-zinc-50/20 dark:bg-zinc-900/10" />}
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Bottom Recommendation Banner */}
            <div className="p-6 rounded-3xl bg-zinc-950 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm sm:text-base font-bold">
                  Need an On-Site Scout or Multi-Stage Quote?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Our commercial production team can schedule physical walkthroughs and verify tie-in capabilities for your DIT or electric crew.
                </p>
              </div>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all shrink-0 self-start sm:self-auto cursor-pointer"
              >
                Contact Production Desk
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* Studio Selector Drawer / Modal to add 3rd studio */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-overlay-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPickerOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden max-h-[85vh] overflow-y-auto animate-modal-in">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  STAGE DIRECTORY
                </span>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Add Stage to Comparison
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {availableStudios.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">
                  All available production stages are already in your comparison matrix.
                </p>
              ) : (
                availableStudios.map((studio) => (
                  <div
                    key={studio.id}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0">
                        <Image
                          src={studio.imageUrl || '/images/studios/apex-stage-c.svg'}
                          alt={studio.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {studio.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {studio.location} · {studio.specs.sqFt} sq ft
                        </p>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                          ${studio.dayRate10h.toLocaleString()} / 10h
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCompare(studio.id);
                        setPickerOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Date Hold Modal */}
      <BookingModal
        studio={bookingStudio}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

    </div>
  );
}
