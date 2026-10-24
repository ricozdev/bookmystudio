'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, BookmarkIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { FilmingLocation } from '@/lib/types';
import { useMarketplace } from '@/context/MarketplaceContext';

const FALLBACK_LOCATION_IMAGE = '/images/locations/bushwick-brick-warehouse.svg';

function resolveLocationImage(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return FALLBACK_LOCATION_IMAGE;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return FALLBACK_LOCATION_IMAGE;
}

interface LocationCardProps {
  location: FilmingLocation;
}

export function LocationCard({ location }: LocationCardProps) {
  const { isBookmarked, toggleBookmark } = useMarketplace();
  const bookmarked = isBookmarked(location.id);
  const [hasError, setHasError] = useState(false);
  const [prevUrl, setPrevUrl] = useState(location.imageUrl);

  if (prevUrl !== location.imageUrl) {
    setPrevUrl(location.imageUrl);
    setHasError(false);
  }

  const resolvedSrc = hasError ? FALLBACK_LOCATION_IMAGE : resolveLocationImage(location.imageUrl);
  const locationSlugOrId = encodeURIComponent(location.slug || location.id);

  return (
    <article className="group bento-card-interactive bg-white dark:bg-[#121216] rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-black/40 flex flex-col h-full transition-all duration-200">
      
      {/* Location Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <Link href={`/locations/${locationSlugOrId}`} className="block w-full h-full" aria-label={`View ${location.name}`}>
          <Image
            src={resolvedSrc}
            alt={location.imageAlt || location.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            unoptimized={!resolvedSrc.startsWith('/') && !resolvedSrc.includes('images.unsplash.com')}
            onError={() => setHasError(true)}
          />
        </Link>

        {/* Floating Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950/85 text-white backdrop-blur-md border border-white/10 shadow-xs">
            {location.categoryLabel}
          </span>
        </div>

        {/* Bookmark Action (With 44px minimum tap target) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(location.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer select-none before:absolute before:-inset-1 before:content-[''] ${
            bookmarked
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'bg-zinc-950/70 text-white hover:bg-white hover:text-zinc-950 border border-white/15'
          }`}
          aria-label={bookmarked ? `Remove ${location.name} from saved` : `Save ${location.name} to shortlist`}
        >
          <BookmarkIcon filled={bookmarked} className="w-4 h-4" />
        </button>

        {/* Bottom Rate Badge */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-zinc-950/90 text-white backdrop-blur-md border border-white/10 shadow-xs">
            ${location.hourlyRate}<span className="text-[10px] font-normal text-zinc-300">/hr</span>
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <Link href={`/locations/${locationSlugOrId}`}>
                {location.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{location.rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="truncate">{location.location}</span>
            {location.distanceKm !== undefined && location.distanceKm !== null && (
              <span
                className="shrink-0 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                title="Straight-line distance from your selected location"
              >
                {location.distanceKm} km away
              </span>
            )}
          </div>

          {/* Specs Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px]">
            <div>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Floor</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{location.areaSqFt.toLocaleString()} sq ft</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Clearance</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{location.ceilingHeight}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Power</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{location.powerSupply}</span>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
            {location.curfewRestrictions}
          </p>
        </div>

        {/* Pricing & Link */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block">10-Hour Shoot Day</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              ${location.dayRate10h.toLocaleString()} <span className="font-normal text-zinc-400 text-[10px]">flat</span>
            </span>
          </div>

          <Link
            href={`/locations/${locationSlugOrId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 group-hover:translate-x-0.5 transition-all"
          >
            <span>Scout Spec</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}
