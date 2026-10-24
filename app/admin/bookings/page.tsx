'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, AdminBookingItem } from '@/lib/api/admin';
import { SearchIcon } from '@/components/ui/Icons';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Status Modal
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchBookings = async () => {
      try {
        const res = await adminApi.getBookings({
          page,
          limit: 15,
          search: activeSearch.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        });

        if (!ignore && res.success && Array.isArray(res.data)) {
          setBookings(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.pages || 1);
            setTotalCount(res.pagination.total || 0);
          }
        }
      } catch {
        // Non-fatal
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      ignore = true;
    };
  }, [page, statusFilter, activeSearch, refreshKey]);

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return;
    setIsUpdating(true);

    try {
      const res = await adminApi.updateBookingStatus(selectedBooking.id, newStatus, adminNote);
      if (res.success) {
        setNotice(`Booking status updated to ${newStatus}.`);
        setSelectedBooking(null);
        setRefreshKey((k) => k + 1);
      }
    } catch {
      // Handle error
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Production Bookings Registry</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Monitor and moderate commercial stage bookings and equipment holds ({totalCount} requests logged)
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 cursor-pointer self-start sm:self-auto transition-colors"
        >
          ↻ Refresh Bookings
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-zinc-900 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by production name, email, or listing..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="reviewed">Reviewed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Container */}
      <div className="rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        {/* Desktop Bookings Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#18181E] text-zinc-600 dark:text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Production &amp; Type</th>
                <th className="px-4 py-3">Producer Contact</th>
                <th className="px-4 py-3">Requested Shoot Date</th>
                <th className="px-4 py-3">Shift &amp; Hours</th>
                <th className="px-4 py-3">Total Estimated</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
                    Querying bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No booking requests found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 dark:text-white">{b.productionName || 'Untitled Commercial'}</div>
                      <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                        {b.listingType}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-zinc-800 dark:text-zinc-200">{b.contactEmail}</div>
                      {b.contactPhone && (
                        <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{b.contactPhone}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                      {b.requestedDate ? new Date(b.requestedDate).toLocaleDateString() : '—'}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {b.shiftType || 'Standard'} ({b.durationHours || 10}h)
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900 dark:text-white">
                      ${b.estimatedTotal ? b.estimatedTotal.toLocaleString() : '0'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : b.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBooking(b);
                          setNewStatus(b.status);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 text-[11px] font-bold border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                      >
                        Moderate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Booking Cards (< md) */}
        <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
          {loading ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
              Querying bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No booking requests found.
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      {b.productionName || 'Untitled Commercial'}
                    </div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      {b.listingType}
                    </span>
                  </div>
                  <span
                    className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : b.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-[#18181E] p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 block font-medium">Date &amp; Shift</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">
                      {b.requestedDate ? new Date(b.requestedDate).toLocaleDateString() : '—'} • {b.durationHours || 10}h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 block font-medium">Total</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      ${b.estimatedTotal ? b.estimatedTotal.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 truncate">
                    <span className="text-[10px] uppercase text-zinc-400 block font-medium">Contact</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{b.contactEmail}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBooking(b);
                    setNewStatus(b.status);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white transition-colors cursor-pointer text-center"
                >
                  Moderate Request
                </button>
              </div>
            ))
          )}
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

      {/* Moderation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Moderate Production Booking</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Production: <strong className="text-zinc-900 dark:text-white">{selectedBooking.productionName}</strong> ({selectedBooking.contactEmail})
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">Set Booking Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#1A1A22] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              >
                <option value="pending">Pending Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="reviewed">Reviewed &amp; On Hold</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">Administrative Note (Logged)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Reason or call sheet reference..."
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1A1A22] border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleStatusUpdate}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                {isUpdating ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

