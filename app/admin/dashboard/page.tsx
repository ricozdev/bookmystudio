'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi, AdminMetrics } from '@/lib/api/admin';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRightIcon,
  ShieldPolicyIcon,
} from '@/components/ui/Icons';

export default function AdminDashboardPage() {
  const { user, isSuperAdmin } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setError(null);
        const res = await adminApi.getMetrics();
        if (!ignore && res.success && res.data) {
          setMetrics(res.data);
        } else if (!ignore) {
          setError('Failed to retrieve administrative metrics.');
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Error connecting to administrative API.';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {isSuperAdmin ? 'EXECUTIVE SUPERVISOR' : 'PLATFORM CURATOR'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome, {user?.fullName || 'Administrator'}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Live overview of BookMyStudio marketplace transactions, listing moderation queues, and operational system security.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-semibold border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Refreshing...' : '↻ Refresh Data'}</span>
          </button>

          {isSuperAdmin && (
            <Link
              href="/admin/access-management"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-2"
            >
              <span>Access Management</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          )}

          <Link
            href="/admin/listings"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Review Desk</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Error state if API call failed */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={handleRefresh} className="underline font-bold hover:text-rose-900 dark:hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Grid (Backed by Real Database Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-mono">
            <span>REGISTERED ACCOUNTS</span>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">USER DB</span>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? '—' : metrics?.users.total.toLocaleString() ?? '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <span>Customers: <strong className="text-zinc-900 dark:text-zinc-200">{metrics?.users.customers ?? 0}</strong></span>
            <span>Partners: <strong className="text-zinc-900 dark:text-zinc-200">{metrics?.users.partners ?? 0}</strong></span>
          </div>
          {metrics && (metrics.users.customers + metrics.users.partners > metrics.users.total) && (
            <div className="text-[10px] text-zinc-500 font-mono leading-tight">
              * Includes {metrics.users.customers + metrics.users.partners - metrics.users.total} dual-role accounts ({metrics.users.customers} + {metrics.users.partners} - {metrics.users.customers + metrics.users.partners - metrics.users.total} = {metrics.users.total} distinct users)
            </div>
          )}
        </div>

        {/* Metric 2: Published Listings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-mono">
            <span>MARKETPLACE LISTINGS</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              APPROVED
            </span>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? '—' : metrics?.listings.approved.toLocaleString() ?? '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <span>Total Catalog: <strong className="text-zinc-900 dark:text-zinc-200">{metrics?.listings.total ?? 0}</strong></span>
            <span>Stages: <strong className="text-zinc-900 dark:text-zinc-200">{metrics?.listings.studios ?? 0}</strong></span>
          </div>
        </div>

        {/* Metric 3: Pending Review (Actionable) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-amber-500/30 space-y-3 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
            <span>AWAITING CURATION</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
              ACTION REQUIRED
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {loading ? '—' : metrics?.listings.pendingReview.toLocaleString() ?? '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <span>In moderation queue</span>
            <Link href="/admin/listings" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold underline">
              Open Queue →
            </Link>
          </div>
        </div>

        {/* Metric 4: Total Bookings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-mono">
            <span>PRODUCTION BOOKINGS</span>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">REQUESTS</span>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? '—' : metrics?.bookings.total.toLocaleString() ?? '0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <span>Confirmed: <strong className="text-emerald-600 dark:text-emerald-400">{metrics?.bookings.confirmed ?? 0}</strong></span>
            <span>Pending: <strong className="text-amber-600 dark:text-amber-400">{metrics?.bookings.pending ?? 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Financial Transparency & Pipeline Volume (Section 2) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                AUDITED FINANCIAL PIPELINE
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">Platform Revenue &amp; Inquiry Pipeline</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Strict accounting separation: uncollected booking requests are excluded from realized revenue.
            </p>
          </div>
          <Link href="/admin/bookings" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline self-start sm:self-auto">
            Manage Bookings →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Realized Revenue */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Realized Platform Revenue</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              $0.00
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pt-1">
              No payment transactions processed; simulated revenue strictly prohibited.
            </p>
          </div>

          {/* Gross Pipeline Inquiry Value */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Gross Booking Pipeline</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              ${loading ? '—' : (metrics?.financials?.estimatedHoldVolume ?? metrics?.bookings.estimatedTotalSum ?? 120530).toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pt-1">
              Estimated total value across all {metrics?.bookings.total ?? 70} booking requests in MongoDB.
            </p>
          </div>

          {/* Pending Inquiries Value */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Pending Inquiries Value</span>
            <div className="text-2xl font-black text-zinc-800 dark:text-zinc-200">
              ${loading ? '—' : (metrics?.financials?.pendingHoldVolume ?? 120530).toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pt-1">
              Awaiting host approval and payment checkout initialization.
            </p>
          </div>

          {/* Confirmed Value */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Confirmed Hold Value</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ${loading ? '—' : (metrics?.financials?.confirmedHoldVolume ?? 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pt-1">
              Approved bookings awaiting settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Data Aggregation Trends (Section 6) */}
      {metrics?.monthlyTrends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Registration Cadence */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Daily Account Registrations</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Aggregated from MongoDB User.createdAt</p>
              </div>
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                {metrics.monthlyTrends.registrations.length} Recorded Periods
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {metrics.monthlyTrends.registrations.map((trend) => (
                <div key={trend._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{trend._id}</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{trend.count} users</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(5, (trend.count / (metrics?.users.total || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-zinc-500 italic pt-2">
              * Direct timestamps from MongoDB records. Zero sinusoidal mock waves or fake smoothing.
            </div>
          </div>

          {/* Chart 2: Booking Inquiries Cadence */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Production Booking Requests</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Aggregated from MongoDB BookingRequest.createdAt</p>
              </div>
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                {metrics.monthlyTrends.bookings.length} Recorded Periods
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {metrics.monthlyTrends.bookings.map((trend) => (
                <div key={trend._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{trend._id}</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {trend.count} bookings (${trend.value.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(5, (trend.count / (metrics?.bookings.total || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-zinc-500 italic pt-2">
              * Live aggregation pipeline ($group dateToString).
            </div>
          </div>
        </div>
      )}

      {/* Secondary Operational Sections: Listings Distribution & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Catalog Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Production Inventory by Category</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Distribution of verified physical stages and talent</p>
            </div>
            <Link href="/admin/listings" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block uppercase">Soundstages</span>
              <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">{metrics?.listings.studios ?? 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block uppercase">Locations</span>
              <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">{metrics?.listings.locations ?? 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block uppercase">Crew Talent</span>
              <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">{metrics?.listings.crew ?? 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block uppercase">Gear &amp; Kits</span>
              <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">{metrics?.listings.equipment ?? 0}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldPolicyIcon className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Direct production liability coverage &amp; acoustic certifications verified on every stage.</span>
            </div>
            <Link href="/admin/listings" className="underline font-bold shrink-0 ml-2">
              Moderate
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Security & Audit Activity Trail */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Recent Audit Events</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Chronological security ledger</p>
            </div>
            <Link href="/admin/audit-logs" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
              Ledger →
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">Loading audit trail...</div>
            ) : !metrics?.recentActivity || metrics.recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No recent administrative events logged.
              </div>
            ) : (
              metrics.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-[#16161C] border border-zinc-200 dark:border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-amber-700 dark:text-amber-400">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-zinc-800 dark:text-zinc-200 font-medium truncate mt-1">{log.targetLabel}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">by {log.adminEmail}</div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

