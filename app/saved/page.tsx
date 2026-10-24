'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { StudioCard } from '@/components/studios/StudioCard';
import { LocationCard } from '@/components/locations/LocationCard';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { ShareIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';
import { marketplaceApi } from '@/lib/api/marketplace';
import { StudioSpace, FilmingLocation, EquipmentItem } from '@/lib/types';

type SavedTab = 'all' | 'studios' | 'locations' | 'equipment';

export default function SavedPage() {
  const { bookmarkedIds, toggleBookmark } = useMarketplace();
  const [activeTab, setActiveTab] = useState<SavedTab>('all');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  const [savedStudios, setSavedStudios] = useState<StudioSpace[]>([]);
  const [savedLocations, setSavedLocations] = useState<FilmingLocation[]>([]);
  const [savedEquipment, setSavedEquipment] = useState<EquipmentItem[]>([]);
  const [dbSavedRecordIds, setDbSavedRecordIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    marketplaceApi
      .getSavedItems()
      .then((res) => {
        if (!active) return;
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const studios: StudioSpace[] = [];
          const locations: FilmingLocation[] = [];
          const equipment: EquipmentItem[] = [];
          const recordIds: string[] = [];

          res.data.forEach((item) => {
            const recId = String(item.id || item._id || '');
            if (recId) recordIds.push(recId);

            if (item.itemType === 'studio' && item.studio) {
              studios.push(item.studio as StudioSpace);
            } else if (item.itemType === 'location' && item.location) {
              locations.push(item.location as FilmingLocation);
            } else if (item.itemType === 'equipment' && item.equipment) {
              equipment.push(item.equipment as EquipmentItem);
            }
          });

          setSavedStudios(studios);
          setSavedLocations(locations);
          setSavedEquipment(equipment);
          setDbSavedRecordIds(recordIds);
        } else if (bookmarkedIds.length > 0) {
          // If guest user with localStorage bookmarks, hydrate matching active listings
          Promise.all([
            marketplaceApi.getStudios().catch(() => null),
            marketplaceApi.getLocations().catch(() => null),
            marketplaceApi.getEquipment().catch(() => null),
          ]).then(([sRes, lRes, eRes]) => {
            if (!active) return;
            if (sRes?.success && Array.isArray(sRes.data)) {
              setSavedStudios(sRes.data.filter((s) => bookmarkedIds.includes(s.id)));
            }
            if (lRes?.success && Array.isArray(lRes.data)) {
              setSavedLocations(lRes.data.filter((l) => bookmarkedIds.includes(l.id)));
            }
            if (eRes?.success && Array.isArray(eRes.data)) {
              setSavedEquipment(eRes.data.filter((e) => bookmarkedIds.includes(e.id)));
            }
          });
        } else {
          setSavedStudios([]);
          setSavedLocations([]);
          setSavedEquipment([]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookmarkedIds]);

  const totalSavedCount = savedStudios.length + savedLocations.length + savedEquipment.length;

  const handleShareShortlist = () => {
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const handleClearAll = async () => {
    // Delete database records
    for (const recId of dbSavedRecordIds) {
      await marketplaceApi.removeSavedItem(recId).catch(() => {});
    }
    // Clear localStorage bookmarks
    bookmarkedIds.forEach((id) => toggleBookmark(id));
    setSavedStudios([]);
    setSavedLocations([]);
    setSavedEquipment([]);
    setDbSavedRecordIds([]);
  };

  return (
    <div className="py-8 bg-white dark:bg-[#09090B] min-h-[calc(100vh-140px)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Saved Listings' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                PRODUCTION SHORTLIST
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Saved Spaces &amp; Equipment
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Compare stages, daylight suites, filming locations, and grip packages shortlisted for your upcoming commercial shoot.
            </p>
          </div>

          {/* Share & Clear Actions */}
          {totalSavedCount > 0 && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleShareShortlist}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ShareIcon className="w-3.5 h-3.5" />
                <span>{copyFeedback ? 'Link Copied!' : 'Share Shortlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Share Toast Banner */}
        {copyFeedback && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-950 dark:bg-zinc-800 text-white border border-zinc-800 text-xs flex items-center justify-between">
            <span>Shareable shortlist link copied to clipboard. Ready for client and producer deck review.</span>
            <span className="text-zinc-400 text-[10px] uppercase font-mono">Production Shortlist</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-4 space-y-3 animate-pulse"
              >
                <div className="w-full h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-2/3 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-1/2 h-3 rounded bg-zinc-150 dark:bg-zinc-850" />
              </div>
            ))}
          </div>
        ) : totalSavedCount === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Your Saved Shortlist is Empty"
              description="You have not bookmarked any production stages, filming locations, or gear packages yet. Click the bookmark icon on any listing card to save it for quick reference."
              actionLabel="Explore Production Studios"
              actionHref="/studios"
            />
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                All Items ({totalSavedCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('studios')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'studios'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                Studios ({savedStudios.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('locations')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'locations'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                Filming Locations ({savedLocations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('equipment')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'equipment'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                Equipment ({savedEquipment.length})
              </button>
            </div>

            {/* List Grids */}
            <div className="mt-8 space-y-12">
              {/* Studios */}
              {(activeTab === 'all' || activeTab === 'studios') && savedStudios.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                      Shortlisted Studios &amp; Stages ({savedStudios.length})
                    </h2>
                    <Link
                      href="/studios"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Browse More Studios</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {savedStudios.map((studio) => (
                      <StudioCard key={studio.id} studio={studio} />
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              {(activeTab === 'all' || activeTab === 'locations') && savedLocations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                      Shortlisted Filming Locations ({savedLocations.length})
                    </h2>
                    <Link
                      href="/locations"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Browse More Locations</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {savedLocations.map((location) => (
                      <LocationCard key={location.id} location={location} />
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {(activeTab === 'all' || activeTab === 'equipment') && savedEquipment.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                      Shortlisted Equipment Kits ({savedEquipment.length})
                    </h2>
                    <Link
                      href="/equipment"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Browse More Equipment</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {savedEquipment.map((equipment) => (
                      <EquipmentCard key={equipment.id} equipment={equipment} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
