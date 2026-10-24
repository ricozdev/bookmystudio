'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, AdminMetrics } from '@/lib/api/admin';
import { AuthUser } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { SearchIcon } from '@/components/ui/Icons';

export default function AdminUsersPage() {
  const { user: currentAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Status Action Modal / Confirmation
  const [actionUser, setActionUser] = useState<AuthUser | null>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'ACTIVATE'>('SUSPEND');
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchUsersAndMetrics = async () => {
      try {
        setErrorMsg(null);
        const [usersRes, metricsRes] = await Promise.all([
          adminApi.getUsers({
            page,
            limit: 15,
            search: activeSearch.trim() || undefined,
            role: roleFilter !== 'all' ? roleFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          }),
          adminApi.getMetrics().catch(() => null),
        ]);

        if (!ignore && usersRes.success && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
          if (usersRes.pagination) {
            setTotalPages(usersRes.pagination.pages || 1);
            setTotalCount(usersRes.pagination.total || 0);
          }
        }
        if (!ignore && metricsRes?.success && metricsRes.data) {
          setMetrics(metricsRes.data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch user directory.';
          setErrorMsg(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUsersAndMetrics();

    return () => {
      ignore = true;
    };
  }, [page, roleFilter, statusFilter, activeSearch, refreshKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setActiveSearch(searchInput);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleOpenStatusModal = (targetUser: AuthUser, type: 'SUSPEND' | 'ACTIVATE') => {
    setActionUser(targetUser);
    setActionType(type);
    setActionReason(type === 'SUSPEND' ? 'Violation of marketplace terms or suspected unauthorized hold.' : 'Verified producer credentials.');
    setErrorMsg(null);
  };

  const handleExecuteStatusChange = async () => {
    if (!actionUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newStatus = actionType === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';
      const res = await adminApi.updateUserStatus(actionUser.id, newStatus, actionReason);
      if (res.success) {
        setSuccessMsg(`Account ${actionUser.email} status updated to ${newStatus}.`);
        setActionUser(null);
        handleRefresh();
      } else {
        throw new Error(res.message || 'Failed to update account status.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating user status.';
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
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Platform User Registry</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Manage registered producers, studio owners, creative talent, and account access ({totalCount} total records)
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 self-start sm:self-auto cursor-pointer transition-colors"
        >
          ↻ Refresh List
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

      {/* Database KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Accounts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>REGISTERED ACCOUNTS</span>
            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">USER DB</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {metrics ? metrics.users.total.toLocaleString() : totalCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Active: <strong className="text-emerald-600 dark:text-emerald-400">{metrics?.users.active ?? totalCount}</strong></span>
            <span>Suspended: <strong className="text-rose-600 dark:text-rose-400">{metrics?.users.suspended ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 2: Marketplace Roles */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>MARKETPLACE ROLES</span>
            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">BUYER / HOST</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {metrics?.users.customers ?? '—'} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Buyers</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Partners: <strong className="text-amber-600 dark:text-amber-400">{metrics?.users.partners ?? '—'}</strong></span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Hosts &amp; Talent</span>
          </div>
        </div>

        {/* Card 3: Administrative Access */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>SECURITY ACCESS</span>
            <span className="text-[9px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">RBAC</span>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {(metrics?.users.admins ?? 0) + (metrics?.users.superAdmins ?? 0)} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Admins</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Super Admins: <strong className="text-purple-600 dark:text-purple-400">{metrics?.users.superAdmins ?? '—'}</strong></span>
            <span>Curators: <strong className="text-zinc-700 dark:text-zinc-300">{metrics?.users.admins ?? '—'}</strong></span>
          </div>
        </div>

        {/* Card 4: Live Online Presence */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <span>ONLINE PRESENCE</span>
            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400">STATUS</span>
          </div>
          <div className="text-2xl font-black text-zinc-500 dark:text-zinc-400">
            Unavailable
          </div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800 truncate" title="Presence heartbeat not configured; no simulated users displayed.">
            Presence heartbeat not configured; zero simulated users.
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by full name, work email, company, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="STUDIO_OWNER">Studio Owners</option>
            <option value="PROFESSIONAL">Professionals</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>

          <button
            type="button"
            onClick={() => { setSearchInput(''); setActiveSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}
            className="px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#18181E] text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">User &amp; Organization</th>
                <th className="px-4 py-3">Assigned Roles</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Registration Date</th>
                <th className="px-4 py-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
                    Loading platform user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No users matching the active filter criteria were found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentSelf = currentAdmin?.id === u.id;
                  const isTargetSuperAdmin = u.roles?.includes('SUPER_ADMIN');
                  const canModerateThisUser = !isCurrentSelf && (!isTargetSuperAdmin || isSuperAdmin);

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrentSelf && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">{u.email}</div>
                            {u.companyName && (
                              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{u.companyName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {u.roles?.map((r) => {
                            let badgeStyle = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700';
                            if (r === 'SUPER_ADMIN') badgeStyle = 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold';
                            else if (r === 'ADMIN') badgeStyle = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold';
                            else if (r === 'STUDIO_OWNER') badgeStyle = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
                            else if (r === 'PROFESSIONAL') badgeStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';

                            return (
                              <span
                                key={r}
                                className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border ${badgeStyle}`}
                              >
                                {r}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                            u.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : u.accountStatus === 'SUSPENDED'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className={u.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>
                              {u.isVerified ? '✓ Email Verified' : '○ Email Unverified'}
                            </span>
                          </div>
                          {u.isPhoneVerified && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">✓ Phone Verified</div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                        {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString() : 'Never recorded'}
                      </td>

                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {canModerateThisUser ? (
                          u.accountStatus === 'SUSPENDED' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(u, 'ACTIVATE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(u, 'SUSPEND')}
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-zinc-50 dark:bg-[#18181E] border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>
              Page {page} of {totalPages}
            </span>
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
      {actionUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {actionType === 'SUSPEND' ? 'Suspend User Account' : 'Reactivate User Account'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Target Account: <strong className="text-zinc-900 dark:text-white">{actionUser.fullName}</strong> ({actionUser.email})
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                Administrative Reason (Recorded in Immutable Audit Log)
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1A1A22] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                placeholder="Specify the reason for this administrative moderation..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActionUser(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !actionReason.trim()}
                onClick={handleExecuteStatusChange}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  actionType === 'SUSPEND'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
