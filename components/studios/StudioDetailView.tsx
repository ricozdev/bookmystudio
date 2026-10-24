'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ImageGallery } from '@/components/common/ImageGallery';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { StudioCard } from '@/components/studios/StudioCard';
import { StudioDetailActions } from '@/components/studios/StudioDetailActions';
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
import { StudioSpace } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';
import { ApiError } from '@/lib/api/client';

interface StudioDetailViewProps {
  slug: string;
  initialStudio?: StudioSpace | null;
}

type ViewStatus = 'loading' | 'success' | 'not_found' | 'network_error' | 'server_error' | 'unpublished';

export function StudioDetailView({ slug, initialStudio }: StudioDetailViewProps) {
  const [studio, setStudio] = useState<StudioSpace | null>(initialStudio || null);
  const [similar, setSimilar] = useState<StudioSpace[]>([]);
  const [status, setStatus] = useState<ViewStatus>(initialStudio ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDraftPreview, setIsDraftPreview] = useState<boolean>(false);
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    marketplaceApi
      .getStudioBySlug(slug)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data) {
          setStudio(res.data);
          setStatus('success');
          setIsDraftPreview(Boolean((res as unknown as { isDraftPreview?: boolean }).isDraftPreview));

          marketplaceApi
            .getStudios({
              category: res.data.category,
              limit: 4,
            })
            .then((simRes) => {
              if (isCancelled) return;
              if (simRes.success && Array.isArray(simRes.data)) {
                const filtered = simRes.data.filter((s) => s.id !== res.data.id && s.slug !== res.data.slug).slice(0, 3);
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
          if (err.status === 404 || err.code === 'STUDIO_NOT_FOUND') {
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
    return <ListingDetailSkeleton category="studio" />;
  }

  if (status === 'not_found') {
    return <ListingNotFound category="studio" identifier={slug} />;
  }

  if (status === 'network_error') {
    return <ListingNetworkError category="studio" onRetry={handleRetry} />;
  }

  if (status === 'server_error') {
    return <ListingServerError onRetry={handleRetry} errorMessage={errorMessage} />;
  }

  if (status === 'unpublished') {
    return <ListingUnpublishedNotice category="studio" publicationStatus="draft" />;
  }

  if (!studio) {
    return <ListingNotFound category="studio" identifier={slug} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8">
      {/* Draft Preview Indicator Banner */}
      {isDraftPreview && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>DRAFT PREVIEW MODE:</strong> This production stage is currently unlisted from the public catalogue.
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
          { label: 'Studios', href: '/studios' },
          { label: studio.name },
        ]}
      />

      {/* Main Studio Title & Top Specs Bar */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950 dark:bg-white text-white dark:text-zinc-950">
              {studio.badgeTopLeft || studio.categoryLabel || 'CERTIFIED STAGE'}
            </span>
            {studio.badgeTopSecondary && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                {studio.badgeTopSecondary}
              </span>
            )}
            <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {studio.categoryLabel || studio.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {studio.name}
          </h1>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            <span>{studio.location}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>{studio.submarket}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{(studio.rating || 5.0).toFixed(2)}</span>
              <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                ({studio.reviewCount || 0} commercial wraps)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <ListingLocationBadge
              locationText={`${studio.location} (${studio.submarket})`}
              coordinates={studio.locationGeo?.coordinates}
            />
          </div>
        </div>

        {/* Top Badges & Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>$2M Direct Insurance Endorsement</span>
          </div>

          <StudioDetailActions
            studioId={studio.id}
            studioName={studio.name}
          />
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (8 cols): Gallery & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Photo Gallery */}
          <ImageGallery
            images={
              studio.galleryImages && studio.galleryImages.length > 0
                ? studio.galleryImages
                : [studio.imageUrl || '/images/studios/apex-stage-c.svg']
            }
            alt={studio.name}
          />

          {/* Key Specifications Grid */}
          {studio.specs && (
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
                STAGE SPECIFICATIONS &amp; CAPACITIES
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Total Floor Area</span>
                  <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block font-mono">
                    {(studio.specs.sqFt || 0).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Ceiling / Truss Height</span>
                  <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block font-mono">
                    {studio.specs.gridHeight || '24 ft to grid'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Power Distribution</span>
                  <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block font-mono">
                    {studio.specs.power || '1200A 3-Phase'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">Loading &amp; Access</span>
                  <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white block">
                    {studio.specs.access || 'Drive-in roll-up door'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Facility Overview & Description */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
              Facility Overview
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {studio.description}
            </p>
          </div>

          {/* Amenities & Set Capabilities */}
          {studio.amenities && studio.amenities.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                Included Facilities &amp; Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {studio.amenities.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Package Highlight */}
          {studio.equipmentHighlight && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                INCLUDED STAGE GEAR PACKAGE
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                {studio.equipmentHighlight}
              </p>
            </div>
          )}

          {/* Location & Logistics Details */}
          <ListingLocationMapCard
            locationGeo={studio.locationGeo}
            locationAddress={studio.locationAddress}
            displayLocation={studio.location}
            submarket={studio.submarket}
            mapUrl={studio.mapUrl || studio.locationAddress?.mapUrl}
          />
        </div>

        {/* Right Column (4 cols): Sticky Reservation & Quote Form */}
        <div className="lg:col-span-4" id="inquiry-form">
          <BookingWidget
            listingId={studio.id}
            category="studio"
            title={studio.name}
            hourlyRate={studio.hourlyRate}
            dayRate10h={studio.dayRate10h}
            location={studio.location}
            imageUrl={studio.imageUrl}
            specsSummary={`${studio.specs?.sqFt?.toLocaleString()} sq ft • ${studio.specs?.gridHeight || '20ft'} Grid`}
          />
        </div>
      </div>

      {/* Similar Studios Section */}
      {similar.length > 0 && (
        <div className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                EXPLORE ALTERNATIVES
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                Similar Certified Production Stages
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {similar.map((sim) => (
              <StudioCard key={sim.id} studio={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Booking Bar */}
      <StickyMobileBookingBar
        listingId={studio.id}
        listingTitle={studio.name}
        price={studio.dayRate10h}
        priceUnit="/day"
        priceSubtitle="10h Standard Day"
        actionLabel="Request Date Hold"
        targetFormId="inquiry-form"
      />
    </div>
  );
}

