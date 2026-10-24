'use client';

import React from 'react';
import { LocationAddressDetails, LocationGeoPoint } from '@/lib/types';
import { useLocation } from '@/context/LocationContext';
import { isValidGoogleMapsUrl } from '@/lib/location-constants';

interface ListingLocationMapCardProps {
  locationGeo?: LocationGeoPoint;
  locationAddress?: LocationAddressDetails;
  displayLocation?: string;
  submarket?: string;
  mapUrl?: string | null;
  className?: string;
}

export function ListingLocationMapCard({
  locationGeo,
  locationAddress,
  displayLocation,
  submarket,
  mapUrl,
  className = '',
}: ListingLocationMapCardProps) {
  const { location: userHub, isNeutral } = useLocation();

  const coords = locationGeo?.coordinates;
  const hasCoords =
    coords &&
    Array.isArray(coords) &&
    coords.length === 2 &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1]);

  const lng = hasCoords ? coords[0] : null;
  const lat = hasCoords ? coords[1] : null;

  const isExactPublic = locationAddress?.isExactAddressPublic !== false;

  // Compute straight-line distance if user has selected a hub
  let distanceKm: number | null = null;
  if (!isNeutral && hasCoords && lat !== null && lng !== null && userHub.coordinates && userHub.coordinates.length === 2) {
    const [uLon, uLat] = userHub.coordinates;
    const R = 6371;
    const dLat = ((lat - uLat) * Math.PI) / 180;
    const dLon = ((lng - uLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((uLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = Math.round(R * c * 10) / 10;
  }

  // Address lines
  const primaryAddress = isExactPublic && (locationAddress?.formatted || locationAddress?.street)
    ? [locationAddress?.building, locationAddress?.street].filter(Boolean).join(', ') || locationAddress?.formatted
    : `${submarket || locationAddress?.locality || ''}, ${locationAddress?.city || displayLocation || ''}`.replace(/^,\s*/, '');

  const secondaryAddress = [
    locationAddress?.locality,
    locationAddress?.city,
    locationAddress?.state,
    locationAddress?.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const resolvedMapUrl = (mapUrl || locationAddress?.mapUrl || '').trim();
  const hasValidMapLink = isValidGoogleMapsUrl(resolvedMapUrl);

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-5 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Location &amp; Logistics</span>
            {hasCoords && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified GPS Pin
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            {isExactPublic
              ? 'Complete street address and arrival logistics for crew & gear dispatch.'
              : 'Approximate neighborhood location. Exact address disclosed upon booking confirmation.'}
          </p>
        </div>

        {/* View on Google Maps Button - only shown when a valid Google Maps link exists */}
        {hasValidMapLink && (
          <a
            href={resolvedMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on Google Maps"
            className="px-3.5 py-2 min-h-[40px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View on Google Maps</span>
          </a>
        )}
      </div>

      {/* Clean Location Summary Card (Replaces interactive canvas) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-zinc-50 dark:bg-[#18181E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {locationAddress?.locality || submarket || displayLocation || 'Production Location'}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {[locationAddress?.city, locationAddress?.state, locationAddress?.pincode].filter(Boolean).join(', ') || 'India'}
            </div>
          </div>
        </div>

        {hasCoords && lat !== null && lng !== null && (
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">Coordinates</span>
            <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </span>
          </div>
        )}
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
            Production Stage Address
          </span>
          <div className="text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">
            {primaryAddress || displayLocation || 'Address available on request'}
          </div>
          {secondaryAddress && secondaryAddress !== primaryAddress && (
            <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">{secondaryAddress}</div>
          )}
          {distanceKm !== null && (
            <div className="mt-2 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold flex items-center gap-1">
              <span>{distanceKm} km straight-line distance from {userHub.locality || userHub.city}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {locationAddress?.landmark && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                Landmark Reference
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">{locationAddress.landmark}</span>
            </div>
          )}

          {locationAddress?.arrivalInstructions && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                Arrival &amp; Loading Access
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                {locationAddress.arrivalInstructions}
              </span>
            </div>
          )}

          {!locationAddress?.landmark && !locationAddress?.arrivalInstructions && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                Loading Bay &amp; Vehicle Access
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                Ground-level load-in and high-cube van clearance available at entrance.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
