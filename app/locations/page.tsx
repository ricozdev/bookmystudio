'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { LocationCard } from '@/components/locations/LocationCard';
import { MobileFilterSheet } from '@/components/search/MobileFilterSheet';
import { FilterIcon } from '@/components/ui/Icons';
import { LocationCategory, FilmingLocation } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';
import { useLocation } from '@/context/LocationContext';
import { LocationFilterBanner } from '@/components/location/LocationFilterBanner';

export default function LocationsPage() {
  const { location, isNeutral } = useLocation();
  const [locations, setLocations] = useState<FilmingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'area-desc'>('featured');
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
      .getLocations(params)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setLocations(res.data);
        } else {
          setLocations([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setLocations([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [location.coordinates, location.radiusKm, isNeutral]);

  const filteredLocations = useMemo(() => {
    let result = [...locations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.submarket.toLowerCase().includes(q) ||
          l.categoryLabel.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.dayRate10h - b.dayRate10h);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.dayRate10h - a.dayRate10h);
    } else if (sortBy === 'area-desc') {
      result.sort((a, b) => b.areaSqFt - a.areaSqFt);
    }

    return result;
  }, [locations, searchQuery, selectedCategory, sortBy]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Filming Locations' }]} />

      {/* Header */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          LOCATION SCOUTING DIRECTORY
        </span>
        <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Filming Locations &amp; Industrial Sets
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Pre-scouted brick warehouses, landmark lofts, deep-water pier terminals, and rooftop panoramas permitted for commercial filming.
        </p>
      </div>

      {/* Location Filter Banner */}
      <LocationFilterBanner categoryName="Filming Locations" totalFound={filteredLocations.length} className="mt-5" />

      {/* Toolbar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Keyword Search + Mobile Filter Button */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search locations by architectural style, dock access, or zoning..."
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
            <label htmlFor="locationSortSelect" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Sort By:
            </label>
            <select
              id="locationSortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="featured">Featured Hubs</option>
              <option value="price-asc">Day Rate: Low to High</option>
              <option value="price-desc">Day Rate: High to Low</option>
              <option value="area-desc">Area: Largest Space</option>
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
            All Spaces
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('warehouse')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'warehouse'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Brick Warehouses
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('loft')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'loft'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Cast-Iron Lofts
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('industrial')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'industrial'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Maritime Docks
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('rooftop')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'rooftop'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Rooftop Panoramas
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
          Showing <strong className="text-zinc-950 dark:text-white font-bold">{loading ? '...' : filteredLocations.length}</strong> filming {filteredLocations.length === 1 ? 'location' : 'locations'}
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">All locations supported by NYC MOFTB liaison team</span>
      </div>

      {/* Locations Grid */}
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
        ) : filteredLocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredLocations.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No filming locations matched your search"
            description="Try searching for a different neighborhood or reset the category filter to view all production properties."
            actionLabel="Reset Location Filters"
            onAction={resetAllFilters}
          />
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Filming Locations"
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat as LocationCategory | 'all')}
        categories={[
          { id: 'all', label: 'All Spaces' },
          { id: 'warehouse', label: 'Industrial Warehouses' },
          { id: 'loft', label: 'Cast-Iron Lofts' },
          { id: 'commercial', label: 'Commercial Buildings' },
          { id: 'rooftop', label: 'Rooftops' },
          { id: 'industrial', label: 'Maritime Docks' },
        ]}
        sortBy={sortBy}
        onSelectSortBy={(sort) => setSortBy(sort as typeof sortBy)}
        sortOptions={[
          { id: 'featured', label: 'Featured Hubs' },
          { id: 'price-asc', label: 'Day Rate: Low to High' },
          { id: 'price-desc', label: 'Day Rate: High to Low' },
          { id: 'area-desc', label: 'Area: Largest Space' },
        ]}
        onResetFilters={resetAllFilters}
        totalResultsCount={filteredLocations.length}
      />
    </div>
  );
}
