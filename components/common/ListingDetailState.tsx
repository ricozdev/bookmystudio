'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  AlertCircleIcon,
  LockIcon,
  ShieldPolicyIcon,
} from '@/components/ui/Icons';

export type ListingCategoryType = 'studio' | 'location' | 'crew' | 'equipment';

interface CategoryConfig {
  singular: string;
  plural: string;
  exploreRoute: string;
  badge: string;
  iconBg: string;
}

const CATEGORY_CONFIGS: Record<ListingCategoryType, CategoryConfig> = {
  studio: {
    singular: 'Production Stage',
    plural: 'Production Stages & Studios',
    exploreRoute: '/studios',
    badge: 'STAGE LISTING',
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  location: {
    singular: 'Filming Location',
    plural: 'Filming Locations & Warehouses',
    exploreRoute: '/locations',
    badge: 'LOCATION PROFILE',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  crew: {
    singular: 'Crew Profile',
    plural: 'Heads of Department & Crew',
    exploreRoute: '/crew',
    badge: 'CREW ROSTER',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  equipment: {
    singular: 'Cinema Gear Package',
    plural: 'Cinema Cameras & Grip Gear',
    exploreRoute: '/equipment',
    badge: 'EQUIPMENT VAULT',
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
};

/**
 * High-fidelity Soundstage Loading Skeleton matching BookMyStudio's adaptive theme palette.
 */
export function ListingDetailSkeleton({ category = 'studio' }: { category?: ListingCategoryType }) {
  const config = CATEGORY_CONFIGS[category];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 animate-pulse" role="status" aria-label={`Loading ${config.singular} specifications`}>
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Header Skeleton */}
      <div className="mt-2 pb-6 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-5 w-20 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-md" />
            <div className="h-5 w-32 bg-zinc-200/40 dark:bg-zinc-800/40 rounded-md" />
          </div>
          <div className="h-9 sm:h-11 w-3/4 max-w-xl bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-zinc-200/70 dark:bg-zinc-800/70 rounded" />
            <div className="h-4 w-24 bg-zinc-200/50 dark:bg-zinc-800/50 rounded" />
            <div className="h-4 w-28 bg-zinc-200/50 dark:bg-zinc-800/50 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-44 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
          <div className="h-9 w-28 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
        </div>
      </div>

      {/* 2-Column Content Skeleton */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Gallery Skeleton */}
          <div className="w-full aspect-16/10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-zinc-200/40 dark:via-zinc-800/20 to-transparent animate-shimmer" />
          </div>

          {/* Specs Grid Skeleton */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/90 shadow-xs space-y-4">
            <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
                  <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200/70 dark:bg-zinc-800/70 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
            <div className="h-4 w-4/6 bg-zinc-200/50 dark:bg-zinc-800/50 rounded" />
          </div>
        </div>

        {/* Right Column (4 cols) Sticky Form Skeleton */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-6 w-20 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
              <div className="h-10 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
              <div className="h-10 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
              <div className="h-12 w-full bg-amber-500/40 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated 404 screen when a specific listing identifier or slug cannot be located.
 */
export function ListingNotFound({
  category = 'studio',
  identifier,
}: {
  category?: ListingCategoryType;
  identifier?: string;
}) {
  const config = CATEGORY_CONFIGS[category];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-xl w-full text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 mx-auto">
          <AlertCircleIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
            404 — {config.badge} NOT FOUND
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            This {config.singular} Does Not Exist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            {identifier ? (
              <>
                We could not find a {config.singular.toLowerCase()} with identifier{' '}
                <span className="font-mono text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                  {identifier}
                </span>
                .
              </>
            ) : (
              `The requested ${config.singular.toLowerCase()} could not be located.`
            )}{' '}
            The listing may have been moved, renamed, or temporarily unlisted by the studio owner.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={config.exploreRoute}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98"
          >
            <span>Explore {config.plural}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white text-xs font-semibold transition-all active:scale-98"
          >
            <span>Search All Marketplace</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium transition-all"
          >
            Return Home
          </Link>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500">
          Looking for a specific certified production stage? Our operations team can check availability for your wrap dates directly.
        </div>
      </div>
    </div>
  );
}

/**
 * Network connection failure screen with actionable retry button.
 */
export function ListingNetworkError({
  category = 'studio',
  onRetry,
}: {
  category?: ListingCategoryType;
  onRetry: () => void;
}) {
  const config = CATEGORY_CONFIGS[category];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-xl w-full text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-amber-500/20 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 mx-auto">
          <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
            CONNECTION TO PRODUCTION API FAILED
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Production Network Offline
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            Unable to connect to the BookMyStudio backend service to verify technical specifications. Please verify your connection or retry the request.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry Connection</span>
          </button>

          <Link
            href={config.exploreRoute}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all"
          >
            <span>Browse {config.plural}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * 500 Server error screen with retry capability.
 */
export function ListingServerError({
  onRetry,
  errorMessage,
}: {
  onRetry: () => void;
  errorMessage?: string;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-xl w-full text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-red-500/20 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 mx-auto">
          <AlertCircleIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-semibold">
            500 — STAGE SERVICE EXCEPTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Server Processing Error
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            {errorMessage || 'The BookMyStudio backend encountered an unexpected error while retrieving this listing.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Restricted access notice for draft or unpublished listings.
 */
export function ListingUnpublishedNotice({
  category = 'studio',
  publicationStatus = 'draft',
}: {
  category?: ListingCategoryType;
  publicationStatus?: string;
}) {
  const config = CATEGORY_CONFIGS[category];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-xl w-full text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-amber-500/30 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 mx-auto">
          <LockIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold">
            RESTRICTED ACCESS — {publicationStatus.toUpperCase()} LISTING
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            This {config.singular} Is Not Publicly Active
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            This production listing is currently saved in draft mode, undergoing verification, or has been temporarily unlisted. Only the verified owner or administrators can review its contents.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-left space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-200 font-semibold">
            <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
            <span>Are you the owner of this stage?</span>
          </div>
          <p>
            Sign in with the verified account that created this listing to view your stage preview and manage publication status from your vendor dashboard.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard?tab=listings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98"
          >
            <span>Open Vendor Dashboard</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={config.exploreRoute}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all"
          >
            Explore Active {config.plural}
          </Link>
        </div>
      </div>
    </div>
  );
}
