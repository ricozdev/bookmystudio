'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, AdminPartnerItem, AdminMetrics } from '@/lib/api/admin';
import { SearchIcon } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';

export default function AdminPartnersPage() {
  const { user: currentAdmin, isSuperAdmin } = useAuth();
  const [partners, setPartners] = useState<AdminPartnerItem[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Status Action Modal / Confirmation
  const [actionPartner, setActionPartner] = useState<AdminPartnerItem | null>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'ACTIVATE'>('SUSPEND');
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchPartners = async () => {
      try {
        setErrorMsg(null);
        const [res, metricsRes] = await Promise.all([
          adminApi.getPartners({
            page,
            limit: 15,
            search: activeSearch.trim() || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          }),
          adminApi.getMetrics().catch(() => null),
        ]);

        if (!ignore && res.success && Array.isArray(res.data)) {
          setPartners(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.pages || 1);
            setTotalCount(res.pagination.total || 0);
          }
        }
        if (!ignore && metricsRes?.success && metricsRes.data) {
          setMetrics(metricsRes.data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to query partner directory.';
          setErrorMsg(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPartners();

    return () => {
      ignore = true;
    };
  }, [page, activeSearch, statusFilter, refreshKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setActiveSearch(searchInput);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleOpenStatusModal = (partner: AdminPartnerItem, type: 'SUSPEND' | 'ACTIVATE') => {
    setActionPartner(partner);
    setActionType(type);
    setActionReason(
      type === 'SUSPEND'
        ? 'Violation of host safety policies or unverified listing compliance hold.'
        : 'Partner identity and facility audit confirmed.'
    );
    setErrorMsg(null);
  };

  const handleExecuteStatusChange = async () => {
    if (!actionPartner) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newStatus = actionType === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';
      const res = await adminApi.updateUserStatus(actionPartner.id, newStatus, actionReason);
      if (res.success) {
        setSuccessMsg(`Partner ${actionPartner.fullName} status updated to ${newStatus}.`);
        setActionPartner(null);
        handleRefresh();
      } else {
        throw new Error(res.message || 'Failed to update partner account status.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating partner status.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Partner Network Directory</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Verified soundstage operators, film location hosts, and production crew talent ({totalCount} verified partners)
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 cursor-pointer self-start sm:self-auto transition-colors"
        >
          ↻ Refresh Directory
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-zinc-900 dark:hover:text-white">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>✕ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 dark:text-rose-400 hover:text-zinc-900 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Database KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Verified Partner Accounts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>TOTAL PARTNERS</span>
            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">VENDOR REGISTRY</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {totalCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Studio Hosts &amp; Production Crew Talent</span>
          </div>
        </div>

        {/* Card 2: Managed Catalog Inventory */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>CATALOG INVENTORY</span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">APPROVED</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {metrics ? metrics.listings.approved.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Stages: <strong className="text-zinc-800 dark:text-zinc-200">{metrics?.listings.studios ?? 0}</strong></span>
            <span>Talent: <strong className="text-zinc-800 dark:text-zinc-200">{metrics?.listings.crew ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 3: Total Booking Inquiries */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>PRODUCTION INQUIRIES</span>
            <span className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">REQUESTS</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {metrics ? metrics.bookings.total.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Pending: <strong className="text-amber-600 dark:text-amber-400">{metrics?.bookings.pending ?? 0}</strong></span>
            <span>Confirmed: <strong className="text-emerald-600 dark:text-emerald-400">{metrics?.bookings.confirmed ?? 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search partners by name, company, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <button
            type="button"
            onClick={() => { setSearchInput(''); setActiveSearch(''); setStatusFilter('all'); setPage(1); }}
            className="px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#18181E] text-zinc-600 dark:text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Partner Entity</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Catalog Volume</th>
                <th className="px-4 py-3">Inquiries</th>
                <th className="px-4 py-3">Phone Verification</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Onboarded</th>
                <th className="px-4 py-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
                    Querying partner network...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No partner records found matching the active filter criteria.
                  </td>
                </tr>
              ) : (
                partners.map((p) => {
                  const isCurrentSelf = currentAdmin?.id === p.id;
                  const isTargetSuperAdmin = p.roles?.includes('SUPER_ADMIN');
                  const canModerateThisPartner = !isCurrentSelf && (!isTargetSuperAdmin || isSuperAdmin);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-900 dark:text-white">{p.fullName}</div>
                        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{p.email}</div>
                        {p.companyName && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">{p.companyName}</div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.roles?.map((r: string) => (
                            <span
                              key={r}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                r === 'STUDIO_OWNER'
                                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold'
                                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                          <span title="Studios">🏛 {p.listingsCount?.studios || 0}</span>
                          <span title="Locations">📍 {p.listingsCount?.locations || 0}</span>
                          <span title="Crew Profiles">🎬 {p.listingsCount?.crew || 0}</span>
                          <span title="Equipment Kits">📦 {p.listingsCount?.equipment || 0}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-300 dark:border-zinc-700">
                          {p.bookingsCount ?? 0}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {p.isPhoneVerified ? (
                          <span className="text-emerald-600 dark:text-emerald-400">✓ Verified OTP</span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">○ Unverified</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                            p.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {p.accountStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {canModerateThisPartner ? (
                          p.accountStatus === 'SUSPENDED' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(p, 'ACTIVATE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(p, 'SUSPEND')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 bg-zinc-50 dark:bg-[#18181E] border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-800 dark:text-white cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-800 dark:text-white cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Moderation Confirmation Modal */}
      {actionPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#16161C] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {actionType === 'SUSPEND' ? 'Suspend Partner Account' : 'Reactivate Partner Account'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              You are about to change the account status of <strong className="text-amber-600 dark:text-amber-400">{actionPartner.fullName}</strong> ({actionPartner.email}) to <span className="font-mono font-bold">{actionType === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE'}</span>.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">Reason / Audit Trail Note</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#121216] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                placeholder="Reason for suspension or activation..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionPartner(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusChange}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-colors cursor-pointer ${
                  actionType === 'SUSPEND'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isSubmitting ? 'Updating...' : `Confirm ${actionType === 'SUSPEND' ? 'Suspension' : 'Reactivation'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
