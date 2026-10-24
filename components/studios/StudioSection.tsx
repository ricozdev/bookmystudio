'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StudioCard } from './StudioCard';
import { StudioSpace, StudioCategory } from '@/lib/types';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { ScrollReveal } from '@/components/common/ScrollReveal';

interface StudioSectionProps {
  studios: StudioSpace[];
  selectedCategory: StudioCategory | 'all';
  activeQuickFilters: string[];
  bookmarkedStudioIds: string[];
  onToggleBookmark: (id: string) => void;
  onCheckDates: (studio: StudioSpace) => void;
  onOpenRfpModal: () => void;
}

export function StudioSection({
  studios,
  selectedCategory,
  activeQuickFilters,
  bookmarkedStudioIds,
  onToggleBookmark,
  onCheckDates,
  onOpenRfpModal,
}: StudioSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'soundproof' | 'drive_in'>('all');

  // Filter studios based on tab, category, and quick filters
  const filteredStudios = useMemo(() => {
    return studios.filter((studio) => {
      // Tab filter
      if (activeTab === 'soundproof' && !studio.features.stc60Certified) {
        return false;
      }
      if (activeTab === 'drive_in' && !studio.features.driveInAccess) {
        return false;
      }

      // Category filter (if selected)
      if (selectedCategory !== 'all' && studio.category !== selectedCategory) {
        return false;
      }

      // Quick filter checks
      if (activeQuickFilters.includes('camlockPower') && !studio.features.camlockPower) {
        return false;
      }
      if (activeQuickFilters.includes('driveInAccess') && !studio.features.driveInAccess) {
        return false;
      }
      if (activeQuickFilters.includes('stc60Certified') && !studio.features.stc60Certified) {
        return false;
      }
      if (activeQuickFilters.includes('northDaylight') && !studio.features.northDaylight) {
        return false;
      }
      if (activeQuickFilters.includes('gripPackageIncluded') && !studio.features.gripPackageIncluded) {
        return false;
      }

      return true;
    });
  }, [studios, activeTab, selectedCategory, activeQuickFilters]);

  return (
    <section id="studios" className="py-14 sm:py-16 bg-white dark:bg-[#101010] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Live Filter Tabs with Scroll Reveal */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-[#202020]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
                  VERIFIED STUDIO DIRECTORY
                </span>
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
                Available Production Stages &amp; Daylight Suites
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-[#B3B3B3] max-w-2xl leading-relaxed">
                Certified structural truss ratings, whisper-quiet continuous HVAC, and three-phase Cam-lock power ready for call sheets.
              </p>
            </div>

            {/* Filter Tabs on Right */}
            <div className="flex items-center bg-slate-100/90 dark:bg-[#181818] p-1 rounded-xl shrink-0 self-start md:self-auto border border-transparent dark:border-[#303030]">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#B3B3B3] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
                }`}
              >
                All Stages (142)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('soundproof')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'soundproof'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#B3B3B3] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
                }`}
              >
                Soundproof Only
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('drive_in')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'drive_in'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#B3B3B3] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
                }`}
              >
                Drive-In Access
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 4-Column Studio Listings Grid with Staggered Scroll Reveals */}
        <div className="mt-8">
          {filteredStudios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredStudios.map((studio, index) => (
                <ScrollReveal key={studio.id} delay={index * 60}>
                  <StudioCard
                    studio={studio}
                    isBookmarked={bookmarkedStudioIds.includes(studio.id)}
                    onToggleBookmark={onToggleBookmark}
                    onCheckDates={onCheckDates}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200 dark:border-[#303030] p-8">
              <h3 className="text-base font-bold text-slate-800 dark:text-[#F5F5F5]">
                No stages currently match this combination of technical requirements
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8A8A] max-w-md mx-auto">
                Try toggling off specific filters like 600A Camlock or Soundproof to view all certified commercial stages in this submarket.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Stage Filters
              </button>
            </div>
          )}
        </div>

        {/* Multi-Day Pre-Rigging & DOB Permit Support Callout Banner */}
        <ScrollReveal delay={150}>
          <div className="mt-10 rounded-2xl border border-slate-200 dark:border-[#303030] bg-slate-50/80 dark:bg-[#181818] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bento-card-interactive shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-[#202020] flex items-center justify-center text-white shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F5F5F5]">
                  Need multi-day pre-rigging, generator taps, or DOB permits?
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8A8A8A] mt-0.5">
                  Our facility coordinators handle architectural structural load approvals, street permits, and heavy power tie-ins directly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenRfpModal}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#454545] bg-white dark:bg-[#202020] hover:bg-slate-100 dark:hover:bg-[#262626] text-slate-800 dark:text-[#F5F5F5] text-xs font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Submit Stage RFP
              </button>
              <Link
                href="/studios"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Explore All 140+ Stages</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
