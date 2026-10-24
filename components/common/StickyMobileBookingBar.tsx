'use client';

import React from 'react';
import { BookmarkIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';

interface StickyMobileBookingBarProps {
  listingId: string;
  listingTitle: string;
  price: number;
  priceUnit?: string;
  priceSubtitle?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  targetFormId?: string;
}

export function StickyMobileBookingBar({
  listingId,
  listingTitle,
  price,
  priceUnit = '/day',
  priceSubtitle = '10h Standard Day',
  actionLabel = 'Request Date Hold',
  onActionClick,
  targetFormId = 'inquiry-form',
}: StickyMobileBookingBarProps) {
  const { isBookmarked, toggleBookmark } = useMarketplace();
  const saved = isBookmarked(listingId);

  const handleAction = () => {
    if (onActionClick) {
      onActionClick();
      return;
    }

    if (typeof window !== 'undefined' && targetFormId) {
      const el = document.getElementById(targetFormId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus the first interactive element or input in the form
        setTimeout(() => {
          const input = el.querySelector<HTMLInputElement | HTMLButtonElement>('input, button, select');
          input?.focus();
        }, 400);
      }
    }
  };

  return (
    <aside
      aria-label="Mobile booking action bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/90 safe-area-bottom lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.6)] transition-all duration-200"
    >
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Pricing & Context */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight tabular-nums">
              ${price.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {priceUnit}
            </span>
          </div>
          <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
            {priceSubtitle}
          </span>
        </div>

        {/* Right: Bookmark + Primary Hold CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Bookmark Toggle (44px target) */}
          <button
            type="button"
            onClick={() => toggleBookmark(listingId)}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
              saved
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-xs'
                : 'bg-zinc-100 dark:bg-[#18181E] border-zinc-300 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#202028]'
            }`}
            aria-label={saved ? `Remove ${listingTitle} from saved` : `Save ${listingTitle} to shortlist`}
            title={saved ? 'Shortlisted' : 'Save to shortlist'}
          >
            <BookmarkIcon filled={saved} className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleAction}
            className="px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer font-sans"
          >
            <span>{actionLabel}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

