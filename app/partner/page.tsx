'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldPolicyIcon,
  WarehouseIcon,
  GearCrateIcon,
  CalendarIcon,
  AlertCircleIcon,
  ClapperboardIcon,
  LocationPinIcon,
  StarIcon,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import {
  marketplaceApi,
  MyListingSummary,
  ListingType,
  ListingReviewStatus,
  PartnerOverviewData,
} from '@/lib/api/marketplace';
import {
  ListingLocationFormSection,
  ListingLocationData,
} from '@/components/location/ListingLocationFormSection';
import { LocationGeoPoint, LocationAddressDetails } from '@/lib/types';
import { BrandLogo } from '@/components/common/BrandLogo';

type PartnerTab =
  | 'dashboard'
  | 'listings'
  | 'bookings'
  | 'calendar'
  | 'earnings'
  | 'reviews'
  | 'analytics'
  | 'settings';

interface InboundBooking {
  id: string;
  stageName: string;
  productionTitle: string;
  producerName: string;
  contactEmail: string;
  companyName: string;
  shootDate: string;
  shiftHours: string;
  bookingValue: number;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
}

interface BlackoutDate {
  id: string;
  stageName: string;
  date: string;
  reason: string;
  listingId?: string;
  listingType?: string;
}

function CurrencyRupeeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l5 6M6 4h12" />
    </svg>
  );
}

function PartnerConsoleSkeleton() {
  return (
    <div className="py-16 bg-[var(--bg-page)] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Loading partner business console...</span>
      </div>
    </div>
  );
}

function PartnerConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isVendor, becomeVendor } = useAuth();

  const tabParam = (searchParams.get('tab') as PartnerTab) || 'dashboard';
  const activeTab: PartnerTab = [
    'dashboard',
    'listings',
    'bookings',
    'calendar',
    'earnings',
    'reviews',
    'analytics',
    'settings',
  ].includes(tabParam)
    ? tabParam
    : 'dashboard';

  const setTab = (newTab: PartnerTab) => {
    router.push(`/partner?tab=${newTab}`);
  };

  // State: Partner Metrics Overview
  const [overview, setOverview] = useState<PartnerOverviewData | null>(null);

  // State: My Listings
  const [myListings, setMyListings] = useState<MyListingSummary[]>([]);
  const [listingCounts, setListingCounts] = useState({
    total: 0,
    studios: 0,
    locations: 0,
    crew: 0,
    equipment: 0,
    published: 0,
    pendingReview: 0,
    approved: 0,
    changesRequested: 0,
    drafts: 0,
  });
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | ListingType>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | ListingReviewStatus>('all');
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State: Inbound Bookings
  const [inboundBookings, setInboundBookings] = useState<InboundBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');

  // State: Calendar Blackout Dates (Hydrated from persistent MongoDB listing records)
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [newBlackoutStage, setNewBlackoutStage] = useState('Commercial Soundstage');
  const [newBlackoutDate, setNewBlackoutDate] = useState('2026-12-01');
  const [newBlackoutReason, setNewBlackoutReason] = useState('Facility Scheduled Maintenance');
  const [blackoutNotice, setBlackoutNotice] = useState<string | null>(null);

  // State: Location Editing Modal
  const [editingLocationListing, setEditingLocationListing] = useState<{
    type: ListingType;
    id: string;
    title: string;
    locationData: ListingLocationData;
  } | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationSaveError, setLocationSaveError] = useState<string | null>(null);

  // State: Onboarding
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  // Fetch live overview statistics
  const fetchOverview = useCallback(async () => {
    try {
      const res = await marketplaceApi.getPartnerOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Extract live blocked dates from listing documents
  const extractBlackoutDates = (listings: MyListingSummary[]): BlackoutDate[] => {
    const dates: BlackoutDate[] = [];
    listings.forEach((item) => {
      const raw = item.raw as Record<string, unknown> | undefined;
      const rawBlocks = raw?.blockedDates;
      if (Array.isArray(rawBlocks)) {
        rawBlocks.forEach((blockItem: unknown) => {
          const b = blockItem as Record<string, unknown>;
          dates.push({
            id: String(b._id || b.id || Math.random()),
            stageName: item.title,
            date: b.startDate ? new Date(String(b.startDate)).toISOString().split('T')[0] : 'N/A',
            reason: String(b.reason || 'Scheduled Maintenance'),
            listingId: item.id,
            listingType: item.type,
          });
        });
      }
    });
    return dates;
  };

  // Fetch live owned listings
  const fetchMyListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const res = await marketplaceApi.getMyListings();
      if (res.success && Array.isArray(res.data)) {
        setMyListings(res.data);
        if (res.counts) {
          setListingCounts(res.counts);
        }
        const liveBlocks = extractBlackoutDates(res.data);
        if (liveBlocks.length > 0) setBlackoutDates(liveBlocks);
      }
    } catch {
      // Safe fallback
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  // Fetch live inbound partner bookings
  const fetchBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await marketplaceApi.getBookings({ as: 'partner' });
      if (res.success && Array.isArray(res.data)) {
        const mapped: InboundBooking[] = res.data.map((b: Record<string, unknown>) => {
          const studio = b.studio as Record<string, unknown> | undefined;
          const customer = b.customer as Record<string, unknown> | undefined;
          return {
            id: String(b.id || b._id || ''),
            stageName: String(studio?.name || b.productionName || 'Studio Space'),
            productionTitle: String(b.productionName || 'Commercial Campaign'),
            producerName: String(customer?.fullName || customer?.name || 'Commercial Client'),
            contactEmail: String(b.contactEmail || customer?.email || 'client@production.com'),
            companyName: String(customer?.companyName || 'Production Agency'),
            shootDate: new Date(String(b.requestedDate || '')).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            shiftHours: String(b.shiftType || '10-Hour Commercial Shift'),
            bookingValue: Number(b.estimatedTotal || 0),
            status: (b.status as InboundBooking['status']) || 'pending',
          };
        });
        setInboundBookings(mapped);
      }
    } catch {
      // Safe fallback
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // Hydrate data asynchronously when user is authenticated partner
  useEffect(() => {
    if (!user || !isVendor) return;

    let active = true;

    marketplaceApi.getPartnerOverview().then((res) => {
      if (active && res.success && res.data) {
        setOverview(res.data);
      }
    }).catch(() => {});

    marketplaceApi.getMyListings().then((res) => {
      if (active && res.success && Array.isArray(res.data)) {
        setMyListings(res.data);
        if (res.counts) setListingCounts(res.counts);
        const liveBlocks = extractBlackoutDates(res.data);
        if (liveBlocks.length > 0) setBlackoutDates(liveBlocks);
      }
    }).catch(() => {});

    marketplaceApi.getBookings({ as: 'partner' }).then((res) => {
      if (active && res.success && Array.isArray(res.data)) {
        const mapped: InboundBooking[] = res.data.map((b: Record<string, unknown>) => {
          const studio = b.studio as Record<string, unknown> | undefined;
          const customer = b.customer as Record<string, unknown> | undefined;
          return {
            id: String(b.id || b._id || ''),
            stageName: String(studio?.name || b.productionName || 'Studio Space'),
            productionTitle: String(b.productionName || 'Commercial Campaign'),
            producerName: String(customer?.fullName || customer?.name || 'Commercial Client'),
            contactEmail: String(b.contactEmail || customer?.email || 'client@production.com'),
            companyName: String(customer?.companyName || 'Production Agency'),
            shootDate: new Date(String(b.requestedDate || '')).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            shiftHours: String(b.shiftType || '10-Hour Commercial Shift'),
            bookingValue: Number(b.estimatedTotal || 0),
            status: (b.status as InboundBooking['status']) || 'pending',
          };
        });
        setInboundBookings(mapped);
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [user, isVendor]);

  // Activate / Publish listing
  const handlePublishListing = async (type: ListingType, id: string) => {
    try {
      const res = await marketplaceApi.publishListing(type, id);
      if (res.success) {
        setActionNotice({ message: 'Listing published successfully!', type: 'success' });
        await fetchMyListings();
        await fetchOverview();
        await fetchBookings();
      } else {
        setActionNotice({ message: res.error || 'Failed to publish listing.', type: 'error' });
      }
    } catch {
      setActionNotice({ message: 'An unexpected error occurred.', type: 'error' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Deactivate / Unpublish listing
  const handleUnpublishListing = async (type: ListingType, id: string) => {
    try {
      const res = await marketplaceApi.unpublishListing(type, id);
      if (res.success) {
        setActionNotice({ message: 'Listing unpublished and moved to draft.', type: 'success' });
        await fetchMyListings();
        await fetchOverview();
        await fetchBookings();
      } else {
        setActionNotice({ message: res.error || 'Failed to unpublish listing.', type: 'error' });
      }
    } catch {
      setActionNotice({ message: 'An unexpected error occurred.', type: 'error' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Inbound Booking Status updates
  const handleUpdateBookingStatus = async (id: string, newStatus: 'confirmed' | 'declined') => {
    try {
      const res = await marketplaceApi.updateBookingStatus(id, newStatus);
      if (res.success) {
        setInboundBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        setActionNotice({
          message: `Booking hold ${newStatus === 'confirmed' ? 'accepted' : 'declined'} successfully.`,
          type: 'success',
        });
        await fetchOverview();
        await fetchBookings();
      } else {
        setActionNotice({ message: res.error || 'Failed to update booking status.', type: 'error' });
      }
    } catch {
      setActionNotice({ message: 'Could not update booking status.', type: 'error' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Blackout Date Actions
  const handleAddBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate) return;

    const targetListing = myListings.find((l) => l.title === newBlackoutStage) || myListings[0];
    let createdBlockId = `blk-${Date.now()}`;
    if (targetListing) {
      const res = await marketplaceApi
        .addBlockedDate(targetListing.type, targetListing.id, {
          startDate: newBlackoutDate,
          endDate: newBlackoutDate,
          reason: newBlackoutReason,
        })
        .catch(() => null);
      const data = res?.data as Record<string, unknown> | undefined;
      if (data && (data._id || data.id)) {
        createdBlockId = String(data._id || data.id);
      }
    }

    const item: BlackoutDate = {
      id: createdBlockId,
      stageName: targetListing?.title || newBlackoutStage,
      date: newBlackoutDate,
      reason: newBlackoutReason,
      listingId: targetListing?.id,
      listingType: targetListing?.type,
    };
    setBlackoutDates((prev) => [item, ...prev]);
    setBlackoutNotice(`Blackout scheduled for ${item.stageName} on ${newBlackoutDate}.`);
    setTimeout(() => setBlackoutNotice(null), 4000);
  };

  const handleRemoveBlackout = async (id: string) => {
    const existing = blackoutDates.find((b) => b.id === id);
    const targetListing = myListings.find((l) => l.id === existing?.listingId) || myListings[0];
    if (targetListing && !id.startsWith('blk-')) {
      await marketplaceApi.removeBlockedDate(targetListing.type, targetListing.id, id).catch(() => {});
    }
    setBlackoutDates((prev) => prev.filter((b) => b.id !== id));
  };

  // Quick Onboarding Activation for existing logged-in users
  const handleQuickActivate = async () => {
    setIsUpgrading(true);
    setUpgradeError(null);
    try {
      const res = await becomeVendor({
        vendorTypes: ['studio'],
        companyName: user?.companyName || null,
        phone: user?.phone || null,
      });

      if (res.success) {
        setUpgradeSuccess('Partner privileges activated! Welcome to the BMS Partner Network.');
        router.refresh();
      } else {
        setUpgradeError(res.error || 'Failed to activate partner privileges. Please try again.');
      }
    } catch (err: unknown) {
      setUpgradeError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Save location updates
  const handleSaveListingLocation = async () => {
    if (!editingLocationListing) return;
    setIsSavingLocation(true);
    setLocationSaveError(null);
    try {
      const { type, id, locationData } = editingLocationListing;
      const res = await marketplaceApi.updateListingLocation(type, id, {
        locationGeo: locationData.locationGeo,
        locationAddress: locationData.locationAddress,
        location: locationData.location,
        submarket: locationData.submarket,
        pickupLocation: locationData.pickupLocation,
        serviceRadiusKm: locationData.serviceRadiusKm,
        deliveryCoverageKm: locationData.deliveryCoverageKm,
      });
      if (res.success) {
        setActionNotice({ message: 'Location updated successfully!', type: 'success' });
        setEditingLocationListing(null);
        await fetchMyListings();
      } else {
        setLocationSaveError(res.error || 'Failed to save location updates.');
      }
    } catch (err: unknown) {
      setLocationSaveError(err instanceof Error ? err.message : 'Error updating listing location.');
    } finally {
      setIsSavingLocation(false);
    }
  };

  if (isLoading) {
    return <PartnerConsoleSkeleton />;
  }

  // Filtered listings
  const filteredListings = myListings.filter((l) => {
    const matchesType = listingTypeFilter === 'all' || l.type === listingTypeFilter;
    const matchesStatus = listingStatusFilter === 'all' || l.reviewStatus === listingStatusFilter;
    return matchesType && matchesStatus;
  });

  // Filtered bookings
  const filteredBookings = inboundBookings.filter((b) => {
    if (bookingStatusFilter === 'all') return true;
    return b.status === bookingStatusFilter;
  });

  return (
    <div className="py-8 bg-[var(--bg-page)] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Partner Console' },
          ]}
        />

        {/* Global Action Notice Toast */}
        {actionNotice && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 border ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            <span>{actionNotice.message}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
           CASE 1: AUTHENTICATED PARTNER (BUSINESS CONSOLE)
           ========================================================================= */}
        {user && isVendor ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Console Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs p-1">
                  <BrandLogo variant="mark" width={44} height={44} priority />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      VERIFIED PARTNER
                    </span>
                    {user.roles?.map((r) => (
                      <span
                        key={r}
                        className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {user.companyName || user.fullName || 'Partner Business Console'}
                  </h1>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Manage studio soundstages, filming locations, crew talent, rate cards, and schedule holds.
                  </p>
                </div>
              </div>

              {/* Header Action Shortcuts */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  href="/list-your-studio"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold text-xs transition-colors shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <span className="text-sm leading-none font-black">+</span>
                  <span>Add New Listing</span>
                </Link>
                <Link
                  href="/"
                  className="px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  View Marketplace &rarr;
                </Link>
              </div>
            </div>

            {/* Nav Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800/80">
              {[
                { id: 'dashboard', label: 'Dashboard Overview' },
                { id: 'listings', label: `My Listings (${listingCounts.total})` },
                { id: 'bookings', label: `Bookings & Requests (${inboundBookings.length})` },
                { id: 'calendar', label: 'Calendar & Availability' },
                { id: 'earnings', label: 'Earnings & Payouts' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'settings', label: 'Business Profile' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTab(tab.id as PartnerTab)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ===================================================================
               TAB 1: DASHBOARD OVERVIEW
               =================================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-150">
                
                {/* Real Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1: Total & Active Listings */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                      <span>Total Listings</span>
                      <WarehouseIcon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                        {overview?.listings.total ?? listingCounts.total}
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        {overview?.listings.active ?? listingCounts.published} active
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {overview?.listings.drafts ?? listingCounts.drafts} drafts in progress
                    </p>
                  </div>

                  {/* Metric 2: Pending Booking Holds */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                      <span>Pending Inquiries</span>
                      <CalendarIcon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                        {overview?.bookings.pendingCount ?? inboundBookings.filter((b) => b.status === 'pending').length}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">awaiting action</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {overview?.bookings.totalInquiries ?? inboundBookings.length} total shoot inquiries
                    </p>
                  </div>

                  {/* Metric 3: Confirmed Bookings */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                      <span>Confirmed Bookings</span>
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                        {overview?.bookings.confirmedCount ?? inboundBookings.filter((b) => b.status === 'confirmed').length}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">shoots locked</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">All verified dates</p>
                  </div>

                  {/* Metric 4: Net Earnings */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                      <span>Net Partner Earnings</span>
                      <CurrencyRupeeIcon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                        ₹{(overview?.earnings.totalNet ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      ₹{(overview?.earnings.pendingPipelineGross ?? 0).toLocaleString('en-IN')} pending in pipeline
                    </p>
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
                    QUICK ACTIONS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link
                      href="/list-your-studio"
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] hover:bg-zinc-100 dark:hover:bg-[#202028] border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                          +
                        </span>
                        <span>Add New Listing</span>
                      </div>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setTab('calendar')}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] hover:bg-zinc-100 dark:hover:bg-[#202028] border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <CalendarIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>Update Availability</span>
                      </div>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab('bookings')}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] hover:bg-zinc-100 dark:hover:bg-[#202028] border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <ClapperboardIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>View Inbound Requests</span>
                      </div>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab('listings')}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] hover:bg-zinc-100 dark:hover:bg-[#202028] border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <WarehouseIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>Manage Listings</span>
                      </div>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Recent Booking Activity Feed */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Inbound Booking Requests</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Direct inquiries submitted by commercial clients</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('bookings')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {inboundBookings.length === 0 ? (
                    <EmptyState
                      title="No Booking Requests Yet"
                      description="When commercial clients and directors submit date holds for your stages, they will appear here."
                      actionLabel="View Marketplace"
                      actionHref="/"
                    />
                  ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                      {inboundBookings.slice(0, 4).map((b) => (
                        <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-zinc-900 dark:text-white">{b.productionTitle}</span>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : b.status === 'declined'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {b.stageName} · {b.shootDate} ({b.shiftHours})
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Client: {b.producerName} ({b.contactEmail})
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                ₹{b.bookingValue.toLocaleString('en-IN')}
                              </span>
                              <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Gross</span>
                            </div>

                            {b.status === 'pending' && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'declined')}
                                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Listing Performance Summary */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Listing Inventory Breakdown</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Stages, filming locations, and equipment across your portfolio</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('listings')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                    >
                      Manage Listings &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Studio Stages</span>
                      <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listingCounts.studios}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Filming Locations</span>
                      <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listingCounts.locations}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Crew Profiles</span>
                      <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listingCounts.crew}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Cinema Equipment</span>
                      <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{listingCounts.equipment}</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ===================================================================
               TAB 2: MY LISTINGS MANAGEMENT
               =================================================================== */}
            {activeTab === 'listings' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Control Bar: Filters & New Listing */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium mr-1">Category:</span>
                      {(['all', 'studio', 'location', 'crew', 'equipment'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setListingTypeFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                            listingTypeFilter === cat
                              ? 'bg-amber-500 text-zinc-950 font-bold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {cat === 'all' ? 'All' : cat}
                        </button>
                      ))}
                    </div>

                    <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium mr-1">Status:</span>
                      {(['all', 'APPROVED', 'PENDING_REVIEW', 'DRAFT'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setListingStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                            listingStatusFilter === st
                              ? 'bg-amber-500 text-zinc-950 font-bold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {st === 'all' ? 'All' : st === 'APPROVED' ? 'Approved / Live' : st === 'PENDING_REVIEW' ? 'Pending' : 'Draft'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/list-your-studio"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0 text-center"
                  >
                    + Add New Listing
                  </Link>
                </div>

                {/* Listings List */}
                {isLoadingListings ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  </div>
                ) : filteredListings.length === 0 ? (
                  <EmptyState
                    title="No Listings Found"
                    description="You haven't published any listings in this category yet. Monetize your soundstage or filming space today."
                    actionLabel="+ Create New Listing"
                    actionHref="/list-your-studio"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredListings.map((listing) => {
                      const isPublished = listing.publicationStatus === 'published';
                      const publicUrl = `/${listing.type === 'studio' ? 'studios' : listing.type === 'location' ? 'locations' : listing.type === 'crew' ? 'crew' : 'equipment'}/${listing.slug}`;

                      return (
                        <div
                          key={listing.id}
                          className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
                        >
                          <div className="flex items-start gap-4">
                            {listing.thumbnail ? (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                                <Image
                                  src={listing.thumbnail}
                                  alt={listing.title}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                <WarehouseIcon className="w-8 h-8 text-zinc-400" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-bold">
                                  {listing.type}
                                </span>
                                <span
                                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                                    isPublished
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                  }`}
                                >
                                  {isPublished ? 'Published / Live' : 'Draft'}
                                </span>
                              </div>
                              <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{listing.title}</h3>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">{listing.rateLabel}</p>
                              {listing.location && (
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                                  <LocationPinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                                  <span>{listing.location}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center gap-2">
                              {isPublished ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnpublishListing(listing.type, listing.id)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePublishListing(listing.type, listing.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors cursor-pointer"
                                >
                                  Activate
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingLocationListing({
                                    type: listing.type,
                                    id: listing.id,
                                    title: listing.title,
                                    locationData: {
                                      location: listing.location,
                                      locationGeo: listing.raw?.locationGeo as LocationGeoPoint | undefined,
                                      locationAddress: listing.raw?.locationAddress as LocationAddressDetails | undefined,
                                      submarket: listing.raw?.submarket as string | undefined,
                                    },
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
                              >
                                Edit Location
                              </button>
                            </div>

                            <Link
                              href={publicUrl}
                              target="_blank"
                              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold flex items-center gap-1"
                            >
                              <span>Preview View</span>
                              <ArrowRightIcon className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
               TAB 3: BOOKINGS & REQUESTS
               =================================================================== */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Status:</span>
                    {(['all', 'pending', 'confirmed', 'declined'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setBookingStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                          bookingStatusFilter === st
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {st === 'all' ? 'All Requests' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingBookings ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <EmptyState
                    title="No Booking Inquiries"
                    description="You have no commercial shoot inquiries matching this filter."
                    actionLabel="View Calendar"
                    actionHref="/partner?tab=calendar"
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-zinc-900 dark:text-white">{b.productionTitle}</span>
                            <span
                              className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : b.status === 'declined'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {b.status === 'confirmed' ? 'Option 1 Confirmed' : b.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300">
                            <strong>Space:</strong> {b.stageName} · <strong>Shoot Date:</strong> {b.shootDate} ({b.shiftHours})
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            <strong>Client:</strong> {b.producerName} ({b.companyName}) · Contact: {b.contactEmail}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-base font-extrabold text-zinc-900 dark:text-white">
                              ₹{b.bookingValue.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              Net: ₹{(b.bookingValue * 0.9).toLocaleString('en-IN')} (after 10% fee)
                            </div>
                          </div>

                          {b.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Accept Hold
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, 'declined')}
                                className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
               TAB 4: CALENDAR & AVAILABILITY
               =================================================================== */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {blackoutNotice && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    {blackoutNotice}
                  </div>
                )}

                {/* Add Blackout Date Form */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Schedule Facility Blackout / Maintenance</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Block stage dates for cyc repainting, lighting maintenance, or private production holds.
                  </p>

                  <form onSubmit={handleAddBlackout} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">STAGE / SPACE</label>
                      <input
                        type="text"
                        value={newBlackoutStage}
                        onChange={(e) => setNewBlackoutStage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                        placeholder="Stage name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">BLACKOUT DATE</label>
                      <input
                        type="date"
                        value={newBlackoutDate}
                        onChange={(e) => setNewBlackoutDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">REASON / NOTES</label>
                      <input
                        type="text"
                        value={newBlackoutReason}
                        onChange={(e) => setNewBlackoutReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                        placeholder="e.g. Cyc floor maintenance"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-colors cursor-pointer"
                      >
                        Block Date
                      </button>
                    </div>
                  </form>
                </div>

                {/* Active Blackouts List */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Active Calendar Blackouts</h3>
                  {blackoutDates.length === 0 ? (
                    <p className="text-xs text-zinc-500">No blackout dates currently scheduled.</p>
                  ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {blackoutDates.map((b) => (
                        <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{b.stageName}</span>
                            <span className="text-zinc-500 dark:text-zinc-400 ml-2">Date: {b.date}</span>
                            <p className="text-[11px] text-zinc-500">{b.reason}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlackout(b.id)}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================
               TAB 5: EARNINGS & PAYOUTS
               =================================================================== */}
            {activeTab === 'earnings' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Gross Production Volume</span>
                    <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
                      ₹{(overview?.earnings.totalGross ?? 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">From locked commercial bookings</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">BookMyStudio Service Fee (10%)</span>
                    <div className="text-2xl font-extrabold text-zinc-500 dark:text-zinc-400 mt-1">
                      ₹{((overview?.earnings.totalGross ?? 0) * 0.1).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Platform curation &amp; \$2M insurance cover</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Net Partner Earnings</span>
                    <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                      ₹{(overview?.earnings.totalNet ?? 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Disbursed via automated route transfer</p>
                  </div>
                </div>

                {/* Transparent Payout Onboarding Notice */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">Payout Disbursement Status:</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                        {overview?.earnings.payoutStatusLabel || 'Bank Details Configuration Ready'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
                      Net earnings from wrapped commercial bookings are transferred directly to your verified bank account. Configure your IFSC and business account details in Payout Settings.
                    </p>
                  </div>

                  <Link
                    href="/account"
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shrink-0 transition-colors shadow-xs"
                  >
                    Manage Payout Settings &rarr;
                  </Link>
                </div>

                {/* Itemized Ledger Table */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Verified Production Earnings Ledger</h3>
                  {inboundBookings.filter((b) => b.status === 'confirmed').length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      No confirmed booking transactions recorded yet. Once clients complete shoot reservations, transaction items will appear here.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Production Campaign</th>
                            <th className="pb-3 font-semibold">Space / Service</th>
                            <th className="pb-3 font-semibold">Gross</th>
                            <th className="pb-3 font-semibold">Fee (10%)</th>
                            <th className="pb-3 font-semibold">Net Payout</th>
                            <th className="pb-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                          {inboundBookings
                            .filter((b) => b.status === 'confirmed')
                            .map((b) => (
                              <tr key={b.id} className="py-2.5">
                                <td className="py-3 text-zinc-500 dark:text-zinc-400 font-mono">{b.shootDate}</td>
                                <td className="py-3 font-bold text-zinc-900 dark:text-white">{b.productionTitle}</td>
                                <td className="py-3 text-zinc-700 dark:text-zinc-300">{b.stageName}</td>
                                <td className="py-3 text-zinc-700 dark:text-zinc-300">₹{b.bookingValue.toLocaleString('en-IN')}</td>
                                <td className="py-3 text-zinc-500">₹{(b.bookingValue * 0.1).toLocaleString('en-IN')}</td>
                                <td className="py-3 font-bold text-amber-600 dark:text-amber-400">
                                  ₹{(b.bookingValue * 0.9).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3">
                                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    Hold Locked
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================
               TAB 6: REVIEWS (HONEST MISSING FEATURE REPORT)
               =================================================================== */}
            {activeTab === 'reviews' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 max-w-3xl animate-in fade-in duration-150 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Listing Reviews &amp; Client Feedback</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Feature Status: In Development
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  The BookMyStudio client review and rating module is currently scheduled for an upcoming release.
                </p>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">How quality is managed today:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Administrative verification of soundstages, acoustic specs, and power connections.</li>
                    <li>Direct producer COI compliance and insurance validation.</li>
                    <li>Manual quality assurance checks prior to listing publication.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ===================================================================
               TAB 7: ANALYTICS (HONEST MISSING FEATURE REPORT)
               =================================================================== */}
            {activeTab === 'analytics' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 max-w-3xl animate-in fade-in duration-150 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Business Analytics &amp; Search Traffic</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Feature Status: Scheduled
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Granular page view and search-impression telemetry is scheduled for future rollout.
                </p>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Current available performance signals:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Total client booking inquiries received via your Partner Dashboard.</li>
                    <li>Confirmed vs. declined inquiry conversion rates.</li>
                    <li>Active vs. draft listing inventory count.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ===================================================================
               TAB 8: BUSINESS PROFILE & SETTINGS
               =================================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Partner Entity Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Legal Company Name</span>
                      <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{user.companyName || 'Not configured'}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Contact Email</span>
                      <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Verified Phone</span>
                      <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{user.phone || 'Phone verification pending'}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Account Type</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Verified Production Partner</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href="/account"
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-xs"
                    >
                      Edit Account Details &rarr;
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Bank Details &amp; Payout Settings</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Manage bank account numbers, IFSC codes, and legal payout beneficiaries to receive booking disbursements.
                  </p>
                  <Link
                    href="/account"
                    className="inline-block px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-colors border border-zinc-200 dark:border-zinc-700"
                  >
                    Open Payout Configuration &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Modal: Listing Location Form */}
            {editingLocationListing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs">
                <div className="bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        Edit Location: {editingLocationListing.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Update Google Maps link and physical coordinates</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingLocationListing(null)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {locationSaveError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs">
                      {locationSaveError}
                    </div>
                  )}

                  <ListingLocationFormSection
                    type={editingLocationListing.type}
                    value={editingLocationListing.locationData}
                    onChange={(data) =>
                      setEditingLocationListing((prev) => (prev ? { ...prev, locationData: data } : null))
                    }
                  />

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingLocationListing(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveListingLocation}
                      disabled={isSavingLocation}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingLocation ? 'Saving...' : 'Save Location'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : null}

        {/* =========================================================================
           CASE 2: AUTHENTICATED CUSTOMER (UPGRADE / ONBOARDING VIEW)
           ========================================================================= */}
        {user && !isVendor ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
              
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
                  PARTNER PROGRAM ONBOARDING
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                  Join the BookMyStudio Partner Network
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  You are currently logged in with a client account (<strong className="text-zinc-900 dark:text-zinc-200">{user.email}</strong>). Upgrade to partner privileges to monetize soundstages, film sets, cinema packages, or creative talent across India.
                </p>
              </div>

              {upgradeError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                  <span>{upgradeError}</span>
                </div>
              )}

              {upgradeSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{upgradeSuccess}</span>
                </div>
              )}

              {/* Value Props Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500" />
                    <span>Single Account Continuity</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Your existing client bookings, shortlists, and reservations remain permanently intact.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500" />
                    <span>Direct Inquiries</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Receive verified commercial shoot inquiries directly from agency producers and directors.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500" />
                    <span>Calendar Autonomy</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Control booking dates, blackout schedules, and rates on your own terms.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldPolicyIcon className="w-4 h-4 text-amber-500" />
                    <span>$2,000,000 Liability Cover</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Commercial production protection with direct insurance endorsements.
                  </p>
                </div>
              </div>

              {/* Action Cluster */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickActivate}
                  disabled={isUpgrading}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                      <span>Activating Partner Capabilities...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate Partner Capabilities</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <Link
                  href="/become-vendor"
                  className="px-5 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center transition-colors"
                >
                  Configure Full Details &rarr;
                </Link>

                <Link
                  href="/"
                  className="px-4 py-3.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 text-xs font-medium text-center transition-colors"
                >
                  Continue as Client
                </Link>
              </div>

            </div>
          </div>
        ) : null}

        {/* =========================================================================
           CASE 3: UNAUTHENTICATED VISITOR (PARTNER ENTRANCE & SIGN IN)
           ========================================================================= */}
        {!user ? (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-200">
            
            {/* Hero Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden shadow-sm dark:shadow-md">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 text-xs font-mono font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>BOOKMYSTUDIO PARTNER CONSOLE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight max-w-2xl mx-auto">
                The Dedicated Portal for Production Partners
              </h1>

              <p className="mt-4 text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Connect your soundstages, filming locations, camera packages, or creative talent directly with verified commercial producers and agency directors across India.
              </p>

              {/* Login / Register CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login?next=/partner"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <span>Sign In as Partner</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>

                <Link
                  href="/create-account?role=partner"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors"
                >
                  <span>Create Partner Account</span>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Direct Producer Inquiries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Instant Schedule Notification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldPolicyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>$2M Direct Production Insurance</span>
                </div>
              </div>
            </div>

            {/* Partner Categories Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <WarehouseIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Studio Stages &amp; Locations</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Monetize dark stage days. List cycloramas, sound stages, acoustic bays, and filming locations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <GearCrateIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Cinema Gear Packages</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Rent cine bodies, anamorphic glass, grip trucks, and LED lighting grids with standard delivery coverage.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <ClapperboardIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Creative Pros &amp; Crew</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Showcase your reel, credits, and standard 10-hour shoot day rates to incoming productions.
                </p>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}

export default function PartnerPortalPage() {
  return (
    <Suspense fallback={<PartnerConsoleSkeleton />}>
      <PartnerConsoleContent />
    </Suspense>
  );
}