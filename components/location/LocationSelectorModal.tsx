'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@/context/LocationContext';
import { locationApi, GeocodedLocationItem } from '@/lib/api/marketplace';

const RADIUS_OPTIONS: { label: string; value: number | 'all' }[] = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'All', value: 'all' },
];

export function LocationSelectorModal() {
  const {
    location,
    isLocating,
    locationError,
    isSelectorOpen,
    isNeutral,
    closeSelector,
    selectHub,
    resetToAllIndia,
    setRadius,
    useCurrentGpsLocation,
    clearError,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocationItem[]>([]);
  const [popularHubs, setPopularHubs] = useState<GeocodedLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleModalClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    clearError();
    closeSelector();
  };

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Focus input when opened and fetch popular hubs
  useEffect(() => {
    if (isSelectorOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      // Load hubs
      locationApi
        .getHubs()
        .then((res) => {
          if (res.success && res.data) {
            setPopularHubs(res.data.popularHubs || []);
          }
        })
        .catch(() => {});
    }
  }, [isSelectorOpen]);

  // Search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await locationApi.search(searchQuery.trim());
        if (res.success && res.data) {
          setSearchResults(res.data);
        }
      } catch {
        // Fallback or ignore
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isSelectorOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#121216] border-t sm:border border-zinc-200 dark:border-[#27272A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile drag handle bar */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-zinc-50 dark:bg-[#18181D]">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181D]">
          <div>
            <h2 id="location-modal-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Set Production Location
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Select your shooting district or PIN code to discover local studios, crew, and gear
            </p>
          </div>
          <button
            onClick={handleModalClose}
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Geolocation Button */}
          <div>
            <button
              onClick={useCurrentGpsLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition font-medium text-sm group"
            >
              {isLocating ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
                    />
                  </svg>
                  <span>Use My Current Location</span>
                </>
              )}
            </button>

            {/* Error banner if permission denied / timeout */}
            {locationError && (
              <div className="mt-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-2">
                <span>{locationError}</span>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-xs font-semibold underline shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <label htmlFor="location-search-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Search City, Locality or PIN Code
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                id="location-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="e.g. Madhapur, Jubilee Hills, Andheri West, 500081..."
                className="w-full bg-zinc-50 dark:bg-[#1A1A22] border border-zinc-300 dark:border-[#2E2E38] rounded-xl px-4 py-2.5 pl-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition"
              />
              <svg
                className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {isSearching && (
                <div className="absolute right-3.5 top-3">
                  <svg className="animate-spin w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Search Results if any */}
          {searchQuery.trim().length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Search Results</span>
              {searchResults.length === 0 && !isSearching ? (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#181820] text-center text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  No matching production locations found. Try entering a city name or valid 6-digit PIN code.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {searchResults.map((hub) => (
                    <button
                      key={hub.id}
                      onClick={() => selectHub(hub)}
                      className="w-full text-left p-3 rounded-xl bg-zinc-50 dark:bg-[#1A1A22] hover:bg-zinc-100 dark:hover:bg-[#23232E] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {hub.name}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {hub.city}, {hub.state} {hub.pincode ? `• PIN ${hub.pincode}` : ''}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-amber-600/70 dark:text-amber-500/70 group-hover:text-amber-600 dark:group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All India Nationwide Option */}
          <div>
            <button
              type="button"
              onClick={resetToAllIndia}
              className={`w-full p-3 rounded-xl border transition flex items-center justify-between text-left group cursor-pointer ${
                isNeutral
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-800 dark:text-amber-200'
                  : 'bg-zinc-50 dark:bg-[#181820] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-[#1E1E28] text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold shrink-0">
                  IN
                </span>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    All India
                    {isNeutral && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        Active Base
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Nationwide discovery across all states &amp; creative hubs
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                {isNeutral ? 'Selected' : 'Browse All →'}
              </span>
            </button>
          </div>

          {/* Popular Production Hubs Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Popular Creative &amp; Film Hubs
              </span>
              <span className="text-[11px] text-zinc-500">Major Indian production centers</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {popularHubs.map((hub) => {
                const isSelected =
                  !isNeutral &&
                  (location.name.toLowerCase().includes(hub.locality.toLowerCase()) ||
                    location.locality?.toLowerCase() === hub.locality.toLowerCase());
                return (
                  <button
                    key={hub.id}
                    onClick={() => selectHub(hub)}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-200'
                        : 'bg-zinc-50 dark:bg-[#181820] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-[#1E1E28] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate text-zinc-900 dark:text-white">{hub.locality}</div>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">{hub.city}</div>
                    {isSelected && (
                      <span className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Radius Selector */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Discovery Radius
              </label>
              <span className="text-[11px] text-zinc-500">Straight-line distance</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {RADIUS_OPTIONS.map((opt) => {
                const isCurrent = location.radiusKm === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setRadius(opt.value)}
                    className={`py-2 px-1 text-xs font-semibold rounded-lg border transition text-center cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-zinc-50 dark:bg-[#181820] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3.5 bg-zinc-50 dark:bg-[#16161C] border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs safe-area-bottom">
          <div className="text-zinc-600 dark:text-zinc-400 truncate pr-2">
            Current: <span className="text-zinc-900 dark:text-white font-medium">{location.name}</span>{' '}
            <span className="text-amber-600 dark:text-amber-400/90 font-mono text-[11px]">
              ({isNeutral || location.radiusKm === 'all' ? 'All India' : `within ${location.radiusKm} km`})
            </span>
          </div>
          <button
            onClick={closeSelector}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer active:scale-95 shadow-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
