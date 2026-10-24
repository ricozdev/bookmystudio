'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldPolicyIcon } from '@/components/ui/Icons';
import { PolicyModal } from '@/components/modals/PolicyModal';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function Footer() {
  const pathname = usePathname();
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const isExcludedRoute =
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/create-account' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';

  if (isExcludedRoute) {
    return null;
  }

  return (
    <>
      <footer className="w-full bg-zinc-50 dark:bg-[#09090B] border-t border-zinc-200/80 dark:border-zinc-800/80 pt-12 sm:pt-16 pb-12 text-zinc-600 dark:text-zinc-400 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 5-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-zinc-200/70 dark:border-zinc-800/80">
            
            {/* Brand & Mission (Span 2 on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -m-1" aria-label="BookMyStudio Home">
                <BrandLogo variant="full" height={36} />
              </Link>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                The purpose-built marketplace for commercial filmmakers, photographers, and agencies to scout, spec, and book certified cycloramas, soundstages, filming locations, and crew worldwide.
              </p>

              {/* Direct Liability Policy Included Badge */}
              <button
                type="button"
                onClick={() => setIsPolicyOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition-all cursor-pointer text-left"
              >
                <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>$2,000,000 DIRECT PRODUCTION LIABILITY POLICY INCLUDED</span>
              </button>
            </div>

            {/* Column 2: Marketplace Discovery */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Marketplace
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/studios" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Production Studios &amp; Stages
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Filming Locations &amp; Warehouses
                  </Link>
                </li>
                <li>
                  <Link href="/crew" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Heads of Dept &amp; Key Crew
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Cinema Packages &amp; Grip
                  </Link>
                </li>
                <li>
                  <Link href="/saved" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Saved Production Shortlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Space Hosts & Stages */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                For Space Hosts
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/list-your-studio" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    List a Stage or Loft
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsPolicyOpen(true)}
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-left cursor-pointer"
                  >
                    Host Protection &amp; COI Verification
                  </button>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Host Payout Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Production Standards Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform Standards & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Standards &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Production Support Desk
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    About BookMyStudio
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Commercial Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Production Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Hubs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            <p>
              © 2026 BookMyStudio Inc. Built for film directors, commercial producers, and stage operators.
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-wider">
              <span>NYC Hub</span>
              <span>·</span>
              <span>LA Soundstages</span>
              <span>·</span>
              <span>London Stages</span>
              <span>·</span>
              <ThemeToggle variant="header" />
            </div>
          </div>

        </div>
      </footer>

      {/* Insurance Modal */}
      <PolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
    </>
  );
}
