'use client';

import React, { createContext, useContext, useSyncExternalStore, useState, useEffect } from 'react';
import { ProductionCrewMember, StudioSpace } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';

export interface CompareResult {
  success: boolean;
  reason?: 'limit_reached' | 'already_added';
}

interface MarketplaceContextType {
  bookmarkedIds: string[];
  selectedCrew: ProductionCrewMember[];
  comparedStudioIds: string[];
  comparedStudios: StudioSpace[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  toggleCrew: (member: ProductionCrewMember) => void;
  removeCrew: (id: string) => void;
  clearCrew: () => void;
  isCrewSelected: (id: string) => boolean;
  // Studio Comparison
  addToCompare: (studioId: string) => CompareResult;
  removeFromCompare: (studioId: string) => void;
  toggleCompare: (studioId: string) => CompareResult;
  clearCompare: () => void;
  isCompared: (studioId: string) => boolean;
  canAddMoreCompare: boolean;
  compareLimit: number;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

// Memory caches for stable reference identity across re-renders
const emptyBookmarks: string[] = [];
let cachedBookmarksRaw = '';
let cachedBookmarks: string[] = emptyBookmarks;

const emptyCrew: ProductionCrewMember[] = [];
let cachedCrewRaw = '';
let cachedCrew: ProductionCrewMember[] = emptyCrew;

const emptyCompare: string[] = [];
let cachedCompareRaw = '';
let cachedCompare: string[] = emptyCompare;

const COMPARE_LIMIT = 3;

function subscribeBookmarks(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bms_bookmarks_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bms_bookmarks_change', callback);
  };
}

function getBookmarksSnapshot(): string[] {
  if (typeof window === 'undefined') return emptyBookmarks;
  try {
    const raw = localStorage.getItem('bms_bookmarks') || '[]';
    if (raw !== cachedBookmarksRaw) {
      cachedBookmarksRaw = raw;
      cachedBookmarks = JSON.parse(raw);
    }
    return cachedBookmarks;
  } catch {
    return emptyBookmarks;
  }
}

function getBookmarksServerSnapshot(): string[] {
  return emptyBookmarks;
}

function subscribeCrew(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bms_crew_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bms_crew_change', callback);
  };
}

function getCrewSnapshot(): ProductionCrewMember[] {
  if (typeof window === 'undefined') return emptyCrew;
  try {
    const raw = localStorage.getItem('bms_crew') || '[]';
    if (raw !== cachedCrewRaw) {
      cachedCrewRaw = raw;
      cachedCrew = JSON.parse(raw);
    }
    return cachedCrew;
  } catch {
    return emptyCrew;
  }
}

function getCrewServerSnapshot(): ProductionCrewMember[] {
  return emptyCrew;
}

function subscribeCompare(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bms_compare_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bms_compare_change', callback);
  };
}

function getCompareSnapshot(): string[] {
  if (typeof window === 'undefined') return emptyCompare;
  try {
    const raw = localStorage.getItem('bms_compare') || '[]';
    if (raw !== cachedCompareRaw) {
      cachedCompareRaw = raw;
      cachedCompare = JSON.parse(raw);
    }
    return cachedCompare;
  } catch {
    return emptyCompare;
  }
}

function getCompareServerSnapshot(): string[] {
  return emptyCompare;
}

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const bookmarkedIds = useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    getBookmarksServerSnapshot
  );

  const selectedCrew = useSyncExternalStore(
    subscribeCrew,
    getCrewSnapshot,
    getCrewServerSnapshot
  );

  const comparedStudioIds = useSyncExternalStore(
    subscribeCompare,
    getCompareSnapshot,
    getCompareServerSnapshot
  );

  const [comparedStudios, setComparedStudios] = useState<StudioSpace[]>([]);

  useEffect(() => {
    let active = true;

    marketplaceApi
      .getComparedStudios()
      .then((res) => {
        if (!active) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setComparedStudios(res.data);
        } else if (comparedStudioIds.length > 0) {
          marketplaceApi
            .getStudios()
            .then((sRes) => {
              if (!active) return;
              if (sRes.success && Array.isArray(sRes.data)) {
                setComparedStudios(sRes.data.filter((s) => comparedStudioIds.includes(s.id)));
              }
            })
            .catch(() => {});
        } else {
          setComparedStudios([]);
        }
      })
      .catch(() => {
        if (!active) return;
        if (comparedStudioIds.length > 0) {
          marketplaceApi
            .getStudios()
            .then((sRes) => {
              if (!active) return;
              if (sRes.success && Array.isArray(sRes.data)) {
                setComparedStudios(sRes.data.filter((s) => comparedStudioIds.includes(s.id)));
              }
            })
            .catch(() => {});
        } else {
          setComparedStudios([]);
        }
      });

    return () => {
      active = false;
    };
  }, [comparedStudioIds]);

  const toggleBookmark = (id: string) => {
    const current = getBookmarksSnapshot();
    const exists = current.includes(id);
    const next = exists ? current.filter((item) => item !== id) : [...current, id];
    try {
      localStorage.setItem('bms_bookmarks', JSON.stringify(next));
      window.dispatchEvent(new Event('bms_bookmarks_change'));
    } catch {
      // Ignore localStorage quotas
    }
    // Sync with MongoDB backend if session is active
    if (!exists) {
      marketplaceApi.addSavedItem('studio', id).catch(() => {});
    } else {
      marketplaceApi.removeSavedItem(id).catch(() => {});
    }
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  const toggleCrew = (member: ProductionCrewMember) => {
    const current = getCrewSnapshot();
    const exists = current.some((m) => m.id === member.id);
    const next = exists ? current.filter((m) => m.id !== member.id) : [...current, member];
    try {
      localStorage.setItem('bms_crew', JSON.stringify(next));
      window.dispatchEvent(new Event('bms_crew_change'));
    } catch {
      // Ignore localStorage quotas
    }
  };

  const removeCrew = (id: string) => {
    const current = getCrewSnapshot();
    const next = current.filter((m) => m.id !== id);
    try {
      localStorage.setItem('bms_crew', JSON.stringify(next));
      window.dispatchEvent(new Event('bms_crew_change'));
    } catch {
      // Ignore localStorage quotas
    }
  };

  const clearCrew = () => {
    try {
      localStorage.setItem('bms_crew', JSON.stringify([]));
      window.dispatchEvent(new Event('bms_crew_change'));
    } catch {
      // Ignore localStorage quotas
    }
  };

  const isCrewSelected = (id: string) => selectedCrew.some((m) => m.id === id);

  // Comparison Handlers
  const addToCompare = (studioId: string): CompareResult => {
    const current = getCompareSnapshot();
    if (current.includes(studioId)) {
      return { success: false, reason: 'already_added' };
    }
    if (current.length >= COMPARE_LIMIT) {
      return { success: false, reason: 'limit_reached' };
    }
    const next = [...current, studioId];
    try {
      localStorage.setItem('bms_compare', JSON.stringify(next));
      window.dispatchEvent(new Event('bms_compare_change'));
      // Sync to MongoDB backend
      marketplaceApi.addStudioToCompare(studioId).catch(() => {});
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const removeFromCompare = (studioId: string) => {
    const current = getCompareSnapshot();
    const next = current.filter((id) => id !== studioId);
    try {
      localStorage.setItem('bms_compare', JSON.stringify(next));
      window.dispatchEvent(new Event('bms_compare_change'));
      marketplaceApi.removeStudioFromCompare(studioId).catch(() => {});
    } catch {
      // Ignore localStorage quotas
    }
  };

  const toggleCompare = (studioId: string): CompareResult => {
    const current = getCompareSnapshot();
    if (current.includes(studioId)) {
      removeFromCompare(studioId);
      return { success: true };
    }
    return addToCompare(studioId);
  };

  const clearCompare = () => {
    try {
      localStorage.setItem('bms_compare', JSON.stringify([]));
      window.dispatchEvent(new Event('bms_compare_change'));
      marketplaceApi.clearCompare().catch(() => {});
    } catch {
      // Ignore localStorage quotas
    }
  };

  const isCompared = (studioId: string) => comparedStudioIds.includes(studioId);
  const canAddMoreCompare = comparedStudioIds.length < COMPARE_LIMIT;

  return (
    <MarketplaceContext.Provider
      value={{
        bookmarkedIds,
        selectedCrew,
        comparedStudioIds,
        comparedStudios,
        toggleBookmark,
        isBookmarked,
        toggleCrew,
        removeCrew,
        clearCrew,
        isCrewSelected,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isCompared,
        canAddMoreCompare,
        compareLimit: COMPARE_LIMIT,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}

