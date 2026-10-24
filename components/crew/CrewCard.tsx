'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, PlusIcon, CheckIcon } from '@/components/ui/Icons';
import { ProductionCrewMember } from '@/lib/types';
import { useMarketplace } from '@/context/MarketplaceContext';

const FALLBACK_CREW_IMAGE = '/images/crew/elena-rostova.svg';

function resolveCrewImage(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return FALLBACK_CREW_IMAGE;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return FALLBACK_CREW_IMAGE;
}

interface CrewCardProps {
  member: ProductionCrewMember;
  isAdded?: boolean;
  onToggleAdd?: (member: ProductionCrewMember) => void;
}

export function CrewCard({
  member,
  isAdded: propIsAdded,
  onToggleAdd: propOnToggleAdd,
}: CrewCardProps) {
  const { isCrewSelected, toggleCrew } = useMarketplace();
  const [hasError, setHasError] = useState(false);
  const [prevUrl, setPrevUrl] = useState(member.imageUrl);

  if (prevUrl !== member.imageUrl) {
    setPrevUrl(member.imageUrl);
    setHasError(false);
  }

  const resolvedSrc = hasError ? FALLBACK_CREW_IMAGE : resolveCrewImage(member.imageUrl);

  const added = propIsAdded !== undefined ? propIsAdded : isCrewSelected(member.id);
  const handleToggle = () => {
    if (propOnToggleAdd) {
      propOnToggleAdd(member);
    } else {
      toggleCrew(member);
    }
  };

  const crewSlugOrId = encodeURIComponent(member.slug || member.id);

  return (
    <article className="group bento-card-interactive bg-white dark:bg-[#121216] rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-black/40 flex flex-col h-full transition-all duration-200">
      
      {/* Crew Portrait Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
        <Link href={`/crew/${crewSlugOrId}`} className="block w-full h-full" aria-label={`View profile of ${member.name}`}>
          <Image
            src={resolvedSrc}
            alt={member.imageAlt || member.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            unoptimized={!resolvedSrc.startsWith('/') && !resolvedSrc.includes('images.unsplash.com')}
            onError={() => setHasError(true)}
          />
        </Link>

        {/* Role Badge Top Left */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950/85 text-white backdrop-blur-md border border-white/10 shadow-xs">
            {member.role}
          </span>
        </div>

        {/* Union Affiliation Badge */}
        {member.unionAffiliation && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-zinc-900/80 text-zinc-300 backdrop-blur-md border border-zinc-700/60">
              {member.unionAffiliation}
            </span>
          </div>
        )}

        {/* Next Available Pill Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-zinc-950/85 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-live-pulse" />
            <span>Next Open: {member.nextAvailable}</span>
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <Link href={`/crew/${crewSlugOrId}`}>
                {member.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{member.rating.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {member.credits}
          </p>

          <div className="flex items-center justify-between gap-1.5 mt-1 text-[11px] text-zinc-400">
            <span className="truncate">{member.location}</span>
            {member.distanceKm !== undefined && member.distanceKm !== null && (
              <span
                className="shrink-0 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                title="Straight-line distance from your selected location"
              >
                {member.distanceKm} km away
              </span>
            )}
          </div>

          {/* Working Gear Kit Specification */}
          <div className="mt-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px]">
            <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Working Kit Included</span>
            <p className="font-medium text-zinc-700 dark:text-zinc-300 leading-snug line-clamp-2 mt-0.5">
              {member.workingKit.replace('Working Kit: ', '')}
            </p>
          </div>
        </div>

        {/* Rate & Add to Crew Action */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block">10h Commercial Day</span>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              ${member.dayRate10h}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 select-none ${
              added
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white'
            }`}
          >
            {added ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                <span>On Roster</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Hold Crew</span>
              </>
            )}
          </button>
        </div>

      </div>
    </article>
  );
}
