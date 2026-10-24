'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  SearchIcon,
  CloseIcon,
  LocationPinIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import { LOCATION_OPTIONS, SHIFT_OPTIONS } from '@/lib/data';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuery?: string;
  defaultLocation?: string;
  defaultCategory?: string;
}

const POPULAR_SEARCHES = [
  'Daylight Cyc Studio',
  'STC 60+ Soundstage',
  'Director of Photography',
  'Arri Alexa 35 Kit',
  'Tribeca Cast-Iron Loft',
  '3-Phase Camlock (600A)',
  'Drive-in Vehicle Access',
  'Commercial Kitchen Stage',
];

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All Spaces' },
  { id: 'cyclorama', label: 'Cycloramas' },
  { id: 'soundstage', label: 'Soundstages' },
  { id: 'daylight', label: 'Daylight Lofts' },
  { id: 'kitchen', label: 'Kitchen Stages' },
  { id: 'locations', label: 'Locations' },
  { id: 'crew', label: 'Production Crew' },
  { id: 'equipment', label: 'Equipment' },
];

export function MobileSearchModal({
  isOpen,
  onClose,
  defaultQuery = '',
  defaultLocation = '',
  defaultCategory = 'all',
}: MobileSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(defaultQuery);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedShift, setSelectedShift] = useState(SHIFT_OPTIONS[0].label);

  // Lock body scroll and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);

    onClose();
    router.push(`/search?${params.toString()}`);
  };

  const handleQuickSuggestion = (item: string) => {
    setQuery(item);
    const params = new URLSearchParams();
    params.set('q', item);
    onClose();
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full screen search"
      className="fixed inset-0 z-50 bg-white dark:bg-[#121212] flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* Top Search App Bar */}
      <div className="pt-2 pb-3 px-4 border-b border-slate-200 dark:border-[#262626] safe-area-top flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <SearchIcon className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-[#8A8A8A] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spaces, crew, gear, specs..."
            className="w-full pl-10 pr-9 py-2.5 min-h-[44px] bg-slate-100 dark:bg-[#202020] rounded-full text-base text-slate-900 dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 dark:text-[#8A8A8A] hover:text-slate-600 dark:hover:text-[#F5F5F5] cursor-pointer"
              aria-label="Clear input"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-600 dark:text-[#B3B3B3] hover:text-slate-900 dark:hover:text-[#F5F5F5] min-h-[44px] px-2 flex items-center justify-center cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Scrollable Search Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        
        {/* Category Filter Pills */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A] mb-2.5">
            Space or Asset Type
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#B3B3B3] border-transparent hover:bg-slate-200 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Popular & Recommended Production Searches */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A] mb-2.5">
            Popular Searches
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleQuickSuggestion(term)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#303030] text-slate-700 dark:text-[#CCCCCC] hover:border-slate-400 dark:hover:border-[#505050] transition-colors cursor-pointer"
              >
                <SearchIcon className="w-3 h-3 text-slate-400 dark:text-[#737373]" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Production Hub Quick-Select */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
              Production Hubs &amp; Zones
            </span>
            {selectedLocation && (
              <button
                type="button"
                onClick={() => setSelectedLocation('')}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {LOCATION_OPTIONS.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocation(isSelected ? '' : loc)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 dark:bg-[#1a1a1a] text-slate-700 dark:text-[#CCCCCC] hover:bg-slate-100 dark:hover:bg-[#222]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LocationPinIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-[#8A8A8A]'}`} />
                    <span>{loc}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Standard Shoot Shifts */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A] mb-2.5">
            Standard Shift Length
          </span>
          <div className="grid grid-cols-1 gap-2">
            {SHIFT_OPTIONS.map((shift) => (
              <button
                key={shift.label}
                type="button"
                onClick={() => setSelectedShift(shift.label)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedShift === shift.label
                    ? 'border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-[#202020]'
                    : 'border-slate-200 dark:border-[#303030] hover:border-slate-300 dark:hover:border-[#404040]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F5F5F5]">
                    {shift.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-[#8A8A8A]">
                    {shift.times}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action CTA */}
      <div className="p-4 border-t border-slate-200 dark:border-[#262626] safe-area-bottom bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleSearch()}
          className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Find Production Spaces &amp; Crew</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
