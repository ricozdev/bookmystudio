'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ImageGallery } from '@/components/common/ImageGallery';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { CrewCard } from '@/components/crew/CrewCard';
import { StickyMobileBookingBar } from '@/components/common/StickyMobileBookingBar';
import { StarIcon, CheckCircleIcon, ShieldPolicyIcon } from '@/components/ui/Icons';
import { ListingLocationBadge } from '@/components/location/ListingLocationBadge';
import {
  ListingDetailSkeleton,
  ListingNotFound,
  ListingNetworkError,
  ListingServerError,
  ListingUnpublishedNotice,
} from '@/components/common/ListingDetailState';
import { ProductionCrewMember } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';
import { ApiError } from '@/lib/api/client';

interface CrewDetailViewProps {
  slug: string;
  initialMember?: ProductionCrewMember | null;
}

type ViewStatus = 'loading' | 'success' | 'not_found' | 'network_error' | 'server_error' | 'unpublished';

export function CrewDetailView({ slug, initialMember }: CrewDetailViewProps) {
  const [member, setMember] = useState<ProductionCrewMember | null>(initialMember || null);
  const [similar, setSimilar] = useState<ProductionCrewMember[]>([]);
  const [status, setStatus] = useState<ViewStatus>(initialMember ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDraftPreview, setIsDraftPreview] = useState<boolean>(false);
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    marketplaceApi
      .getProfessionalBySlug(slug)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data) {
          setMember(res.data);
          setStatus('success');
          setIsDraftPreview(Boolean((res as unknown as { isDraftPreview?: boolean }).isDraftPreview));

          marketplaceApi
            .getProfessionals({
              category: res.data.category,
              limit: 4,
            })
            .then((simRes) => {
              if (isCancelled) return;
              if (simRes.success && Array.isArray(simRes.data)) {
                const filtered = simRes.data.filter((c) => c.id !== res.data.id && c.slug !== res.data.slug).slice(0, 3);
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
          if (err.status === 404 || err.code === 'CREW_NOT_FOUND') {
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
    return <ListingDetailSkeleton category="crew" />;
  }

  if (status === 'not_found') {
    return <ListingNotFound category="crew" identifier={slug} />;
  }

  if (status === 'network_error') {
    return <ListingNetworkError category="crew" onRetry={handleRetry} />;
  }

  if (status === 'server_error') {
    return <ListingServerError onRetry={handleRetry} errorMessage={errorMessage} />;
  }

  if (status === 'unpublished') {
    return <ListingUnpublishedNotice category="crew" publicationStatus="draft" />;
  }

  if (!member) {
    return <ListingNotFound category="crew" identifier={slug} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8">
      {/* Draft Preview Indicator Banner */}
      {isDraftPreview && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>DRAFT PREVIEW MODE:</strong> This crew profile is currently unlisted from the public catalogue.
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
          { label: 'Production Crew', href: '/crew' },
          { label: member.name },
        ]}
      />

      {/* Header */}
      <div className="mt-2 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-950 dark:bg-white text-white dark:text-zinc-950">
              {member.role}
            </span>
            {member.unionAffiliation && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                {member.unionAffiliation}
              </span>
            )}
            <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {member.location}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {member.name}
          </h1>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            {member.credits && (
              <>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{member.credits}</span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
              </>
            )}
            <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{(member.rating || 5.0).toFixed(2)}</span>
              <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                ({member.reviewCount || 0} confirmed wraps)
              </span>
            </div>
            {member.nextAvailable && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Next Available: {member.nextAvailable}
                </span>
              </>
            )}
          </div>

          <div className="mt-3">
            <ListingLocationBadge
              locationText={member.location}
              coordinates={member.locationGeo?.coordinates}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold">
            <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Standard Kit Included &amp; Insured</span>
          </div>
        </div>
      </div>

      {/* 2-Column Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <ImageGallery
            images={
              member.galleryImages && member.galleryImages.length > 0
                ? member.galleryImages
                : [member.imageUrl || '/images/crew/dp.jpg']
            }
            alt={member.name}
          />

          {/* Biography */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
              Professional Background &amp; Approach
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {member.bio}
            </p>
          </div>

          {/* Working Kit Specification */}
          {member.workingKit && (
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                OWNER-OPERATOR WORKING KIT (INCLUDED)
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {member.workingKit}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                All owner-operator gear packages are pre-inspected and covered under standard production insurance endorsements.
              </p>
            </div>
          )}

          {/* Skills Checklist */}
          {member.skills && member.skills.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                Technical Core Competencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {member.skills.map((skill) => (
                  <div key={skill} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4" id="inquiry-form">
          <BookingWidget
            listingId={member.id}
            category="crew"
            title={member.name}
            hourlyRate={Math.round(member.dayRate10h / 10)}
            dayRate10h={member.dayRate10h}
            location={member.location}
            imageUrl={member.imageUrl}
            specsSummary={`${member.role} • ${member.category?.replace('_', ' ').toUpperCase()}`}
          />
        </div>
      </div>

      {/* Similar Crew */}
      {similar.length > 0 && (
        <div className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                ADDITIONAL TALENT
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                Similar Heads of Department
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {similar.map((sim) => (
              <CrewCard key={sim.id} member={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Booking Bar */}
      <StickyMobileBookingBar
        listingId={member.id}
        listingTitle={member.name}
        price={member.dayRate10h}
        priceUnit="/day"
        priceSubtitle="10h Commercial Day Rate"
        actionLabel="Hold Crew Date"
        targetFormId="inquiry-form"
      />
    </div>
  );
}

