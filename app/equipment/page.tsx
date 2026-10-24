'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { MobileFilterSheet } from '@/components/search/MobileFilterSheet';
import { FilterIcon } from '@/components/ui/Icons';
import { EquipmentCategory, EquipmentItem } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';
import { useLocation } from '@/context/LocationContext';
import { LocationFilterBanner } from '@/components/location/LocationFilterBanner';

export default function EquipmentPage() {
  const { location, isNeutral } = useLocation();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'value-desc'>('featured');
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
      .getEquipment(params)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setEquipment(res.data);
        } else {
          setEquipment([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setEquipment([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [location.coordinates, location.radiusKm, isNeutral]);

  const filteredEquipment = useMemo(() => {
    let result = [...equipment];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q) ||
          e.categoryLabel.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.keySpecs.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.dayRate - b.dayRate);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.dayRate - a.dayRate);
    } else if (sortBy === 'value-desc') {
      result.sort((a, b) => b.replacementValue - a.replacementValue);
    }

    return result;
  }, [equipment, searchQuery, selectedCategory, sortBy]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Equipment & Grip' }]} />

      {/* Header */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          PRODUCTION EQUIPMENT MARKETPLACE
        </span>
        <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Production Equipment &amp; Grip Packages
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Pre-inspected cinema camera packages, point-source color LED fixtures, audio field recorders, and hydraulic dollies.
        </p>
      </div>

      {/* Location Filter Banner */}
      <LocationFilterBanner categoryName="Cinema Equipment & Packages" totalFound={filteredEquipment.length} className="mt-5" />

      {/* Toolbar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Keyword Search + Mobile Filter Button */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search gear by brand (ARRI, Aputure, Sound Devices, Fisher)..."
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
            <label htmlFor="eqSortSelect" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Sort By:
            </label>
            <select
              id="eqSortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="featured">Featured Gear</option>
              <option value="price-asc">Day Rate: Low to High</option>
              <option value="price-desc">Day Rate: High to Low</option>
              <option value="value-desc">Highest Replacement Value</option>
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
            All Inventory
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('cameras')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'cameras'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Cinema Cameras
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('lighting')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'lighting'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            LED &amp; HMI Lighting
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('audio')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'audio'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Sound &amp; Wireless
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('grip')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'grip'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Dollies &amp; Grip
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
          Showing <strong className="text-zinc-950 dark:text-white font-bold">{loading ? '...' : filteredEquipment.length}</strong> equipment {filteredEquipment.length === 1 ? 'kit' : 'kits'}
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">All rentals backed by $250,000 inland marine equipment floater policy</span>
      </div>

      {/* Equipment Grid */}
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
        ) : filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEquipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No equipment matched your search"
            description="Try searching for another manufacturer (e.g. ARRI, Sound Devices, Aputure) or reset your filters."
            actionLabel="Reset Equipment Filters"
            onAction={resetAllFilters}
          />
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Production Equipment"
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat as EquipmentCategory | 'all')}
        categories={[
          { id: 'all', label: 'All Equipment' },
          { id: 'cameras', label: 'Cinema Cameras' },
          { id: 'lighting', label: 'Lighting Fixtures' },
          { id: 'audio', label: 'Audio & Field Mixers' },
          { id: 'grip', label: 'Grip & Dollies' },
        ]}
        sortBy={sortBy}
        onSelectSortBy={(sort) => setSortBy(sort as typeof sortBy)}
        sortOptions={[
          { id: 'featured', label: 'Featured Gear' },
          { id: 'price-asc', label: 'Day Rate: Low to High' },
          { id: 'price-desc', label: 'Day Rate: High to Low' },
          { id: 'value-desc', label: 'Highest Replacement Value' },
        ]}
        onResetFilters={resetAllFilters}
        totalResultsCount={filteredEquipment.length}
      />
    </div>
  );
}
