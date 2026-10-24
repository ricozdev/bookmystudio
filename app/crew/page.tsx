'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { CrewCard } from '@/components/crew/CrewCard';
import { MobileFilterSheet } from '@/components/search/MobileFilterSheet';
import { FilterIcon } from '@/components/ui/Icons';
import { CrewRoleCategory, ProductionCrewMember } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';
import { useLocation } from '@/context/LocationContext';
import { LocationFilterBanner } from '@/components/location/LocationFilterBanner';

export default function CrewPage() {
  const { location, isNeutral } = useLocation();
  const [crew, setCrew] = useState<ProductionCrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CrewRoleCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating-desc' | 'price-asc' | 'price-desc'>('rating-desc');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const params: Record<string, string | number> = {};
    if (!isNeutral && location.coordinates && location.coordinates.length === 2) {
      params.lng = location.coordinates[0];
      params.lat = location.coordinates[1];
    }
    if (location.radiusKm) {
      params.radiusKm = location.radiusKm;
    }

    marketplaceApi
      .getProfessionals(params)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setCrew(res.data);
        } else {
          setCrew([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setCrew([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [location.coordinates, location.radiusKm, isNeutral]);

  const filteredCrew = useMemo(() => {
    let result = [...crew];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.credits.toLowerCase().includes(q) ||
          c.workingKit.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.unionAffiliation.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.dayRate10h - b.dayRate10h);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.dayRate10h - a.dayRate10h);
    }

    return result;
  }, [crew, searchQuery, selectedCategory, sortBy]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('rating-desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Production Crew' }]} />

      {/* Header */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          CALL SHEET TALENT ROSTER
        </span>
        <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Hire Verified Heads of Department &amp; Key Crew
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Insured Union (IATSE Local 52/600/798) Gaffers, DPs, Sound Mixers, and Stylists equipped with standard working gear packages.
        </p>
      </div>

      {/* Location Filter Banner */}
      <LocationFilterBanner categoryName="Crew & Heads of Department" totalFound={filteredCrew.length} className="mt-5" />

      {/* Toolbar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Keyword Search + Mobile Filter Button */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search crew by department, union local, gear kit, or credits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 min-h-[44px] text-base sm:text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-[#121216] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              <svg
                className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 w-6 h-6 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs cursor-pointer"
                  aria-label="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Filter Sheet Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
              aria-label="Open filter panel"
            >
              <FilterIcon className="w-4 h-4" />
              <span>Filters</span>
              {selectedCategory !== 'all' && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Desktop Sort Select */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <label htmlFor="crewSortSelect" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Sort By:
            </label>
            <select
              id="crewSortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="rating-desc">Highest Rated Professionals</option>
              <option value="price-asc">Day Rate: Low to High</option>
              <option value="price-desc">Day Rate: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Mobile Horizontal Scrolling) */}
        <div className="flex overflow-x-auto pb-1 scrollbar-none items-center gap-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            All Departments
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('camera_lighting')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'camera_lighting'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Camera &amp; Cinematography
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('grip_sound')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'grip_sound'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Gaffer &amp; Sound Mixers
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('styling_art')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'styling_art'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Hair, Makeup &amp; Styling
          </button>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline ml-2 cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Meta Bar */}
      <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span>
          Showing <strong className="text-zinc-950 dark:text-white font-bold">{loading ? '...' : filteredCrew.length}</strong> department {filteredCrew.length === 1 ? 'head' : 'heads'}
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">All crew covered under production insurance &amp; workers comp</span>
      </div>

      {/* Crew Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-4 space-y-3 animate-pulse"
              >
                <div className="w-full h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-2/3 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-1/2 h-3 rounded bg-zinc-150 dark:bg-zinc-850" />
                <div className="w-1/3 h-4 rounded bg-zinc-200 dark:bg-zinc-800 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredCrew.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCrew.map((member) => (
              <CrewCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No crew members match your search"
            description="Try searching for a different role or reset the department filter to view all vetted talent."
            actionLabel="Reset Crew Filters"
            onAction={resetAllFilters}
          />
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Production Crew"
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat as CrewRoleCategory | 'all')}
        categories={[
          { id: 'all', label: 'All Departments' },
          { id: 'camera_lighting', label: 'Camera & Cinematography' },
          { id: 'grip_sound', label: 'Gaffer & Sound Mixers' },
          { id: 'styling_art', label: 'Hair, Makeup & Styling' },
        ]}
        sortBy={sortBy}
        onSelectSortBy={(sort) => setSortBy(sort as typeof sortBy)}
        sortOptions={[
          { id: 'rating-desc', label: 'Highest Rated Professionals' },
          { id: 'price-asc', label: 'Day Rate: Low to High' },
          { id: 'price-desc', label: 'Day Rate: High to Low' },
        ]}
        onResetFilters={resetAllFilters}
        totalResultsCount={filteredCrew.length}
      />
    </div>
  );
}
