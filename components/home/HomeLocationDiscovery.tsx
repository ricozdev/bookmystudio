'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { marketplaceApi } from '@/lib/api/marketplace';
import { StudioSpace, FilmingLocation, ProductionCrewMember, EquipmentItem } from '@/lib/types';
import { StudioCard } from '@/components/studios/StudioCard';
import { LocationCard } from '@/components/locations/LocationCard';
import { CrewCard } from '@/components/crew/CrewCard';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { ArrowRightIcon, SearchIcon, SoundstageIcon, GearCrateIcon } from '@/components/ui/Icons';

export function HomeLocationDiscovery() {
  const router = useRouter();
  const { location, openSelector, locationDisplayLabel, isHydrated, isNeutral } = useLocation();

  const [omniSearchQuery, setOmniSearchQuery] = useState('');
  const [omniCategory, setOmniCategory] = useState<'all' | 'studios' | 'locations' | 'crew' | 'equipment'>('all');

  const [studios, setStudios] = useState<StudioSpace[]>([]);
  const [locations, setLocations] = useState<FilmingLocation[]>([]);
  const [crew, setCrew] = useState<ProductionCrewMember[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);

  const lng = location.coordinates?.[0];
  const lat = location.coordinates?.[1];
  const radiusKm = location.radiusKm;

  // Track fetched query key to derive loading state without synchronous setState in effect
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const currentKey = `${isHydrated}-${isNeutral}-${lng}-${lat}-${radiusKm}`;
  const isLoading = isHydrated && fetchedKey !== currentKey;

  // Fetch live listings within selected location & radius once hydrated
  // Uses isCancelled flag to prevent race conditions and stale query overwrites
  useEffect(() => {
    if (!isHydrated) return;

    let isCancelled = false;

    const params: Record<string, string | number> = { limit: 3 };
    if (!isNeutral && lng !== undefined && lat !== undefined && !isNaN(lng) && !isNaN(lat)) {
      params.lng = lng;
      params.lat = lat;
    }
    if (radiusKm) {
      params.radiusKm = radiusKm;
    }

    Promise.all([
      marketplaceApi.getStudios(params).catch(() => null),
      marketplaceApi.getLocations(params).catch(() => null),
      marketplaceApi.getProfessionals(params).catch(() => null),
      marketplaceApi.getEquipment(params).catch(() => null),
    ])
      .then(([sRes, lRes, cRes, eRes]) => {
        if (isCancelled) return;

        if (sRes?.success && Array.isArray(sRes.data)) {
          setStudios(sRes.data.slice(0, 3));
        }
        if (lRes?.success && Array.isArray(lRes.data)) {
          setLocations(lRes.data.slice(0, 3));
        }
        if (cRes?.success && Array.isArray(cRes.data)) {
          setCrew(cRes.data.slice(0, 3));
        }
        if (eRes?.success && Array.isArray(eRes.data)) {
          setEquipment(eRes.data.slice(0, 3));
        }
      })
      .catch(() => {
        // Safe fallback on network failure
      })
      .finally(() => {
        if (!isCancelled) {
          setFetchedKey(currentKey);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isHydrated, isNeutral, lng, lat, radiusKm, currentKey]);

  const handleOmniSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts: string[] = [];
    if (omniSearchQuery.trim()) {
      queryParts.push(`q=${encodeURIComponent(omniSearchQuery.trim())}`);
    }
    if (omniCategory !== 'all') {
      const destMap = {
        studios: '/studios',
        locations: '/locations',
        crew: '/crew',
        equipment: '/equipment',
      };
      router.push(`${destMap[omniCategory]}${queryParts.length ? `?${queryParts.join('&')}` : ''}`);
      return;
    }
    router.push(`/search${queryParts.length ? `?${queryParts.join('&')}` : ''}`);
  };

  const currentCity = location.locality || location.city || 'Your Area';

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121216] p-4 space-y-3 animate-pulse">
          <div className="aspect-[16/10] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800/60" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800/80 rounded w-2/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800/50 rounded w-1/2" />
          <div className="h-10 bg-zinc-200 dark:bg-zinc-900 rounded-xl" />
        </div>
      ))}
    </div>
  );

  const renderEmptySection = (categoryTitle: string) => (
    <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        No {categoryTitle.toLowerCase()} currently found {isNeutral ? 'across India' : `within ${location.radiusKm} km of ${currentCity}`}.
      </p>
      <p className="text-xs text-zinc-500">
        Try expanding your radius filter or selecting a nearby creative production hub.
      </p>
      <button
        type="button"
        onClick={openSelector}
        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A22] hover:bg-zinc-100 dark:hover:bg-[#22222E] border border-zinc-200 dark:border-zinc-700 hover:border-amber-500/50 text-xs font-semibold text-amber-600 dark:text-amber-400 transition cursor-pointer shadow-xs"
      >
        Change Location / Radius
      </button>
    </div>
  );

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-zinc-800/80 relative transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ========================================================
           1. Interactive Discovery Bar & Omni-Search
           ======================================================== */}
        <div className="rounded-3xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-150">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                    LOCATION-AWARE MARKETPLACE DISCOVERY
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                  {isNeutral ? 'Discover Production Assets Across India' : `Discover Production Assets Near ${currentCity}`}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                  {isNeutral
                    ? 'ALL INDIA · Explore verified stages, locations, crew, and equipment nationwide'
                    : `${locationDisplayLabel} · Showing straight-line distances from your current production base`}
                </p>
              </div>

              {/* Change Location Button */}
              <button
                onClick={openSelector}
                type="button"
                className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1A1A22] hover:bg-zinc-100 dark:hover:bg-[#22222E] border border-zinc-200 dark:border-zinc-700 hover:border-amber-500/50 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition shadow-xs"
              >
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Change Location / Radius</span>
              </button>
            </div>

            {/* Omni-Search Form */}
            <form onSubmit={handleOmniSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <SearchIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={omniSearchQuery}
                  onChange={(e) => setOmniSearchQuery(e.target.value)}
                  placeholder={
                    isNeutral
                      ? 'Search cycloramas, soundstages, union DPs, or lighting gear across India...'
                      : `Search cycloramas, soundstages, union DPs, or lighting gear in ${currentCity}...`
                  }
                  className="w-full bg-white dark:bg-[#1A1A22] border border-zinc-200 dark:border-zinc-700/80 rounded-xl pl-11 pr-4 py-3 min-h-[44px] text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition shadow-xs"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={omniCategory}
                  onChange={(e) =>
                    setOmniCategory(e.target.value as 'all' | 'studios' | 'locations' | 'crew' | 'equipment')
                  }
                  className="flex-1 sm:flex-initial bg-white dark:bg-[#1A1A22] border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="studios">Studios & Stages</option>
                  <option value="locations">Filming Locations</option>
                  <option value="crew">Production Crew</option>
                  <option value="equipment">Equipment & Grip</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
                >
                  <span>Search</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Category Quick Jump Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <Link
                href="/studios"
                className="p-3 rounded-xl bg-white dark:bg-[#181820] hover:bg-zinc-100 dark:hover:bg-[#1F1F2B] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition group flex items-center gap-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <SoundstageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">Studios</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Stages &amp; Lofts</div>
                </div>
              </Link>

              <Link
                href="/locations"
                className="p-3 rounded-xl bg-white dark:bg-[#181820] hover:bg-zinc-100 dark:hover:bg-[#1F1F2B] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition group flex items-center gap-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">Locations</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Warehouses &amp; Sets</div>
                </div>
              </Link>

              <Link
                href="/crew"
                className="p-3 rounded-xl bg-white dark:bg-[#181820] hover:bg-zinc-100 dark:hover:bg-[#1F1F2B] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition group flex items-center gap-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">Crew Roster</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">DPs, Gaffers, Grips</div>
                </div>
              </Link>

              <Link
                href="/equipment"
                className="p-3 rounded-xl bg-white dark:bg-[#181820] hover:bg-zinc-100 dark:hover:bg-[#1F1F2B] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition group flex items-center gap-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GearCrateIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">Equipment</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Cameras &amp; Lighting</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
           2. Studios Near You Section
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                STAGE &amp; SOUNDSTAGE DIRECTORY
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Studios Near {currentCity}
              </h3>
            </div>
            <Link
              href="/studios"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Explore All Studios</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            renderLoadingSkeleton()
          ) : studios.length === 0 ? (
            renderEmptySection('Studios')
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studios.map((s) => (
                <StudioCard key={s.id} studio={s} />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
           3. Filming Locations in Your Area Section
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                ON-LOCATION SCOUTING
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Filming Locations in {currentCity} &amp; Surrounds
              </h3>
            </div>
            <Link
              href="/locations"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Explore All Locations</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            renderLoadingSkeleton()
          ) : locations.length === 0 ? (
            renderEmptySection('Filming Locations')
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((l) => (
                <LocationCard key={l.id} location={l} />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
           4. Production Crew Available Nearby Section
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                UNION &amp; INDEPENDENT TALENT
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Key Crew &amp; Heads of Department in {currentCity}
              </h3>
            </div>
            <Link
              href="/crew"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Explore All Crew</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            renderLoadingSkeleton()
          ) : crew.length === 0 ? (
            renderEmptySection('Crew Members')
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crew.map((c) => (
                <CrewCard key={c.id} member={c} />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
           5. Cinema Equipment Available Nearby Section
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                RENTAL HOUSE PACKAGES
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Equipment &amp; Grip Available in {currentCity}
              </h3>
            </div>
            <Link
              href="/equipment"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Explore All Equipment</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            renderLoadingSkeleton()
          ) : equipment.length === 0 ? (
            renderEmptySection('Equipment Packages')
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((e) => (
                <EquipmentCard key={e.id} equipment={e} />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
