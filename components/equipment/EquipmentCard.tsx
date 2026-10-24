'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, BookmarkIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { EquipmentItem } from '@/lib/types';
import { useMarketplace } from '@/context/MarketplaceContext';

const FALLBACK_EQUIPMENT_IMAGE = '/images/equipment/arri-alexa-35.svg';

function resolveEquipmentImage(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return FALLBACK_EQUIPMENT_IMAGE;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return FALLBACK_EQUIPMENT_IMAGE;
}

interface EquipmentCardProps {
  equipment: EquipmentItem;
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const { isBookmarked, toggleBookmark } = useMarketplace();
  const bookmarked = isBookmarked(equipment.id);
  const [hasError, setHasError] = useState(false);
  const [prevUrl, setPrevUrl] = useState(equipment.imageUrl);

  if (prevUrl !== equipment.imageUrl) {
    setPrevUrl(equipment.imageUrl);
    setHasError(false);
  }

  const resolvedSrc = hasError ? FALLBACK_EQUIPMENT_IMAGE : resolveEquipmentImage(equipment.imageUrl);
  const equipmentSlugOrId = encodeURIComponent(equipment.slug || equipment.id);

  return (
    <article className="group bento-card-interactive bg-white dark:bg-[#121216] rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-black/40 flex flex-col h-full transition-all duration-200">
      
      {/* Equipment Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <Link href={`/equipment/${equipmentSlugOrId}`} className="block w-full h-full" aria-label={`View ${equipment.name}`}>
          <Image
            src={resolvedSrc}
            alt={equipment.imageAlt || equipment.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            unoptimized={!resolvedSrc.startsWith('/') && !resolvedSrc.includes('images.unsplash.com')}
            onError={() => setHasError(true)}
          />
        </Link>

        {/* Brand Badge Top Left */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950/85 text-white backdrop-blur-md border border-white/10 shadow-xs">
            {equipment.brand}
          </span>
        </div>

        {/* Bookmark Action (With 44px minimum tap target) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(equipment.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer select-none before:absolute before:-inset-1 before:content-[''] ${
            bookmarked
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'bg-zinc-950/70 text-white hover:bg-white hover:text-zinc-950 border border-white/15'
          }`}
          aria-label={bookmarked ? `Remove ${equipment.name} from saved` : `Save ${equipment.name} to shortlist`}
        >
          <BookmarkIcon filled={bookmarked} className="w-4 h-4" />
        </button>

        {/* Replacement Value Badge */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-950/85 text-zinc-300 backdrop-blur-md border border-white/10">
            Value: ${equipment.replacementValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <Link href={`/equipment/${equipmentSlugOrId}`}>
                {equipment.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{equipment.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="truncate">{equipment.location || equipment.categoryLabel}</span>
            {equipment.distanceKm !== undefined && equipment.distanceKm !== null && (
              <span
                className="shrink-0 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                title="Straight-line distance from your selected location"
              >
                {equipment.distanceKm} km away
              </span>
            )}
          </div>

          {/* Key Spec Snippet */}
          <div className="mt-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px]">
            <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Key Specification</span>
            <p className="font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 mt-0.5">
              {equipment.keySpecs[0]}
            </p>
          </div>
        </div>

        {/* Pricing & Link */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                ${equipment.dayRate}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">/ Day</span>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
              ${equipment.weeklyRate}/wk (3-day week)
            </span>
          </div>

          <Link
            href={`/equipment/${equipmentSlugOrId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 group-hover:translate-x-0.5 transition-all"
          >
            <span>Rental Package</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}
