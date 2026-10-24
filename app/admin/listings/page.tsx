'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CheckCircleIcon,
  ShieldPolicyIcon,
  GearCrateIcon,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi, AdminListingSummary } from '@/lib/api/marketplace';

export default function AdminListingsPage() {
  const { user, isLoading } = useAuth();

  const [listings, setListings] = useState<AdminListingSummary[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pendingReview: 0,
    approved: 0,
    changesRequested: 0,
    rejected: 0,
    suspended: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Selected Listing for Review Modal / Drawer
  const [selectedListing, setSelectedListing] = useState<AdminListingSummary | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'SUSPEND'>('APPROVE');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const isAdminOrSuper = Boolean(
    user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')
  );

  const fetchListings = useCallback(async () => {
    try {
      const res = await marketplaceApi.getAdminListings({
        status: statusFilter,
        type: typeFilter,
      });
      if (res.success && Array.isArray(res.data)) {
        setListings(res.data);
        if (res.counts) setCounts(res.counts);
      }
    } catch {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (!isLoading && !isAdminOrSuper) {
      // Non-admin guard
      return;
    }
    if (isAdminOrSuper) {
      marketplaceApi
        .getAdminListings({ status: statusFilter, type: typeFilter })
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setListings(res.data);
            if (res.counts) setCounts(res.counts);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAdminOrSuper, isLoading, statusFilter, typeFilter]);

  if (!isLoading && !isAdminOrSuper) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
          <ShieldPolicyIcon className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Administrator Access Required</h1>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
          The Curation &amp; Review Desk is restricted to verified BookMyStudio platform administrators.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all"
          >
            Return to Marketplace Home
          </Link>
        </div>
      </div>
    );
  }

  const handleOpenReview = (item: AdminListingSummary, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'SUSPEND') => {
    setSelectedListing(item);
    setReviewAction(action);
    setReviewFeedback(
      action === 'APPROVE'
        ? 'Verified floor plans, acoustic certification, and power distribution specs.'
        : ''
    );
    setReviewError(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedListing) return;
    setReviewError(null);

    // Validation check
    if ((reviewAction === 'REQUEST_CHANGES' || reviewAction === 'REJECT') && reviewFeedback.trim().length < 5) {
      setReviewError('Please provide a written explanation of at least 5 characters for the host.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await marketplaceApi.reviewListing(selectedListing.type, selectedListing.id, {
        action: reviewAction,
        feedback: reviewFeedback.trim() || undefined,
      });

      if (res.success) {
        setActionSuccessNotice(
          `Listing "${selectedListing.title}" successfully updated to ${reviewAction}.`
        );
        setSelectedListing(null);
        fetchListings();
      } else {
        throw new Error(res.message || 'Failed to update review status.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during review submission.';
      setReviewError(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-purple-400">
                TRUST &amp; SAFETY CURATION DESK
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              Listing Verification &amp; Curation Portal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Review incoming studio soundstages, locations, union crew, and equipment manifests before granting public marketplace visibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchListings()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Refresh Queue
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Production Dashboard
            </Link>
          </div>
        </div>

        {/* Global Action Success Banner */}
        {actionSuccessNotice && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <span>{actionSuccessNotice}</span>
            <button
              type="button"
              onClick={() => setActionSuccessNotice(null)}
              className="text-zinc-400 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Queue Metrics Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'
                : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">All Submissions</span>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">{counts.total}</div>
            <span className="text-[11px] text-zinc-500">Global catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_REVIEW')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'PENDING_REVIEW'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/80'
                : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">Pending Review</span>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{counts.pendingReview}</div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Action needed</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/80'
                : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">Approved / Live</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{counts.approved}</div>
            <span className="text-[11px] text-zinc-500">Public directory</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('CHANGES_REQUESTED')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'CHANGES_REQUESTED'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/80'
                : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 font-bold">Revisions Needed</span>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{counts.changesRequested}</div>
            <span className="text-[11px] text-zinc-500">Sent back to host</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/80'
                : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold">Declined</span>
            <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{counts.rejected}</div>
            <span className="text-[11px] text-zinc-500">Non-compliant</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'SUSPENDED'
                ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'
                : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">Suspended</span>
            <div className="text-2xl font-bold font-mono text-zinc-700 dark:text-zinc-400 mt-1">{counts.suspended}</div>
            <span className="text-[11px] text-zinc-500">Takedowns</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mr-1">Resource:</span>
            {(['all', 'studio', 'location', 'crew', 'equipment'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {t === 'all' && 'All Types'}
                {t === 'studio' && 'Studios'}
                {t === 'location' && 'Locations'}
                {t === 'crew' && 'Crew'}
                {t === 'equipment' && 'Equipment'}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Showing <strong className="text-zinc-900 dark:text-white">{listings.length}</strong> listings in current queue
          </div>
        </div>

        {/* Listings Queue */}
        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Loading curation review queue...
          </div>
        ) : listings.length > 0 ? (
          <div className="mt-6 space-y-4">
            {listings.map((item) => {
              const isOwnListing = item.ownerInfo?.id === user?.id;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] space-y-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {item.thumbnail ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                          <GearCrateIcon className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {item.type.toUpperCase()}
                          </span>

                          {item.reviewStatus === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>APPROVED</span>
                            </span>
                          )}
                          {item.reviewStatus === 'PENDING_REVIEW' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
                              <span>PENDING CURATION</span>
                            </span>
                          )}
                          {item.reviewStatus === 'CHANGES_REQUESTED' && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              CHANGES REQUESTED
                            </span>
                          )}
                          {item.reviewStatus === 'REJECTED' && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                              REJECTED
                            </span>
                          )}
                          {item.reviewStatus === 'SUSPENDED' && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                              SUSPENDED
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{item.title}</h3>

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

                        {/* Owner Metadata */}
                        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span>Owner: <strong className="text-zinc-900 dark:text-white">{item.ownerInfo?.name || 'Anonymous User'}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-zinc-600 dark:text-zinc-400">{item.ownerInfo?.email}</span>
                            {item.ownerInfo?.companyName && (
                              <>
                                <span>•</span>
                                <span>LLC: {item.ownerInfo.companyName}</span>
                              </>
                            )}
                            {item.ownerInfo?.phone && (
                              <>
                                <span>•</span>
                                <span>Tel: {item.ownerInfo.phone}</span>
                              </>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'Not submitted'} · Updated: {new Date(item.updatedAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Existing Feedback Note */}
                        {item.reviewFeedback && (
                          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                              Reviewer Notes / Feedback:
                            </span>
                            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{item.reviewFeedback}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                      {isOwnListing ? (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] max-w-xs">
                          <strong>Conflict of Interest Barrier:</strong> You cannot approve or review your own listing. Another platform administrator must conduct this review.
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item, 'APPROVE')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 text-center"
                          >
                            ✓ Approve &amp; Publish
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReview(item, 'REQUEST_CHANGES')}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                          >
                            ✎ Request Changes
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReview(item, 'REJECT')}
                            className="px-4 py-2 border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                          >
                            ✕ Decline Listing
                          </button>

                          {item.reviewStatus === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenReview(item, 'SUSPEND')}
                              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                            >
                              Suspend Listing
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No Listings Found in Current Queue"
              description={`There are currently no listings matching the "${statusFilter}" status filter. Check other filters or refresh the queue.`}
              actionLabel="View All Submissions"
              onAction={() => setStatusFilter('all')}
            />
          </div>
        )}

        {/* REVIEW DRAWER / MODAL */}
        {selectedListing && (
          <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="max-w-xl w-full bg-white dark:bg-[#121216] border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto safe-area-bottom">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                    ADMIN DECISION CONSOLE
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                    {reviewAction === 'APPROVE' && 'Approve & Publish Listing'}
                    {reviewAction === 'REQUEST_CHANGES' && 'Request Listing Revisions'}
                    {reviewAction === 'REJECT' && 'Decline Listing Submission'}
                    {reviewAction === 'SUSPEND' && 'Suspend Live Listing'}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Target: <strong className="text-zinc-900 dark:text-white">{selectedListing.title}</strong> ({selectedListing.type})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg font-bold text-lg cursor-pointer"
                  aria-label="Close review dialog"
                >
                  ✕
                </button>
              </div>

              {reviewError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {(reviewAction === 'REQUEST_CHANGES' || reviewAction === 'REJECT')
                    ? 'Written Explanation / Instructions for Host (Required, min 5 chars) *'
                    : 'Curator Internal Log Note (Optional)'}
                </label>
                <textarea
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder={
                    reviewAction === 'REQUEST_CHANGES'
                      ? 'e.g. Please upload floor plans showing 3-phase camlock disconnect box location and clear grid height measurements.'
                      : reviewAction === 'REJECT'
                      ? 'e.g. This space does not meet the minimum acoustic threshold required for BookMyStudio commercial sync-sound productions.'
                      : 'Verified technical specifications, power service, and load-in accommodations.'
                  }
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => setSelectedListing(null)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={handleSubmitReview}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : reviewAction === 'REQUEST_CHANGES'
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isSubmittingReview
                    ? 'Updating...'
                    : reviewAction === 'APPROVE'
                    ? 'Confirm Approval & Publish'
                    : reviewAction === 'REQUEST_CHANGES'
                    ? 'Send Revision Request'
                    : reviewAction === 'REJECT'
                    ? 'Confirm Rejection'
                    : 'Confirm Suspension'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
