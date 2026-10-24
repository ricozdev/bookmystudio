'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, BookmarkIcon, ArrowRightIcon, CompareIcon } from '@/components/ui/Icons';
import { StudioSpace } from '@/lib/types';
import { useMarketplace } from '@/context/MarketplaceContext';

const FALLBACK_STUDIO_IMAGE = '/images/studios/apex-stage-c.svg';

function resolveStudioImage(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return FALLBACK_STUDIO_IMAGE;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return FALLBACK_STUDIO_IMAGE;
}

interface StudioCardProps {
  studio: StudioSpace;
  isBookmarked?: boolean;
  onToggleBookmark?: (studioId: string) => void;
  onCheckDates?: (studio: StudioSpace) => void;
}

export function StudioCard({
  studio,
  isBookmarked: propIsBookmarked,
  onToggleBookmark: propOnToggleBookmark,
}: StudioCardProps) {
  const { isBookmarked: contextIsBookmarked, toggleBookmark: contextToggleBookmark, isCompared, toggleCompare } = useMarketplace();
  const [limitNotice, setLimitNotice] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prevUrl, setPrevUrl] = useState(studio.imageUrl);

  if (prevUrl !== studio.imageUrl) {
    setPrevUrl(studio.imageUrl);
    setHasError(false);
  }

  const resolvedSrc = hasError ? FALLBACK_STUDIO_IMAGE : resolveStudioImage(studio.imageUrl);

  const isSaved = propIsBookmarked !== undefined ? propIsBookmarked : contextIsBookmarked(studio.id);
  const handleToggle = () => {
    if (propOnToggleBookmark) {
      propOnToggleBookmark(studio.id);
    } else {
      contextToggleBookmark(studio.id);
    }
  };

  const handleCompareClick = () => {
    const res = toggleCompare(studio.id);
    if (!res.success && res.reason === 'limit_reached') {
      setLimitNotice(true);
      setTimeout(() => setLimitNotice(false), 2500);
    }
  };

  const studioSlugOrId = encodeURIComponent(studio.slug || studio.id);

  return (
    <article className="group bento-card-interactive bg-white dark:bg-[#121216] rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-black/40 flex flex-col h-full transition-all duration-200">
      
      {/* Studio Photography Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <Link href={`/studios/${studioSlugOrId}`} className="block w-full h-full" aria-label={`View ${studio.name}`}>
          <Image
            src={resolvedSrc}
            alt={studio.imageAlt || studio.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            unoptimized={!resolvedSrc.startsWith('/') && !resolvedSrc.includes('images.unsplash.com')}
            onError={() => setHasError(true)}
          />
        </Link>

        {/* Top Badges & Bookmark */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950/85 text-white backdrop-blur-md border border-white/10 shadow-xs">
              {studio.badgeTopLeft}
            </span>
            {studio.badgeTopSecondary && (
              <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-zinc-900/70 text-zinc-200 backdrop-blur-md">
                {studio.badgeTopSecondary}
              </span>
            )}
          </div>

          {/* Action cluster: Compare & Bookmark */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Compare Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCompareClick();
              }}
              className={`relative min-h-[36px] px-3 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 text-[11px] sm:text-[10px] font-bold cursor-pointer select-none ${
                isCompared(studio.id)
                  ? 'bg-amber-500 text-zinc-950 border border-amber-400 shadow-sm'
                  : 'bg-zinc-950/70 text-white hover:bg-white hover:text-zinc-950 border border-white/15'
              }`}
              aria-label={isCompared(studio.id) ? `Remove ${studio.name} from comparison` : `Add ${studio.name} to comparison`}
              title={isCompared(studio.id) ? 'Selected for comparison' : 'Compare up to 3 studios side-by-side'}
            >
              <CompareIcon className="w-3.5 h-3.5" />
              <span>{isCompared(studio.id) ? 'Comparing' : 'Compare'}</span>
            </button>

            {/* Bookmark Button (With 44px minimum tap target) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
              }}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer select-none before:absolute before:-inset-1 before:content-[''] ${
                isSaved
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-zinc-950/70 text-white hover:bg-white hover:text-zinc-950 border border-white/15'
              }`}
              aria-label={isSaved ? `Remove ${studio.name} from saved` : `Save ${studio.name} to shortlist`}
            >
              <BookmarkIcon filled={isSaved} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Limit reached toast notice */}
        {limitNotice && (
          <div className="absolute top-14 right-3 left-3 z-20 p-2 rounded-xl bg-zinc-950/95 text-amber-300 border border-amber-500/30 text-[10px] font-bold text-center backdrop-blur-md shadow-lg animate-scale-in">
            Max 3 studios can be compared. Remove one first.
          </div>
        )}

        {/* Bottom Price Overlay on Image */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-zinc-950/90 text-white backdrop-blur-md border border-white/10 shadow-xs">
            ${studio.hourlyRate}<span className="text-[10px] font-normal text-zinc-300">/hr</span>
          </span>
        </div>
      </div>

      {/* Studio Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        
        {/* Title, Category & Location */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <Link href={`/studios/${studioSlugOrId}`}>
                {studio.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{studio.rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="truncate">{studio.location}</span>
            {studio.distanceKm !== undefined && studio.distanceKm !== null && (
              <span
                className="shrink-0 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                title="Straight-line distance from your selected location"
              >
                {studio.distanceKm} km away
              </span>
            )}
          </div>

          {/* Technical Specs Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px]">
            <div>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Area</span>
              <span className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">{studio.specs.sqFt.toLocaleString()} sq ft</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Rigging</span>
              <span className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{studio.specs.gridHeight}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Power</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{studio.specs.power}</span>
            </div>
          </div>
        </div>

        {/* Footer: 10h Day Rate & Direct Link */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block">10-Hour Shoot Day</span>
            <span className="font-mono tabular-nums text-sm font-extrabold text-zinc-950 dark:text-white">
              ${studio.dayRate10h.toLocaleString()} <span className="font-normal text-zinc-400 text-[10px] font-sans">flat</span>
            </span>
          </div>

          <Link
            href={`/studios/${studioSlugOrId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 group-hover:translate-x-0.5 transition-all"
          >
            <span>Stage Specs</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}
