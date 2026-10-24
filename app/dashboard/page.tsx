'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CycloramaCategoryIcon,
  WarehouseIcon,
  GearCrateIcon,
  BookmarkIcon,
  ShieldPolicyIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CompareIcon,
  LocationPinIcon,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { marketplaceApi, MyListingSummary, ListingType, ListingReviewStatus } from '@/lib/api/marketplace';
import { ListingLocationFormSection, ListingLocationData } from '@/components/location/ListingLocationFormSection';
import { LocationGeoPoint, LocationAddressDetails } from '@/lib/types';
import { isValidCoordinates } from '@/lib/location-constants';

interface CommercialHold {
  id: string;
  studioName: string;
  stageSlug: string;
  shootDate: string;
  shiftType: string;
  rate: number;
  status: 'Confirmed 1st Option' | '2nd Option Review' | 'Wrap Completed';
  producerContact: string;
  coiCertificateUrl: string;
}

interface InboundBookingRequest {
  id: string;
  stageName: string;
  productionTitle: string;
  producerName: string;
  companyName: string;
  shootDate: string;
  shiftHours: string;
  bookingValue: number;
  status: 'Pending Host Review' | 'Accepted' | 'Declined';
}

interface BlackoutDate {
  id: string;
  stageName: string;
  date: string;
  reason: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signOut } = useAuth();
  const { bookmarkedIds, selectedCrew } = useMarketplace();

  const urlTab = searchParams.get('tab');

  // Smoothly route partner tabs to the dedicated partner console
  useEffect(() => {
    if (urlTab === 'listings') {
      router.replace('/partner?tab=listings');
    } else if (urlTab === 'host') {
      router.replace('/partner?tab=bookings');
    }
  }, [urlTab, router]);

  const [activePersona, setActivePersona] = useState<'producer' | 'host' | 'listings'>(
    urlTab === 'listings' ? 'listings' : urlTab === 'host' ? 'host' : 'producer'
  );

  // Producer Holds State
  const [producerHolds, setProducerHolds] = useState<CommercialHold[]>([]);

  // Host Inbound Requests State (Hydrated from live MongoDB booking requests)
  const [inboundRequests, setInboundRequests] = useState<InboundBookingRequest[]>([]);

  // Calendar Blackout Dates State (Hydrated from live database records)
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);

  const [newBlackoutStage, setNewBlackoutStage] = useState('Commercial Soundstage');
  const [newBlackoutDate, setNewBlackoutDate] = useState('2026-12-01');
  const [newBlackoutReason, setNewBlackoutReason] = useState('Facility Scheduled Maintenance');
  const [blackoutNotice, setBlackoutNotice] = useState<string | null>(null);

  // Real "My Listings" State
  const [myListings, setMyListings] = useState<MyListingSummary[]>([]);
  const [myListingCounts, setMyListingCounts] = useState({
    total: 0,
    studios: 0,
    locations: 0,
    crew: 0,
    equipment: 0,
    pendingReview: 0,
    approved: 0,
    changesRequested: 0,
    drafts: 0,
  });
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | ListingType>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | ListingReviewStatus>('all');
  const [listingActionNotice, setListingActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Location editing modal state
  const [editingLocationListing, setEditingLocationListing] = useState<{
    type: ListingType;
    id: string;
    title: string;
    locationData: ListingLocationData;
  } | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationSaveError, setLocationSaveError] = useState<string | null>(null);

  const fetchMyListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const res = await marketplaceApi.getMyListings();
      if (res.success && Array.isArray(res.data)) {
        setMyListings(res.data);
        if (res.counts) {
          setMyListingCounts(res.counts);
        }
      }
    } catch {
      // Gracefully handle unauthenticated or network issues
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  // Client-side authentication guard and live data hydration
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?next=/dashboard');
      return;
    }

    if (user) {
      marketplaceApi
        .getMyListings()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setMyListings(res.data);
            if (res.counts) {
              setMyListingCounts(res.counts);
            }
            // Hydrate blackout dates from real listing blockedDates
            const liveBlocks: BlackoutDate[] = [];
            res.data.forEach((item) => {
              const raw = item.raw as Record<string, unknown> | undefined;
              const rawBlocks = raw?.blockedDates;
              if (Array.isArray(rawBlocks)) {
                rawBlocks.forEach((blockItem: unknown) => {
                  const b = blockItem as Record<string, unknown>;
                  liveBlocks.push({
                    id: String(b._id || b.id || Math.random()),
                    stageName: item.title,
                    date: b.startDate ? new Date(String(b.startDate)).toISOString().split('T')[0] : 'N/A',
                    reason: String(b.reason || 'Reserved Maintenance'),
                  });
                });
              }
            });
            if (liveBlocks.length > 0) {
              setBlackoutDates(liveBlocks);
            }
          }
        })
        .catch(() => {});

      marketplaceApi
        .getBookings({ as: 'buyer' })
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped: CommercialHold[] = res.data.map((b: Record<string, unknown>) => {
              const studio = b.studio as Record<string, unknown> | undefined;
              const customer = b.customer as Record<string, unknown> | undefined;
              return {
                id: String(b.id || b._id || ''),
                studioName: String(studio?.name || b.productionName || 'Studio Stage'),
                stageSlug: String(studio?.slug || 'the-greenpoint-cove'),
                shootDate: new Date(String(b.requestedDate || '')).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
                shiftType: String(b.shiftType || '10-Hour Commercial Shift'),
                rate: Number(b.estimatedTotal || 1750),
                status:
                  b.status === 'confirmed'
                    ? 'Confirmed 1st Option'
                    : b.status === 'pending'
                    ? '2nd Option Review'
                    : 'Wrap Completed',
                producerContact: String(b.contactEmail || customer?.email || 'Producer'),
                coiCertificateUrl: '#coi-policy-8492',
              };
            });
            setProducerHolds(mapped);
          }
        })
        .catch(() => {});

      // If user has partner privileges, fetch inbound requests from MongoDB
      marketplaceApi
        .getBookings({ as: 'partner' })
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const mapped: InboundBookingRequest[] = res.data.map((b: Record<string, unknown>) => {
              const studio = b.studio as Record<string, unknown> | undefined;
              const customer = b.customer as Record<string, unknown> | undefined;
              return {
                id: String(b.id || b._id || ''),
                stageName: String(studio?.name || b.productionName || 'Studio Stage'),
                productionTitle: String(b.productionName || 'Production Campaign'),
                producerName: String(customer?.fullName || customer?.name || 'Commercial Client'),
                companyName: String(customer?.companyName || 'Production Agency'),
                shootDate: new Date(String(b.requestedDate || '')).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
                shiftHours: String(b.shiftType || '10-Hour Commercial Shift'),
                bookingValue: Number(b.estimatedTotal || 0),
                status:
                  b.status === 'confirmed'
                    ? 'Accepted'
                    : b.status === 'declined'
                    ? 'Declined'
                    : 'Pending Host Review',
              };
            });
            setInboundRequests(mapped);
          }
        })
        .catch(() => {});
    }
  }, [user, isLoading, router, fetchMyListings]);

  const fullName = user?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creative Producer';
  const email = user?.email || '';
  const isEmailVerified = Boolean(user?.isVerified);
  const isAdmin = Boolean(user?.roles?.includes('ADMIN'));
  const isVendor = Boolean(
    user?.roles?.some((r) => r === 'STUDIO_OWNER' || r === 'PROFESSIONAL' || r === 'ADMIN')
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handleReleaseHold = async (holdId: string) => {
    try {
      await marketplaceApi.updateBookingStatus(holdId, 'cancelled');
    } catch {
      // Continue optimistic state update
    }
    setProducerHolds((prev) => prev.filter((h) => h.id !== holdId));
  };

  const handleAcceptRequest = async (reqId: string) => {
    try {
      await marketplaceApi.updateBookingStatus(reqId, 'confirmed');
    } catch {
      // Continue optimistic state update
    }
    setInboundRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Accepted' } : r))
    );
  };

  const handleDeclineRequest = async (reqId: string) => {
    try {
      await marketplaceApi.updateBookingStatus(reqId, 'declined');
    } catch {
      // Continue optimistic state update
    }
    setInboundRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Declined' } : r))
    );
  };

  const handleAddBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate) return;

    // Attempt to persist to the first matching owned studio in MongoDB
    const targetListing = myListings.find((l) => l.title === newBlackoutStage) || myListings[0];
    if (targetListing) {
      await marketplaceApi
        .addBlockedDate(targetListing.type, targetListing.id, {
          startDate: newBlackoutDate,
          endDate: newBlackoutDate,
          reason: newBlackoutReason,
        })
        .catch(() => {});
    }

    const item: BlackoutDate = {
      id: `blk-${Date.now()}`,
      stageName: targetListing?.title || newBlackoutStage,
      date: newBlackoutDate,
      reason: newBlackoutReason,
    };
    setBlackoutDates((prev) => [item, ...prev]);
    setBlackoutNotice(`Blackout date scheduled for ${item.stageName} on ${newBlackoutDate}.`);
    setTimeout(() => setBlackoutNotice(null), 4000);
  };

  const handleRemoveBlackout = async (id: string) => {
    // If it's a persistent mongo block id, attempt backend unblock
    const targetListing = myListings[0];
    if (targetListing && !id.startsWith('blk-')) {
      await marketplaceApi.removeBlockedDate(targetListing.type, targetListing.id, id).catch(() => {});
    }
    setBlackoutDates((prev) => prev.filter((b) => b.id !== id));
  };

  // Submit Listing for Review / Publication
  const handleSubmitForReview = async (type: ListingType, id: string) => {
    try {
      const res = await marketplaceApi.publishListing(type, id);
      if (res.success) {
        setListingActionNotice({
          message: 'Listing successfully published and is now live in the directory.',
          type: 'success',
        });
        fetchMyListings();
      } else {
        throw new Error(res.message || 'Publishing failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish listing: complete location details required before publication.';
      setListingActionNotice({
        message: msg,
        type: 'error',
      });
    }
    setTimeout(() => setListingActionNotice(null), 8000);
  };

  // Location Edit Handlers
  const handleOpenEditLocation = (item: MyListingSummary) => {
    const raw = item.raw || {};
    const locGeo = raw.locationGeo as LocationGeoPoint | undefined;
    const locAddr = raw.locationAddress as LocationAddressDetails | undefined;

    setEditingLocationListing({
      type: item.type,
      id: item.id,
      title: item.title,
      locationData: {
        locationGeo: locGeo,
        locationAddress: locAddr || {
          formatted: item.location || '',
          city: item.location || '',
          locality: (raw.submarket as string) || '',
        },
        location: item.location || '',
        submarket: (raw.submarket as string) || '',
        pickupLocation: (raw.pickupLocation as string) || (raw.location as string) || '',
        serviceRadiusKm: (raw.serviceRadiusKm as number) || 50,
        deliveryCoverageKm: (raw.deliveryCoverageKm as number) ?? 30,
      },
    });
    setLocationSaveError(null);
  };

  const handleSaveLocation = async () => {
    if (!editingLocationListing) return;
    setIsSavingLocation(true);
    setLocationSaveError(null);

    try {
      const res = await marketplaceApi.updateListingLocation(
        editingLocationListing.type,
        editingLocationListing.id,
        {
          locationGeo: editingLocationListing.locationData.locationGeo,
          locationAddress: editingLocationListing.locationData.locationAddress,
          location: editingLocationListing.locationData.location,
          submarket: editingLocationListing.locationData.submarket,
          pickupLocation: editingLocationListing.locationData.pickupLocation,
          serviceRadiusKm: editingLocationListing.locationData.serviceRadiusKm,
          deliveryCoverageKm: editingLocationListing.locationData.deliveryCoverageKm,
        }
      );

      if (res.success) {
        setListingActionNotice({
          message: `Location details for "${editingLocationListing.title}" updated successfully.`,
          type: 'success',
        });
        setEditingLocationListing(null);
        await fetchMyListings();
      } else {
        throw new Error(res.message || 'Failed to update location.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating location.';
      setLocationSaveError(msg);
    } finally {
      setIsSavingLocation(false);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (type: ListingType, id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await marketplaceApi.deleteListing(type, id);
      if (res.success) {
        setListingActionNotice({
          message: `Listing "${title}" removed successfully.`,
          type: 'success',
        });
        fetchMyListings();
      } else {
        throw new Error(res.message || 'Deletion failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing.';
      setListingActionNotice({
        message: msg,
        type: 'error',
      });
    }
    setTimeout(() => setListingActionNotice(null), 5000);
  };

  // Filter listings
  const filteredListings = myListings.filter((item) => {
    if (listingTypeFilter !== 'all' && item.type !== listingTypeFilter) return false;
    if (listingStatusFilter !== 'all' && item.reviewStatus !== listingStatusFilter) return false;
    return true;
  });

  return (
    <div className="py-8 bg-[var(--bg-page)] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Production Console' },
          ]}
          className="mb-6"
        />

        {/* Dashboard Profile Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
                {activePersona === 'producer'
                  ? 'COMMERCIAL PRODUCER CONSOLE'
                  : activePersona === 'host'
                  ? 'STUDIO & STAGE OPERATOR'
                  : 'MY LISTINGS & VERIFICATION'}
              </span>
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Identity</span>
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                  Email Verification Pending
                </span>
              )}
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-mono">
                  PLATFORM ADMINISTRATOR
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {fullName}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Connected as <strong className="text-zinc-900 dark:text-zinc-200">{email}</strong>. Manage your production holds, facility listings, and verification reviews.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {!isVendor && (
              <Link
                href="/become-vendor"
                className="px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                ✨ Become a Vendor
              </Link>
            )}
            <Link
              href="/list-your-studio"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              + Create New Listing
            </Link>
            {isAdmin && (
              <Link
                href="/admin/listings"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Admin Review Portal →
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Global Action Notification */}
        {listingActionNotice && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              listingActionNotice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            <span>{listingActionNotice.message}</span>
            <button
              type="button"
              onClick={() => setListingActionNotice(null)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Persona Mode Switcher: Producer View vs Facility Host View vs My Listings (Mobile-First Scrolling) */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="w-full lg:w-auto overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-[#121216] p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setActivePersona('producer')}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap select-none ${
                  activePersona === 'producer'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <CycloramaCategoryIcon className="w-4 h-4 text-zinc-950 dark:text-inherit" />
                <span>Producer Console</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('host')}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap select-none ${
                  activePersona === 'host'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <WarehouseIcon className="w-4 h-4 text-zinc-950 dark:text-inherit" />
                <span>Host Operations</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('listings')}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap select-none ${
                  activePersona === 'listings'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <GearCrateIcon className="w-4 h-4 text-zinc-950 dark:text-inherit" />
                <span>My Listings ({myListings.length})</span>
                {myListingCounts.changesRequested > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
            {activePersona === 'producer' && 'Managing holds, shortlists, and union crew'}
            {activePersona === 'host' && 'Managing stage availability and incoming booking holds'}
            {activePersona === 'listings' && 'Tracking review status, reviewer notes, and public publication'}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PRODUCER CONSOLE */}
        {/* ========================================================================= */}
        {activePersona === 'producer' && (
          <div className="mt-8 space-y-10 animate-in fade-in duration-200">
            {/* Quick Access Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <Link
                href="/studios"
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 transition-all group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-white flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    <CycloramaCategoryIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Production Studios</h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Discover seamless cycloramas, STC 60+ soundstages, and daylight lofts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>Browse Stages</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <Link
                href="/saved"
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 transition-all group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-white flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    <BookmarkIcon className="w-5 h-5" filled={bookmarkedIds.length > 0} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Saved Shortlist</h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {bookmarkedIds.length === 0
                      ? 'No stages or gear bookmarked yet.'
                      : `${bookmarkedIds.length} shortlisted items ready for client deck.`}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>View Saved ({bookmarkedIds.length})</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <Link
                href="/crew-list"
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 transition-all group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-white flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    <GearCrateIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Call Sheet Roster</h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {selectedCrew.length === 0
                      ? 'No department heads hired yet.'
                      : `${selectedCrew.length} union & independent heads on file.`}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>Manage Crew ({selectedCrew.length})</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <Link
                href="/compare"
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] hover:border-amber-500/50 transition-all group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-white flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    <CompareIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Facility Spec Matrix</h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Compare camlock power, clear grid height, and direct vehicle drive-in clearance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>Compare Stages</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>

            {/* Active Commercial Stage Holds */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                    Active Commercial Stage Holds ({producerHolds.length})
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Confirmed 1st options and 2nd option reviews booked through your producer account.
                  </p>
                </div>
                <Link
                  href="/studios"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  + Place New Stage Hold
                </Link>
              </div>

              {producerHolds.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {producerHolds.map((hold) => (
                    <div
                      key={hold.id}
                      className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-zinc-900 dark:text-white">{hold.studioName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {hold.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                          <span>Shoot Date: <strong className="text-zinc-900 dark:text-zinc-200">{hold.shootDate}</strong></span>
                          <span>•</span>
                          <span>{hold.shiftType}</span>
                          <span>•</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">${hold.rate.toLocaleString()} / shift</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/studios/${hold.stageSlug}`}
                          className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-semibold transition-colors"
                        >
                          View Facility
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleReleaseHold(hold.id)}
                          className="px-3.5 py-2 rounded-xl border border-red-300 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Release Hold
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="No Active Commercial Holds Found"
                    description="You do not have any pending or confirmed stage holds on file. Explore our verified cycloramas and soundstages to place your next hold."
                    actionLabel="Discover Production Stages"
                    actionHref="/studios"
                  />
                </div>
              )}
            </div>

            {/* Insurance Policy Banner */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldPolicyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
                    $2,000,000 Direct Production Liability Endorsement Active
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-700/90 dark:text-amber-400/90 mt-0.5">
                    Every commercial soundstage hold confirmed on your account automatically includes primary Certificate of Insurance (COI) coverage naming the host stage as Additional Insured.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: HOST OPERATIONS CONSOLE */}
        {/* ========================================================================= */}
        {activePersona === 'host' && (
          <div className="mt-8 space-y-10 animate-in fade-in duration-200">
            {/* Host Operations Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Managed Production Stages
                </span>
                <div className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  {myListingCounts.studios} Stages
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                  {myListingCounts.approved} Published Live
                </span>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Total Managed Listings
                </span>
                <div className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                  {myListingCounts.total} Assets
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-1">
                  {myListingCounts.pendingReview} in curation review
                </span>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Pending Shoot Holds
                </span>
                <div className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  {inboundRequests.filter((r) => r.status === 'Pending Host Review').length} Inbound
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-1">
                  Action required within 24h
                </span>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Partner Status
                </span>
                <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  Active
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-1">
                  Verified production host
                </span>
              </div>
            </div>

            {/* Inbound Stage Inquiries */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                    Inbound Stage Hold Inquiries &amp; Review ({inboundRequests.length})
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Commercial production inquiries awaiting stage manager approval or schedule confirmation.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {inboundRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-zinc-900 dark:text-white">
                          {req.productionTitle}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                            req.status === 'Accepted'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : req.status === 'Declined'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                        <span>Stage: <strong className="text-zinc-900 dark:text-zinc-200">{req.stageName}</strong></span>
                        <span>•</span>
                        <span>Producer: {req.producerName} ({req.companyName})</span>
                        <span>•</span>
                        <span>Date: <strong className="text-zinc-900 dark:text-zinc-200">{req.shootDate}</strong></span>
                        <span>•</span>
                        <span>Hours: {req.shiftHours}</span>
                      </div>

                      <div className="mt-2 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        Estimated Booking Total: ${req.bookingValue.toLocaleString()}
                      </div>
                    </div>

                    {req.status === 'Pending Host Review' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          Accept Hold
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        Request updated: {req.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Blackout Calendar */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Stage Availability Calendar &amp; Maintenance Blackouts
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Block specific calendar dates for maintenance, floor repainting, or off-platform commercial productions.
                </p>
              </div>

              {blackoutNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200">
                  {blackoutNotice}
                </div>
              )}

              <form onSubmit={handleAddBlackout} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Select Stage
                  </label>
                  <select
                    value={newBlackoutStage}
                    onChange={(e) => setNewBlackoutStage(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {myListings.filter((l) => l.type === 'studio').length > 0 ? (
                      myListings
                        .filter((l) => l.type === 'studio')
                        .map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))
                    ) : (
                      <option value="Commercial Soundstage">Commercial Soundstage</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Blackout Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Reason / Note
                  </label>
                  <input
                    type="text"
                    required
                    value={newBlackoutReason}
                    onChange={(e) => setNewBlackoutReason(e.target.value)}
                    placeholder="e.g. Cyc floor repaint"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Block Calendar Date
                </button>
              </form>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Scheduled Calendar Blackouts ({blackoutDates.length})
                </span>
                <div className="space-y-2">
                  {blackoutDates.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-zinc-900 dark:text-white mr-2">{item.stageName}</strong>
                        <span className="font-mono text-amber-600 dark:text-amber-400 mr-2">{item.date}</span>
                        <span className="text-zinc-600 dark:text-zinc-400">({item.reason})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlackout(item.id)}
                        className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer ml-2"
                      >
                        Remove Block
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: MY LISTINGS & VERIFICATION MANAGEMENT */}
        {/* ========================================================================= */}
        {activePersona === 'listings' && (
          <div className="mt-8 space-y-8 animate-in fade-in duration-200">
            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Total Owned</span>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">{myListingCounts.total}</div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Across 4 types</span>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216]">
                <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">Pending Curation</span>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{myListingCounts.pendingReview}</div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Under engineering review</span>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216]">
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">Live &amp; Approved</span>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{myListingCounts.approved}</div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Public in directory</span>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216]">
                <span className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 font-bold">Revisions Needed</span>
                <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{myListingCounts.changesRequested}</div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Feedback provided</span>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">Drafts</span>
                <div className="text-2xl font-bold font-mono text-zinc-700 dark:text-zinc-300 mt-1">{myListingCounts.drafts}</div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Unsubmitted</span>
              </div>
            </div>

            {/* Filter and Search Bar (Mobile-Optimized Horizontal Scroll) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mr-1 shrink-0">Filter Type:</span>
                {(['all', 'studio', 'location', 'crew', 'equipment'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setListingTypeFilter(t)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
                      listingTypeFilter === t
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {t === 'all' && 'All Listings'}
                    {t === 'studio' && 'Studios'}
                    {t === 'location' && 'Locations'}
                    {t === 'crew' && 'Crew'}
                    {t === 'equipment' && 'Equipment'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mr-1 shrink-0">Status:</span>
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value as 'all' | ListingReviewStatus)}
                  className="min-h-[40px] px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="APPROVED">Live &amp; Approved</option>
                  <option value="CHANGES_REQUESTED">Revisions Requested</option>
                  <option value="REJECTED">Declined</option>
                  <option value="DRAFT">Drafts</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            {isLoadingListings ? (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Loading your registered listing assets...
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="space-y-4">
                {filteredListings.map((item) => {
                  const getDetailUrl = () => {
                    switch (item.type) {
                      case 'studio':
                        return `/studios/${item.slug}`;
                      case 'location':
                        return `/locations/${item.slug}`;
                      case 'crew':
                        return `/crew/${item.slug}`;
                      case 'equipment':
                        return `/equipment/${item.slug}`;
                    }
                  };

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {item.thumbnail ? (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                              <Image
                                src={item.thumbnail}
                                alt={item.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                              <GearCrateIcon className="w-6 h-6" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {item.type.toUpperCase()}
                              </span>

                              {/* STATUS BADGE */}
                              {item.reviewStatus === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>LIVE &amp; APPROVED</span>
                                </span>
                              )}
                              {item.reviewStatus === 'PENDING_REVIEW' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
                                  <span>UNDER CURATION REVIEW</span>
                                </span>
                              )}
                              {item.reviewStatus === 'CHANGES_REQUESTED' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                  <span>REVISIONS REQUESTED</span>
                                </span>
                              )}
                              {item.reviewStatus === 'REJECTED' && (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                                  DECLINED
                                </span>
                              )}
                              {item.reviewStatus === 'DRAFT' && (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                  DRAFT
                                </span>
                              )}

                              {/* LOCATION ACCURACY & COMPLETENESS BADGE */}
                              {(() => {
                                const raw = item.raw || {};
                                const locGeo = raw.locationGeo as LocationGeoPoint | undefined;
                                const locAddr = raw.locationAddress as LocationAddressDetails | undefined;
                                const hasGeo = locGeo && isValidCoordinates(locGeo.coordinates);
                                const accuracy = locAddr?.accuracy;
                                if (hasGeo) {
                                  return (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                      <span>GEO: {accuracy ? String(accuracy).toUpperCase() : 'VERIFIED'}</span>
                                    </span>
                                  );
                                }
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                                    <span>LOCATION INCOMPLETE</span>
                                  </span>
                                );
                              })()}
                            </div>

                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                              <span>Category: <strong className="text-zinc-900 dark:text-zinc-200">{item.category}</strong></span>
                              <span>•</span>
                              <span>Rate: <strong className="text-amber-600 dark:text-amber-400 font-mono">{item.rateLabel}</strong></span>
                              {item.location && (
                                <>
                                  <span>•</span>
                                  <span>Location: {item.location}</span>
                                </>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Updated: {new Date(item.updatedAt).toLocaleDateString()} · ID: {item.id}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditLocation(item)}
                            className="px-3 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <LocationPinIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            <span>Edit Location</span>
                          </button>
                          {item.reviewStatus === 'APPROVED' && (
                            <Link
                              href={getDetailUrl()}
                              className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              View Live Listing →
                            </Link>
                          )}

                          {(item.reviewStatus === 'DRAFT' || item.reviewStatus === 'CHANGES_REQUESTED') && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForReview(item.type, item.id)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              Submit for Review
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteListing(item.type, item.id, item.title)}
                            className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Withdraw / Delete
                          </button>
                        </div>
                      </div>

                      {/* REVIEWER FEEDBACK CALLOUT */}
                      {(item.reviewStatus === 'CHANGES_REQUESTED' || item.reviewStatus === 'REJECTED') && item.reviewFeedback && (
                        <div className="mt-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                            <span>Reviewer Feedback &amp; Required Revisions:</span>
                          </div>
                          <p className="text-rose-800/90 dark:text-rose-200/90 leading-relaxed font-mono text-[11px]">
                            {item.reviewFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No Listings Found"
                  description="You have not created any listings matching your current filter criteria. Join our host & supplier network by submitting your production assets."
                  actionLabel="+ Create New Listing"
                  actionHref="/list-your-studio"
                />
              </div>
            )}

            {/* EDIT LISTING LOCATION MODAL */}
            {editingLocationListing && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !isSavingLocation) {
                    setEditingLocationListing(null);
                  }
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="location-edit-modal-title"
              >
                <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-[#27272A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181D]">
                    <div>
                      <h3
                        id="location-edit-modal-title"
                        className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                      >
                        <LocationPinIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        Edit Location &amp; Address
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        Updating location for:{' '}
                        <strong className="text-zinc-900 dark:text-white">{editingLocationListing.title}</strong> (
                        {editingLocationListing.type.toUpperCase()})
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingLocation}
                      onClick={() => setEditingLocationListing(null)}
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      aria-label="Close location editor"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-4">
                    {locationSaveError && (
                      <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200">
                        {locationSaveError}
                      </div>
                    )}

                    <ListingLocationFormSection
                      type={editingLocationListing.type}
                      value={editingLocationListing.locationData}
                      onChange={(updated) =>
                        setEditingLocationListing((prev) =>
                          prev ? { ...prev, locationData: updated } : null
                        )
                      }
                      disabled={isSavingLocation}
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181D]">
                    <button
                      type="button"
                      disabled={isSavingLocation}
                      onClick={() => setEditingLocationListing(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingLocation}
                      onClick={handleSaveLocation}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingLocation ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5 text-zinc-950" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Saving Location...
                        </>
                      ) : (
                        'Save Location Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-zinc-500">Loading production console...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
