'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { StudioCard } from '@/components/studios/StudioCard';
import { MobileFilterSheet } from '@/components/search/MobileFilterSheet';
import { BookingModal } from '@/components/modals/BookingModal';
import {
  FilterIcon,
  CompareIcon,
  BookmarkIcon,
  StarIcon,
  ZapIcon,
  TruckIcon,
} from '@/components/ui/Icons';
import { StudioCategory, StudioSpace } from '@/lib/types';
import { useMarketplace } from '@/context/MarketplaceContext';
import { marketplaceApi } from '@/lib/api/marketplace';
import { useLocation } from '@/context/LocationContext';
import { LocationFilterBanner } from '@/components/location/LocationFilterBanner';

function StudiosContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { location, isNeutral } = useLocation();

  // Studios dataset with live API hydration and location awareness
  const [studios, setStudios] = useState<StudioSpace[]>([]);
  const [loading, setLoading] = useState(true);

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
      .getStudios(params)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setStudios(res.data);
        } else {
          setStudios([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setStudios([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [location.coordinates, location.radiusKm, isNeutral]);

  // URL Params Initialization
  const initialCategory = (searchParams.get('category') as StudioCategory | 'all') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialPriceTier = searchParams.get('price') || 'all';
  const initialMinSqFt = searchParams.get('minSqFt') || 'all';
  const initialCamlock = searchParams.get('camlock') === 'true';
  const initialDriveIn = searchParams.get('driveIn') === 'true';
  const initialSoundproof = searchParams.get('soundproof') === 'true';
  const initialSort = (searchParams.get('sort') as 'featured' | 'price-asc' | 'price-desc' | 'size-desc' | 'rating-desc') || 'featured';
  const initialView = (searchParams.get('view') as 'grid' | 'matrix') || 'grid';

  // State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<StudioCategory | 'all'>(initialCategory);
  const [priceTier, setPriceTier] = useState<string>(initialPriceTier);
  const [minSqFt, setMinSqFt] = useState<string>(initialMinSqFt);
  const [camlockOnly, setCamlockOnly] = useState(initialCamlock);
  const [driveInOnly, setDriveInOnly] = useState(initialDriveIn);
  const [soundproofOnly, setSoundproofOnly] = useState(initialSoundproof);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'size-desc' | 'rating-desc'>(initialSort);
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>(initialView);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeBookingStudio, setActiveBookingStudio] = useState<StudioSpace | null>(null);

  const { toggleBookmark, isBookmarked, toggleCompare, isCompared, canAddMoreCompare } = useMarketplace();

  // Synchronize URL with active filters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (priceTier !== 'all') params.set('price', priceTier);
    if (minSqFt !== 'all') params.set('minSqFt', minSqFt);
    if (camlockOnly) params.set('camlock', 'true');
    if (driveInOnly) params.set('driveIn', 'true');
    if (soundproofOnly) params.set('soundproof', 'true');
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (viewMode !== 'grid') params.set('view', viewMode);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, selectedCategory, priceTier, minSqFt, camlockOnly, driveInOnly, soundproofOnly, sortBy, viewMode, pathname]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Filtered and Sorted Studios
  const filteredStudios = useMemo(() => {
    let result = [...studios];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.submarket.toLowerCase().includes(q) ||
          s.equipmentHighlight.toLowerCase().includes(q) ||
          s.categoryLabel.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Price Tier filter
    if (priceTier === 'under-1500') {
      result = result.filter((s) => s.dayRate10h < 1500);
    } else if (priceTier === '1500-2500') {
      result = result.filter((s) => s.dayRate10h >= 1500 && s.dayRate10h <= 2500);
    } else if (priceTier === 'over-2500') {
      result = result.filter((s) => s.dayRate10h > 2500);
    }

    // Min Square Footage filter
    if (minSqFt !== 'all') {
      const minVal = Number(minSqFt);
      if (!isNaN(minVal)) {
        result = result.filter((s) => s.specs.sqFt >= minVal);
      }
    }

    // Technical feature filters
    if (camlockOnly) {
      result = result.filter((s) => s.features.camlockPower);
    }
    if (driveInOnly) {
      result = result.filter((s) => s.features.driveInAccess);
    }
    if (soundproofOnly) {
      result = result.filter((s) => s.features.stc60Certified);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.dayRate10h - b.dayRate10h);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.dayRate10h - a.dayRate10h);
    } else if (sortBy === 'size-desc') {
      result.sort((a, b) => b.specs.sqFt - a.specs.sqFt);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [studios, searchQuery, selectedCategory, priceTier, minSqFt, camlockOnly, driveInOnly, soundproofOnly, sortBy]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceTier('all');
    setMinSqFt('all');
    setCamlockOnly(false);
    setDriveInOnly(false);
    setSoundproofOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    priceTier !== 'all' ||
    minSqFt !== 'all' ||
    camlockOnly ||
    driveInOnly ||
    soundproofOnly;

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (priceTier !== 'all' ? 1 : 0) +
    (minSqFt !== 'all' ? 1 : 0) +
    (camlockOnly ? 1 : 0) +
    (driveInOnly ? 1 : 0) +
    (soundproofOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Production Studios' }]} />

      {/* Header Banner */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            CERTIFIED STAGES MARKETPLACE
          </span>
          <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Production Studios &amp; Soundstages
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Discover verified cycloramas, soundproof soundstages, natural daylight lofts, and culinary production stages ready for commercial wraps.
          </p>
        </div>

        {/* View Switcher: Grid vs Tech Spec Matrix */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
            aria-label="Grid view"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Stage Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
            aria-label="Spec matrix view"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Tech Spec Matrix</span>
          </button>
        </div>
      </div>

      {/* Global Location Awareness Banner */}
      <LocationFilterBanner categoryName="Studios" totalFound={filteredStudios.length} className="mt-5" />

      {/* Search & Filter Toolbar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Keyword Search Input + Mobile Filter Button */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search stages by name, neighborhood, or lighting grid..."
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
              className="md:hidden flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-zinc-950 dark:bg-amber-500 text-white dark:text-zinc-950 text-xs font-bold shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
              aria-label="Open filter panel"
            >
              <FilterIcon className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 dark:bg-zinc-950 text-white dark:text-amber-400 text-[10px] font-extrabold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filter Controls: Price Tier & Min SqFt & Sort */}
          <div className="hidden md:flex items-center gap-3 shrink-0 flex-wrap">
            {/* Price Tier Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="priceFilter" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Rate:
              </label>
              <select
                id="priceFilter"
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Any Rate</option>
                <option value="under-1500">&lt; $1,500/day</option>
                <option value="1500-2500">$1,500 - $2,500</option>
                <option value="over-2500">$2,500+/day</option>
              </select>
            </div>

            {/* Min Sq Ft Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="sqFtFilter" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Footprint:
              </label>
              <select
                id="sqFtFilter"
                value={minSqFt}
                onChange={(e) => setMinSqFt(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Any Footprint</option>
                <option value="2000">2,000+ sq ft</option>
                <option value="3500">3,500+ sq ft</option>
                <option value="5000">5,000+ sq ft</option>
              </select>
            </div>

            {/* Desktop Sort Control */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="sortSelect" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Sort:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="featured">Featured Hubs</option>
                <option value="price-asc">Day Rate: Low to High</option>
                <option value="price-desc">Day Rate: High to Low</option>
                <option value="size-desc">Stage Size: Largest First</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills & Spec Toggles Row (Mobile Horizontal Scrolling) */}
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
            All Categories
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('cyclorama')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'cyclorama'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Cycloramas
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('soundstage')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'soundstage'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Soundstages
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('daylight')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'daylight'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Daylight Lofts
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('kitchen')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === 'kitchen'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            Kitchen Stages
          </button>

          <span className="text-zinc-300 dark:text-zinc-700 mx-1 hidden sm:inline">|</span>

          {/* Quick Technical Filters */}
          <button
            type="button"
            onClick={() => setCamlockOnly(!camlockOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
              camlockOnly
                ? 'bg-amber-500 text-white dark:text-zinc-950 border-amber-600 dark:border-amber-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <ZapIcon className={`w-3.5 h-3.5 ${camlockOnly ? 'text-white dark:text-zinc-950' : 'text-zinc-400'}`} />
            <span>3-Phase Camlock</span>
          </button>

          <button
            type="button"
            onClick={() => setDriveInOnly(!driveInOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
              driveInOnly
                ? 'bg-amber-500 text-white dark:text-zinc-950 border-amber-600 dark:border-amber-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <TruckIcon className={`w-3.5 h-3.5 ${driveInOnly ? 'text-white dark:text-zinc-950' : 'text-zinc-400'}`} />
            <span>Drive-in Bay</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundproofOnly(!soundproofOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
              soundproofOnly
                ? 'bg-amber-500 text-white dark:text-zinc-950 border-amber-600 dark:border-amber-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${soundproofOnly ? 'text-white dark:text-zinc-950' : 'text-zinc-400'}`}>
              dB
            </span>
            <span>STC 60+ Soundproof</span>
          </button>
        </div>

        {/* Active Filter Chips / Badges Row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium">
                <span>Keyword: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-amber-500 ml-0.5 cursor-pointer"
                  aria-label="Remove search filter"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium capitalize">
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-amber-500 ml-0.5 cursor-pointer"
                  aria-label="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}

            {priceTier !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium">
                <span>
                  Rate:{' '}
                  {priceTier === 'under-1500'
                    ? '< $1,500/day'
                    : priceTier === '1500-2500'
                    ? '$1,500 - $2,500'
                    : '$2,500+/day'}
                </span>
                <button
                  type="button"
                  onClick={() => setPriceTier('all')}
                  className="hover:text-amber-500 ml-0.5 cursor-pointer"
                  aria-label="Remove rate filter"
                >
                  ✕
                </button>
              </span>
            )}

            {minSqFt !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium">
                <span>Min Footprint: {Number(minSqFt).toLocaleString()}+ sq ft</span>
                <button
                  type="button"
                  onClick={() => setMinSqFt('all')}
                  className="hover:text-amber-500 ml-0.5 cursor-pointer"
                  aria-label="Remove footprint filter"
                >
                  ✕
                </button>
              </span>
            )}

            {camlockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-medium">
                <span>600A Camlock</span>
                <button
                  type="button"
                  onClick={() => setCamlockOnly(false)}
                  className="hover:text-amber-600 ml-0.5 cursor-pointer"
                  aria-label="Remove Camlock filter"
                >
                  ✕
                </button>
              </span>
            )}

            {driveInOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-medium">
                <span>Drive-in Bay</span>
                <button
                  type="button"
                  onClick={() => setDriveInOnly(false)}
                  className="hover:text-amber-600 ml-0.5 cursor-pointer"
                  aria-label="Remove drive-in filter"
                >
                  ✕
                </button>
              </span>
            )}

            {soundproofOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-medium">
                <span>STC 60+ Soundproof</span>
                <button
                  type="button"
                  onClick={() => setSoundproofOnly(false)}
                  className="hover:text-amber-600 ml-0.5 cursor-pointer"
                  aria-label="Remove soundproof filter"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline ml-2 cursor-pointer"
            >
              Clear All ({activeFilterCount})
            </button>
          </div>
        )}
      </div>

      {/* Results Count & Meta */}
      <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span>
          Showing <strong className="text-zinc-950 dark:text-white font-bold">{loading ? '...' : filteredStudios.length}</strong> certified production {filteredStudios.length === 1 ? 'stage' : 'stages'}
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
          All bookings include $2M direct liability policy endorsement
        </span>
      </div>

      {/* Studios View: Grid or Tech Spec Matrix */}
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
        ) : filteredStudios.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredStudios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          ) : (
            /* Tech Spec Matrix View: Compact, High-Density Table/Rows */
            <div className="space-y-3">
              {filteredStudios.map((studio) => {
                const compared = isCompared(studio.id);
                const bookmarked = isBookmarked(studio.id);

                return (
                  <div
                    key={studio.id}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group shadow-xs"
                  >
                    {/* Stage Thumbnail & Identity */}
                    <div className="flex items-center gap-4 min-w-[280px]">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                        <Image
                          src={studio.imageUrl}
                          alt={studio.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-950/80 text-white backdrop-blur-xs">
                          {studio.categoryLabel}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/studios/${studio.slug}`}
                            className="font-bold text-zinc-950 dark:text-white hover:text-amber-500 transition-colors text-base sm:text-lg"
                          >
                            {studio.name}
                          </Link>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {studio.submarket}, {studio.location}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{studio.rating}</strong>
                            <span>({studio.reviewCount})</span>
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                            {studio.equipmentHighlight}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Specifications Columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 flex-1 w-full lg:w-auto text-xs py-2 lg:py-0 border-y lg:border-y-0 lg:border-x border-zinc-100 dark:border-zinc-800/80 lg:px-6">
                      {/* Specs: Footprint & Height */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Dimensions
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-sm block mt-0.5">
                          {studio.specs.sqFt.toLocaleString()} sq ft
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                          {studio.specs.gridHeight} Clear Grid
                        </span>
                      </div>

                      {/* Specs: Power Distribution */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Power Service
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-xs block mt-0.5">
                          {studio.specs.power}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                          {studio.features.camlockPower ? 'Camlock Ready' : 'Standard 120V'}
                        </span>
                      </div>

                      {/* Specs: Acoustics & Access */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Acoustics &amp; Bay
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block mt-0.5">
                          {studio.features.stc60Certified ? 'STC 60+ Soundproof' : 'Quiet Shoot'}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                          {studio.features.driveInAccess ? 'Roll-in Drive Bay' : 'Freight Elevator'}
                        </span>
                      </div>

                      {/* Commercial Rates */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Commercial Shift
                        </span>
                        <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-sm block mt-0.5">
                          ${studio.dayRate10h.toLocaleString()}/day
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">
                          ${Math.round(studio.dayRate10h * 0.6).toLocaleString()} (5h Half-Day)
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end shrink-0 flex-wrap">
                      {/* Compare Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleCompare(studio.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          compared
                            ? 'bg-amber-500 text-white dark:text-zinc-950 border-amber-600 font-bold shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                        title={
                          compared
                            ? 'Remove from comparison'
                            : canAddMoreCompare
                            ? 'Add to comparison'
                            : 'Comparison limit reached (max 3)'
                        }
                      >
                        <CompareIcon className="w-3.5 h-3.5" />
                        <span>{compared ? 'Comparing' : 'Compare'}</span>
                      </button>

                      {/* Save Bookmark */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(studio.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          bookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark studio'}
                      >
                        <BookmarkIcon className="w-4 h-4" filled={bookmarked} />
                      </button>

                      {/* Request Hold */}
                      <button
                        type="button"
                        onClick={() => setActiveBookingStudio(studio)}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        Request Hold
                      </button>

                      {/* View Details Link */}
                      <Link
                        href={`/studios/${studio.slug}`}
                        className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <EmptyState
            title="No production stages match your current criteria"
            description="Try removing technical filters like 3-Phase Camlock, Soundproof, or expanding your price and footprint boundaries to explore all commercial stages."
            actionLabel="Reset All Filters"
            onAction={resetAllFilters}
          />
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Studios & Stages"
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat as StudioCategory | 'all')}
        categories={[
          { id: 'all', label: 'All Categories' },
          { id: 'cyclorama', label: 'Cycloramas' },
          { id: 'soundstage', label: 'Soundstages' },
          { id: 'daylight', label: 'Daylight Lofts' },
          { id: 'kitchen', label: 'Kitchen Stages' },
        ]}
        sortBy={sortBy}
        onSelectSortBy={(sort) => setSortBy(sort as typeof sortBy)}
        sortOptions={[
          { id: 'featured', label: 'Featured Hubs' },
          { id: 'price-asc', label: 'Day Rate: Low to High' },
          { id: 'price-desc', label: 'Day Rate: High to Low' },
          { id: 'size-desc', label: 'Stage Size: Largest First' },
          { id: 'rating-desc', label: 'Highest Rated' },
        ]}
        priceTier={priceTier}
        onSelectPriceTier={(tier) => setPriceTier(tier)}
        minSqFt={minSqFt}
        onSelectMinSqFt={(sqFt) => setMinSqFt(sqFt)}
        camlockOnly={camlockOnly}
        onToggleCamlock={() => setCamlockOnly(!camlockOnly)}
        driveInOnly={driveInOnly}
        onToggleDriveIn={() => setDriveInOnly(!driveInOnly)}
        soundproofOnly={soundproofOnly}
        onToggleSoundproof={() => setSoundproofOnly(!soundproofOnly)}
        onResetFilters={resetAllFilters}
        totalResultsCount={filteredStudios.length}
      />

      {/* Booking / Hold Modal */}
      <BookingModal
        studio={activeBookingStudio}
        isOpen={Boolean(activeBookingStudio)}
        onClose={() => setActiveBookingStudio(null)}
      />
    </div>
  );
}

export default function StudiosPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-zinc-500">
          Loading production stages marketplace...
        </div>
      }
    >
      <StudiosContent />
    </Suspense>
  );
}
