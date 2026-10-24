'use client';

import React, { useState } from 'react';
import { BookmarkIcon, CompareIcon, ShareIcon } from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';

interface StudioDetailActionsProps {
  studioId: string;
  studioName: string;
}

export function StudioDetailActions({ studioId, studioName }: StudioDetailActionsProps) {
  const { isBookmarked, toggleBookmark, isCompared, toggleCompare } = useMarketplace();
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [limitNotice, setLimitNotice] = useState(false);

  const saved = isBookmarked(studioId);
  const compared = isCompared(studioId);

  const handleCompare = () => {
    const res = toggleCompare(studioId);
    if (!res.success && res.reason === 'limit_reached') {
      setLimitNotice(true);
      setTimeout(() => setLimitNotice(false), 2500);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  return (
    <div className="relative flex items-center gap-2 flex-wrap">
      {/* Compare Button */}
      <button
        type="button"
        onClick={handleCompare}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          compared
            ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }`}
        aria-label={compared ? `Remove ${studioName} from comparison` : `Compare ${studioName}`}
      >
        <CompareIcon className="w-3.5 h-3.5" />
        <span>{compared ? 'In Comparison (✓)' : 'Compare Stage'}</span>
      </button>

      {/* Save Button */}
      <button
        type="button"
        onClick={() => toggleBookmark(studioId)}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          saved
            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }`}
        aria-label={saved ? `Remove ${studioName} from saved` : `Save ${studioName}`}
      >
        <BookmarkIcon filled={saved} className="w-3.5 h-3.5" />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        aria-label="Share stage link"
      >
        <ShareIcon className="w-3.5 h-3.5" />
        <span>{copyFeedback ? 'Link Copied!' : 'Share'}</span>
      </button>

      {/* Limit Notice Toast */}
      {limitNotice && (
        <div className="absolute top-10 right-0 z-30 p-2.5 rounded-xl bg-zinc-950 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-xl animate-scale-in whitespace-nowrap">
          Max 3 studios can be compared. Remove one first.
        </div>
      )}
    </div>
  );
}
