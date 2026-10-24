'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  CompassIcon,
  StagesGridIcon,
  BookmarkIcon,
  ClapperboardIcon,
  WarehouseIcon,
  CalendarIcon,
} from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';
import { isPartnerPath, usePartnerPreference } from '@/components/navigation/ModeSwitch';

function CurrencyRupeeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l5 6M6 4h12" />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { bookmarkedIds } = useMarketplace();

  const preference = usePartnerPreference();
  const isPartner = isPartnerPath(pathname, searchParams, preference);
  const partnerTab = searchParams?.get('tab') || 'dashboard';

  // Hide on auth, admin, and checkout screens to keep focused
  const isAuthOrAdmin =
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/create-account' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email' ||
    pathname === '/checkout';

  // Hide on listing detail screens to give priority to the sticky booking action bar
  const isDetailScreen =
    /^\/studios\/[^/]+\/?$/.test(pathname) ||
    /^\/locations\/[^/]+\/?$/.test(pathname) ||
    /^\/crew\/[^/]+\/?$/.test(pathname) ||
    /^\/equipment\/[^/]+\/?$/.test(pathname);

  if (isAuthOrAdmin || isDetailScreen) {
    return null;
  }

  const buyerNavItems = [
    {
      label: 'Discover',
      href: '/',
      icon: CompassIcon,
      isActive: pathname === '/',
    },
    {
      label: 'Studios',
      href: '/studios',
      icon: StagesGridIcon,
      isActive: pathname.startsWith('/studios'),
    },
    {
      label: 'Locations',
      href: '/locations',
      icon: WarehouseIcon,
      isActive: pathname.startsWith('/locations'),
    },
    {
      label: 'Crew',
      href: '/crew',
      icon: ClapperboardIcon,
      isActive: pathname.startsWith('/crew') || pathname.startsWith('/equipment'),
    },
    {
      label: 'Saved',
      href: '/saved',
      icon: BookmarkIcon,
      isActive: pathname.startsWith('/saved'),
      badge: bookmarkedIds.length > 0 ? bookmarkedIds.length : null,
    },
  ];

  const partnerNavItems = [
    {
      label: 'Overview',
      href: '/partner?tab=dashboard',
      icon: CompassIcon,
      isActive: pathname.startsWith('/partner') && (!partnerTab || partnerTab === 'dashboard'),
    },
    {
      label: 'Listings',
      href: '/partner?tab=listings',
      icon: WarehouseIcon,
      isActive: pathname.startsWith('/partner') && partnerTab === 'listings',
    },
    {
      label: 'Bookings',
      href: '/partner?tab=bookings',
      icon: ClapperboardIcon,
      isActive: pathname.startsWith('/partner') && partnerTab === 'bookings',
    },
    {
      label: 'Calendar',
      href: '/partner?tab=calendar',
      icon: CalendarIcon,
      isActive: pathname.startsWith('/partner') && partnerTab === 'calendar',
    },
    {
      label: 'Earnings',
      href: '/partner?tab=earnings',
      icon: CurrencyRupeeIcon,
      isActive: pathname.startsWith('/partner') && partnerTab === 'earnings',
    },
  ];

  const navItems = isPartner ? partnerNavItems : buyerNavItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 safe-area-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)] lg:hidden select-none transition-colors duration-150"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1 group transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                active
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
              }`}
            >
              {/* Active top indicator pill */}
              {active && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-200" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center w-6 h-6">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    active ? 'scale-110 stroke-[2.2]' : 'group-hover:scale-105 stroke-[1.8]'
                  }`}
                />
                {'badge' in item && item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 text-[9px] font-bold rounded-full bg-amber-600 dark:bg-amber-500 text-white ring-2 ring-white dark:ring-[#09090B] animate-scale-in">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Destination Label */}
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
