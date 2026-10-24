'use client';

import React from 'react';
import { useLocation } from '@/context/LocationContext';

interface ListingLocationBadgeProps {
  locationText?: string;
  coordinates?: [number, number]; // [lng, lat]
  className?: string;
}

export function ListingLocationBadge({
  locationText,
  coordinates,
  className = '',
}: ListingLocationBadgeProps) {
  const { location, isNeutral, openSelector } = useLocation();

  let distanceKm: number | null = null;
  if (
    !isNeutral &&
    coordinates &&
    coordinates.length === 2 &&
    !isNaN(coordinates[0]) &&
    !isNaN(coordinates[1]) &&
    location.coordinates &&
    location.coordinates.length === 2
  ) {
    const [lon1, lat1] = location.coordinates;
    const [lon2, lat2] = coordinates;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = Math.round(R * c * 10) / 10;
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-medium text-zinc-900 dark:text-white">{locationText || 'Location'}</span>
      </div>

      {distanceKm !== null && (
        <>
          <span className="text-zinc-400 dark:text-zinc-600">·</span>
          <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
            {distanceKm} km away (straight-line)
          </span>
        </>
      )}

      <span className="text-zinc-400 dark:text-zinc-600">·</span>
      <span className="text-zinc-500 dark:text-zinc-400">
        {isNeutral ? (
          <>Set your location to see distance</>
        ) : (
          <>From: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{location.locality || location.city}</strong></>
        )}
      </span>

      <button
        type="button"
        onClick={openSelector}
        className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 underline font-semibold ml-1 cursor-pointer"
      >
        {isNeutral ? 'Select Base' : 'Change Base'}
      </button>
    </div>
  );
}
