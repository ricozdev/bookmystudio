'use client';

import React, { useEffect } from 'react';
import { CloseIcon, ZapIcon, TruckIcon } from '@/components/ui/Icons';

interface FilterOption {
  id: string;
  label: string;
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: FilterOption[];
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  sortOptions: FilterOption[];
  priceTier?: string;
  onSelectPriceTier?: (tier: string) => void;
  minSqFt?: string;
  onSelectMinSqFt?: (sqFt: string) => void;
  camlockOnly?: boolean;
  onToggleCamlock?: () => void;
  driveInOnly?: boolean;
  onToggleDriveIn?: () => void;
  soundproofOnly?: boolean;
  onToggleSoundproof?: () => void;
  onResetFilters: () => void;
  totalResultsCount?: number;
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  title = 'Filters & Sorting',
  selectedCategory,
  onSelectCategory,
  categories,
  sortBy,
  onSelectSortBy,
  sortOptions,
  priceTier,
  onSelectPriceTier,
  minSqFt,
  onSelectMinSqFt,
  camlockOnly,
  onToggleCamlock,
  driveInOnly,
  onToggleDriveIn,
  soundproofOnly,
  onToggleSoundproof,
  onResetFilters,
  totalResultsCount,
}: MobileFilterSheetProps) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121216] rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 ease-out">
        
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
              aria-label="Close filters"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sheet Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          
          {/* Sorting Group */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Sort By
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {sortOptions.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectSortBy(opt.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 dark:bg-amber-500 text-white dark:text-zinc-950 font-semibold'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-zinc-950" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Group */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-2xs font-semibold'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Tier (Optional) */}
          {onSelectPriceTier && (
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Day Rate (10h Commercial Shift)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'Any Budget' },
                  { id: 'under-1500', label: '< $1,500/day' },
                  { id: '1500-2500', label: '$1,500 - $2,500' },
                  { id: 'over-2500', label: '$2,500+/day' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => onSelectPriceTier(tier.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      priceTier === tier.id
                        ? 'bg-amber-500 text-white dark:text-zinc-950 font-bold border-amber-600 dark:border-amber-400'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Min Square Footage (Optional) */}
          {onSelectMinSqFt && (
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Stage Dimensions &amp; Footprint
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'Any Footprint' },
                  { id: '2000', label: '2,000+ sq ft' },
                  { id: '3500', label: '3,500+ sq ft' },
                  { id: '5000', label: '5,000+ sq ft' },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => onSelectMinSqFt(sz.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      minSqFt === sz.id
                        ? 'bg-amber-500 text-white dark:text-zinc-950 font-bold border-amber-600 dark:border-amber-400'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications (if supported on page) */}
          {(onToggleCamlock || onToggleDriveIn || onToggleSoundproof) && (
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Technical Capabilities
              </span>
              <div className="space-y-2">
                {onToggleCamlock && (
                  <button
                    type="button"
                    onClick={onToggleCamlock}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                      camlockOnly
                        ? 'border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ZapIcon className={`w-4 h-4 ${camlockOnly ? 'text-amber-500' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                          3-Phase Camlock (600A)
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Heavy power distribution for cinema lighting packages
                        </div>
                      </div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        camlockOnly
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}
                    >
                      {camlockOnly && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )}

                {onToggleDriveIn && (
                  <button
                    type="button"
                    onClick={onToggleDriveIn}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                      driveInOnly
                        ? 'border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TruckIcon className={`w-4 h-4 ${driveInOnly ? 'text-amber-500' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                          Drive-in Vehicle Loading
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Direct roll-in stage door for grip trucks and hero cars
                        </div>
                      </div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        driveInOnly
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}
                    >
                      {driveInOnly && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )}

                {onToggleSoundproof && (
                  <button
                    type="button"
                    onClick={onToggleSoundproof}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
                      soundproofOnly
                        ? 'border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${soundproofOnly ? 'text-amber-500' : 'text-zinc-400'}`}>
                        dB
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                          STC 60+ Certified Soundproof
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Acoustically isolated for live sync audio and dialog
                        </div>
                      </div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        soundproofOnly
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}
                    >
                      {soundproofOnly && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sheet Footer CTA */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 safe-area-bottom bg-white/95 dark:bg-[#121216]/95 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            {totalResultsCount !== undefined
              ? `Show ${totalResultsCount} Matching Results`
              : 'Apply Filters'}
          </button>
        </div>

      </div>
    </div>
  );
}

