'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ImageGallery } from '@/components/common/ImageGallery';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { LocationCard } from '@/components/locations/LocationCard';
import { StickyMobileBookingBar } from '@/components/common/StickyMobileBookingBar';
import { StarIcon, CheckCircleIcon, ShieldPolicyIcon } from '@/components/ui/Icons';
import { ListingLocationBadge } from '@/components/location/ListingLocationBadge';
import { ListingLocationMapCard } from '@/components/location/ListingLocationMapCard';
import {
  ListingDetailSkeleton,
  ListingNotFound,
  ListingNetworkError,
  ListingServerError,
  ListingUnpublishedNotice,
} from '@/components/common/ListingDetailState';
import { FilmingLocation } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';
import { ApiError } from '@/lib/api/client';

interface LocationDetailViewProps {
  slug: string;
  initialLocation?: FilmingLocation | null;
}

type ViewStatus = 'loading' | 'success' | 'not_found' | 'network_error' | 'server_error' | 'unpublished';

export function LocationDetailView({ slug, initialLocation }: LocationDetailViewProps) {
  const [location, setLocation] = useState<FilmingLocation | null>(initialLocation || null);
  const [similar, setSimilar] = useState<FilmingLocation[]>([]);
  const [status, setStatus] = useState<ViewStatus>(initialLocation ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDraftPreview, setIsDraftPreview] = useState<boolean>(false);
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    marketplaceApi
      .getLocationBySlug(slug)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data) {
          setLocation(res.data);
          setStatus('success');
          setIsDraftPreview(Boolean((res as unknown as { isDraftPreview?: boolean }).isDraftPreview));

          marketplaceApi
            .getLocations({
              category: res.data.category,
              limit: 4,
            })
            .then((simRes) => {
              if (isCancelled) return;
              if (simRes.success && Array.isArray(simRes.data)) {
                const filtered = simRes.data.filter((l) => l.id !== res.data.id && l.slug !== res.data.slug).slice(0, 3);
                setSimilar(filtered);
              }
            })
            .catch(() => {});
          return;
        }

        setStatus('not_found');
      })
      .catch((err: unknown) => {
        if (isCancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 404 || err.code === 'LOCATION_NOT_FOUND') {
            setStatus('not_found');
          } else if (err.status === 403 || err.code === 'LISTING_UNPUBLISHED') {
            setStatus('unpublished');
          } else if (err.status === 0 || err.code === 'NETWORK_ERROR') {
            setStatus('network_error');
          } else {
            setErrorMessage(err.message);
            setStatus('server_error');
          }
        } else {
          setStatus('server_error');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [slug, retryCounter]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    setRetryCounter((c) => c + 1);
  };

  if (status === 'loading') {
    return <ListingDetailSkeleton category="location" />;
  }

  if (status === 'not_found') {
    return <ListingNotFound category="location" identifier={slug} />;
  }

  if (status === 'network_error') {
    return <ListingNetworkError category="location" onRetry={handleRetry} />;
  }

  if (status === 'server_error') {
    return <ListingServerError onRetry={handleRetry} errorMessage={errorMessage} />;
  }

  if (status === 'unpublished') {
    return <ListingUnpublishedNotice category="location" publicationStatus="draft" />;
  }

  if (!location) {
    return <ListingNotFound category="location" identifier={slug} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8">
      {/* Draft Preview Indicator Banner */}
      {isDraftPreview && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>DRAFT PREVIEW MODE:</strong> This filming location is currently unlisted from the public catalogue.
            </span>
          </div>
          <Link
            href="/dashboard?tab=listings"
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Manage in Dashboard
          </Link>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Filming Locations', href: '/locations' },
          { label: location.name },
        ]}
      />

      {/* Header */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950 dark:bg-white text-white dark:text-zinc-950">
              {location.categoryLabel || location.category || 'FILMING LOCATION'}
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {location.submarket}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {location.name}
          </h1>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            <span>{location.location}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{(location.rating || 5.0).toFixed(2)}</span>
              <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                ({location.reviewCount || 0} scouts)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <ListingLocationBadge
              locationText={`${location.location} (${location.submarket})`}
              coordinates={location.locationGeo?.coordinates}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Direct Commercial Film Insurance</span>
          </div>
        </div>
      </div>

      {/* 2-Column Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <ImageGallery
            images={
              location.galleryImages && location.galleryImages.length > 0
                ? location.galleryImages
                : [location.imageUrl || '/images/locations/warehouse.jpg']
            }
            alt={location.name}
          />

          {/* Key Location Specifications */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              LOCATION SPECIFICATIONS &amp; LOGISTICS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Total Area</span>
                <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block font-mono">
                  {(location.areaSqFt || 0).toLocaleString()} sq ft
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Ceiling Height</span>
                <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block font-mono">
                  {location.ceilingHeight || '18 ft'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Power Supply</span>
                <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block font-mono">
                  {location.powerSupply || '600A Camlock'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Vehicle Access</span>
                <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block truncate">
                  {location.vehicleAccess || 'Direct Roll-up Door'}
                </span>
              </div>
            </div>

            {(location.permitsRequired || location.curfewRestrictions) && (
              <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {location.permitsRequired && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block">Permits &amp; Authorizations</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">{location.permitsRequired}</span>
                  </div>
                )}
                {location.curfewRestrictions && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block">Curfews &amp; Sound Rules</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">{location.curfewRestrictions}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
              Location Scouting Notes
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {location.description}
            </p>
          </div>

          {/* Amenities */}
          {location.amenities && location.amenities.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                Production Logistics &amp; Basecamp Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {location.amenities.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Logistics Details */}
          <ListingLocationMapCard
            locationGeo={location.locationGeo}
            locationAddress={location.locationAddress}
            displayLocation={location.location}
            submarket={location.submarket}
            mapUrl={location.mapUrl || location.locationAddress?.mapUrl}
          />
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4" id="inquiry-form">
          <BookingWidget
            listingId={location.id}
            category="location"
            title={location.name}
            hourlyRate={location.hourlyRate}
            dayRate10h={location.dayRate10h}
            location={location.location}
            imageUrl={location.imageUrl}
            specsSummary={`${location.areaSqFt?.toLocaleString()} sq ft • ${location.submarket || location.location}`}
          />
        </div>
      </div>

      {/* Similar Locations */}
      {similar.length > 0 && (
        <div className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                ALTERNATIVE SETS
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                Similar Commercial Filming Locations
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {similar.map((sim) => (
              <LocationCard key={sim.id} location={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Booking Bar */}
      <StickyMobileBookingBar
        listingId={location.id}
        listingTitle={location.name}
        price={location.dayRate10h}
        priceUnit="/day"
        priceSubtitle="10h Commercial Day Rate"
        actionLabel="Inquire for Shoot"
        targetFormId="inquiry-form"
      />
    </div>
  );
}

