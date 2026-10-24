'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CheckCircleIcon, ShieldPolicyIcon } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && isConfigured) {
      router.push('/login?next=/account');
    }
  }, [user, isLoading, isConfigured, router]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Producer';
  const email = user?.email || 'producer@bookmystudio.com';
  const isEmailVerified = Boolean(user?.isVerified);
  const isHost = Boolean(user?.roles?.includes('STUDIO_OWNER'));
  const isPro = Boolean(user?.roles?.includes('PROFESSIONAL'));
  const isVendor = isHost || isPro || Boolean(user?.roles?.includes('ADMIN'));
  const accountId = user?.id ? `BMS-${user.id.slice(0, 8).toUpperCase()}` : 'BMS-8492041';
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'November 2026';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="py-8 bg-zinc-50 dark:bg-[#09090B] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Production Dashboard', href: '/dashboard' },
            { label: 'Account Profile' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                PRODUCER DOSSIER
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Production Entity &amp; Profile
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Manage your commercial production company identity, email verification, and stage insurance records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/partner"
              className="px-3.5 py-2 min-h-[40px] flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-semibold transition-colors"
            >
              Partner Panel
            </Link>
            <Link
              href="/account/settings"
              className="px-3.5 py-2 min-h-[40px] flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors"
            >
              Security Settings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-2 min-h-[40px] rounded-xl border border-rose-200 dark:border-red-900/50 text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xl shrink-0">
              {fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{fullName}</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{email}</p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-[#18181E] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded">
                  ID: {accountId}
                </span>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                    <span>Email Verified</span>
                  </span>
                ) : (
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(email)}`}
                    className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  >
                    Verify Email &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
              <span className="block text-zinc-500 dark:text-zinc-400 font-medium">Account Tier</span>
              <span className="block text-sm font-bold text-zinc-950 dark:text-white mt-1">
                Commercial Production Signatory
              </span>
              <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                Eligible for instant automated COI generation up to $2,000,000.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
              <span className="block text-zinc-500 dark:text-zinc-400 font-medium">Registration Date</span>
              <span className="block text-sm font-bold text-zinc-950 dark:text-white mt-1">
                {createdAt}
              </span>
              <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                Verified member of BookMyStudio global production directory.
              </span>
            </div>
          </div>

          {/* Vendor Capabilities & Listing Roles Card */}
          <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  VENDOR &amp; HOST CAPABILITIES
                </span>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white mt-0.5">
                  {isVendor ? 'Host & Supplier Privileges Active' : 'Client / Producer Account'}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-1 max-w-lg">
                  {isVendor
                    ? 'Your account can list and manage studio spaces, filming locations, cinema equipment, and crew services.'
                    : 'Upgrade to a vendor account to publish soundstages, locations, equipment packages, and crew listings. Your bookings and saved items are permanently preserved.'}
                </p>
              </div>

              <div className="shrink-0">
                {isVendor ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/list-your-studio"
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold text-xs transition-colors"
                    >
                      + Create Listing
                    </Link>
                    <Link
                      href="/dashboard?tab=listings"
                      className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold text-xs border border-zinc-200 dark:border-zinc-700 transition-colors"
                    >
                      My Listings
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/become-vendor"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold text-xs transition-colors shadow-sm"
                  >
                    <span>Become a Vendor</span>
                    <span>&rarr;</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Role Badges */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Assigned Roles:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">
                CUSTOMER
              </span>
              {isHost && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                  STUDIO_OWNER
                </span>
              )}
              {isPro && (
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold">
                  PROFESSIONAL
                </span>
              )}
              {user?.roles?.includes('ADMIN') && (
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-mono text-[10px] font-bold">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Insurance Policy Endorsement Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Production Liability Endorsement Status: ACTIVE</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-400/90 leading-relaxed">
              Your account is pre-approved for comprehensive commercial shoot liability coverage. When booking through the platform, Certificates of Insurance (COI) are dispatched directly to host stages naming them as Primary Additional Insured.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
