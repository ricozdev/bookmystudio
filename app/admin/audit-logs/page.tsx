'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminAuditLogItem } from '@/lib/api/admin';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminApi.getAuditLogs({
        page,
        limit: 25,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        targetType: targetFilter !== 'all' ? targetFilter : undefined,
      });

      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
          setTotalCount(res.pagination.total || 0);
        }
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, targetFilter]);

  useEffect(() => {
    let ignore = false;
    adminApi
      .getAuditLogs({
        page,
        limit: 25,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        targetType: targetFilter !== 'all' ? targetFilter : undefined,
      })
      .then((res) => {
        if (!ignore && res.success && Array.isArray(res.data)) {
          setLogs(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.pages || 1);
            setTotalCount(res.pagination.total || 0);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, actionFilter, targetFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Security &amp; Administrative Audit Ledger</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Immutable chronological record of administrative interventions, role modifications, and moderation actions ({totalCount} entries)
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setPage(1); fetchLogs(); }}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 cursor-pointer self-start sm:self-auto transition-colors"
        >
          ↻ Refresh Ledger
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">Action Type:</span>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Action Types</option>
              <option value="ADMIN_PROVISIONED">Admin Provisioned</option>
              <option value="USER_ROLE_ASSIGNED">User Role Assigned</option>
              <option value="USER_ROLE_REVOKED">User Role Revoked</option>
              <option value="ACCOUNT_SUSPENDED">Account Suspended</option>
              <option value="ACCOUNT_ACTIVATED">Account Activated</option>
              <option value="LISTING_APPROVED">Listing Approved</option>
              <option value="LISTING_CHANGES_REQUESTED">Listing Changes Requested</option>
              <option value="LISTING_REJECTED">Listing Rejected</option>
              <option value="BOOKING_STATUS_MODIFIED">Booking Status Modified</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">Target Domain:</span>
            <select
              value={targetFilter}
              onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Domains</option>
              <option value="USER">User Domain</option>
              <option value="LISTING">Listing Domain</option>
              <option value="BOOKING">Booking Domain</option>
              <option value="SYSTEM">System Domain</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setActionFilter('all'); setTargetFilter('all'); setPage(1); }}
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          Reset Filters
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#18181E] text-zinc-600 dark:text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Acting Administrator</th>
                <th className="px-4 py-3">Action Executed</th>
                <th className="px-4 py-3">Target Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
                    Querying audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No audit records found matching the active filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 dark:text-white">{log.adminName}</div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{log.adminEmail}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-400 border border-zinc-300 dark:border-zinc-700">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                          {log.targetType}
                        </span>
                        <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-xs">{log.targetLabel}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-mono text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                        >
                          View Meta
                        </button>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
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

      {/* Details JSON Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                Audit Event Metadata: {selectedLog.action}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">✕</button>
            </div>

            <div className="text-xs space-y-1 font-mono text-zinc-700 dark:text-zinc-300">
              <div><strong>Target ID:</strong> {selectedLog.targetId}</div>
              <div><strong>Target Label:</strong> {selectedLog.targetLabel}</div>
              <div><strong>Administrator:</strong> {selectedLog.adminEmail}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toISOString()}</div>
            </div>

            <pre className="p-3 rounded-xl bg-zinc-100 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 overflow-x-auto max-h-60">
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-zinc-900 dark:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

