'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDownIcon, CheckCircleIcon } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { isPartnerPath, usePartnerPreference } from '@/components/navigation/ModeSwitch';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, signOut, isAdmin, isSuperAdmin } = useAuth();
  const { bookmarkedIds, selectedCrew } = useMarketplace();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const preference = usePartnerPreference();
  const isPartner = isPartnerPath(pathname, searchParams, preference);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = user?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Producer';
  const email = user?.email || '';
  const isEmailVerified = Boolean(user?.isVerified);
  const isVendor = Boolean(
    user?.roles?.some(
      (role) => role === 'STUDIO_OWNER' || role === 'PROFESSIONAL' || role === 'ADMIN'
    )
  );
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P';

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 p-1 sm:pr-2.5 rounded-full border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100 dark:bg-[#141418] hover:bg-zinc-200 dark:hover:bg-[#1A1A22] transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer shadow-xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Account Menu"
      >
        <div className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-1 ring-amber-400/30">
          {initials}
        </div>
        <span className="hidden xl:inline text-xs font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white max-w-[80px] truncate">
          {fullName.split(' ')[0]}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Account Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#121216] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-dropdown-in">
          {/* User Info Header */}
          <div className="px-2.5 py-2 border-b border-zinc-200 dark:border-zinc-800 mb-2">
            <p className="text-xs font-bold text-zinc-900 dark:text-[#FAFAFA] truncate">{fullName}</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{email}</p>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {isEmailVerified ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">Verified Account</span>
                </>
              ) : (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800">
                  Email Verification Pending
                </span>
              )}
              {isVendor && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                  Partner / Vendor
                </span>
              )}
            </div>
          </div>

          {/* Persona-Specific Navigation Links */}
          <div className="space-y-1 text-xs">
            {/* Direct Admin Access for Staff */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/20 font-bold transition-all mb-1"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span>{isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}</span>
                </div>
                <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/40">
                  STAFF
                </span>
              </Link>
            )}

            {isPartner ? (
              /* PARTNER MODE ACCOUNT MENU LINKS */
              <>
                <Link
                  href="/partner?tab=dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-zinc-800 font-semibold transition-colors"
                >
                  <span>Partner Console</span>
                  <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Console
                  </span>
                </Link>

                <Link
                  href="/partner?tab=listings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>My Listings &amp; Inventory</span>
                </Link>

                <Link
                  href="/partner?tab=bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Bookings &amp; Inbound Holds</span>
                </Link>

                <Link
                  href="/partner?tab=calendar"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Calendar &amp; Availability</span>
                </Link>

                <Link
                  href="/partner?tab=earnings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Earnings &amp; Payouts</span>
                </Link>

                <Link
                  href="/list-your-studio"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold transition-all"
                >
                  <span>+ Create New Listing</span>
                </Link>

                <Link
                  href="/partner?tab=settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Payout &amp; Bank Settings</span>
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Business Entity Profile</span>
                </Link>
              </>
            ) : (
              /* BUYER MODE ACCOUNT MENU LINKS */
              <>
                {!isVendor && (
                  <Link
                    href="/become-vendor"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 font-bold transition-all mb-1"
                  >
                    <span>✨ Become a Partner</span>
                    <span className="text-[9px] bg-amber-500/30 px-1.5 py-0.5 rounded font-mono text-amber-200">
                      HOST
                    </span>
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>My Bookings &amp; Holds</span>
                </Link>

                <Link
                  href="/saved"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Saved Listings</span>
                  {bookmarkedIds.length > 0 && (
                    <span className="text-[10px] bg-zinc-800 font-bold px-1.5 py-0.5 rounded-full text-zinc-200">
                      {bookmarkedIds.length}
                    </span>
                  )}
                </Link>

                <Link
                  href="/crew-list"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Call Sheet Roster</span>
                  {selectedCrew.length > 0 && (
                    <span className="text-[10px] bg-zinc-800 font-bold px-1.5 py-0.5 rounded-full text-zinc-200">
                      {selectedCrew.length}
                    </span>
                  )}
                </Link>

                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Account Profile</span>
                </Link>

                <Link
                  href="/account/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
                >
                  <span>Account Settings</span>
                </Link>
              </>
            )}

            {user?.roles?.includes('ADMIN') && (
              <Link
                href="/admin/listings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-950/40 font-bold border border-purple-800/40 transition-colors"
              >
                <span>Admin Review Portal</span>
                <span className="text-[10px] bg-purple-900/60 font-mono px-1.5 py-0.5 rounded text-purple-300">ADMIN</span>
              </Link>
            )}
          </div>

          {/* Appearance Toggle */}
          <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-1.5">
              Theme
            </span>
            <ThemeToggle variant="menu" />
          </div>

          {/* Sign Out Action */}
          <div className="pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
