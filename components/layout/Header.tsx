'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  GearCrateIcon,
  BookmarkIcon,
  ChevronDownIcon,
  SearchIcon,
  ArrowLeftIcon,
} from '@/components/ui/Icons';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { AccountMenu } from '@/components/layout/AccountMenu';
import { HeaderLocationButton } from '@/components/location/HeaderLocationButton';
import { ModeSwitch, isPartnerPath, usePartnerPreference } from '@/components/navigation/ModeSwitch';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

/**
 * Primary customer-first marketplace discovery categories (Buyer Mode)
 */
const BUYER_DISCOVERY_ITEMS = [
  { href: '/studios', label: 'Studios' },
  { href: '/locations', label: 'Locations' },
  { href: '/crew', label: 'Crew' },
  { href: '/equipment', label: 'Equipment' },
] as const;

/**
 * Primary operations console navigation categories (Partner Mode)
 */
const PARTNER_NAV_ITEMS = [
  { href: '/partner?tab=dashboard', label: 'Dashboard', tabKey: 'dashboard' },
  { href: '/partner?tab=listings', label: 'My Listings', tabKey: 'listings' },
  { href: '/partner?tab=bookings', label: 'Bookings', tabKey: 'bookings' },
  { href: '/partner?tab=calendar', label: 'Calendar', tabKey: 'calendar' },
  { href: '/partner?tab=earnings', label: 'Earnings', tabKey: 'earnings' },
] as const;

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedCrew, bookmarkedIds } = useMarketplace();
  const { user, signOut } = useAuth();

  const preference = usePartnerPreference();

  const isPartner = isPartnerPath(pathname, searchParams, preference);
  const partnerTab = searchParams.get('tab') || 'dashboard';

  const isStudioDetail = /^\/studios\/[^/]+$/.test(pathname);
  const isLocationDetail = /^\/locations\/[^/]+$/.test(pathname);
  const isCrewDetail = /^\/crew\/[^/]+$/.test(pathname);
  const isEquipmentDetail = /^\/equipment\/[^/]+$/.test(pathname);
  const isDetailRoute = isStudioDetail || isLocationDetail || isCrewDetail || isEquipmentDetail;

  const getDetailTitle = () => {
    if (isStudioDetail) return 'Studio Stage';
    if (isLocationDetail) return 'Filming Location';
    if (isCrewDetail) return 'Crew Profile';
    if (isEquipmentDetail) return 'Cinema Package';
    return 'Details';
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    height: number;
    top: number;
    opacity: number;
  }>({ left: 0, width: 0, height: 0, top: 0, opacity: 0 });

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 50);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Calculate active index based on mode
  const activeNavIndex = isPartner
    ? pathname.startsWith('/partner')
      ? PARTNER_NAV_ITEMS.findIndex((item) => item.tabKey === partnerTab)
      : -1
    : BUYER_DISCOVERY_ITEMS.findIndex((item) => pathname.startsWith(item.href));

  const targetIndex = hoveredNavIndex !== null ? hoveredNavIndex : activeNavIndex;

  // Active pill sliding indicator calculation
  useEffect(() => {
    const updateIndicator = () => {
      if (targetIndex === -1 || !navItemRefs.current[targetIndex] || !navContainerRef.current) {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }
      const targetEl = navItemRefs.current[targetIndex];
      if (!targetEl) return;
      setIndicatorStyle({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        height: targetEl.offsetHeight,
        top: targetEl.offsetTop,
        opacity: 1,
      });
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [targetIndex, pathname, partnerTab, isPartner]);

  // Close "More" dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMoreMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Dedicated distraction-free shell for authentication routes and administrative portal
  const isAuthOrAdmin =
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/create-account' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';

  if (isAuthOrAdmin) {
    return null;
  }

  const navItems = isPartner ? PARTNER_NAV_ITEMS : BUYER_DISCOVERY_ITEMS;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200/90 dark:border-[#27272A]/80 transition-colors duration-200 overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18 gap-2 sm:gap-4">
            
            {/* ========================================================
               LEFT: Brand Logo & Wordmark (or Mobile Contextual Back)
               ======================================================== */}
            <div className="flex items-center gap-4 shrink-0">
              {isDetailRoute ? (
                <>
                  {/* Mobile Back Button + Route Context Title */}
                  <div className="flex lg:hidden items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="p-2 -ml-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#16161C] min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform active:scale-95"
                      aria-label="Go back"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold tracking-tight text-zinc-100 truncate max-w-[170px] sm:max-w-[220px]">
                      {getDetailTitle()}
                    </span>
                  </div>

                  {/* Desktop Brand Logo */}
                  <Link
                    href={isPartner ? '/partner' : '/'}
                    className="hidden lg:flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 group"
                    aria-label="BookMyStudio Home"
                  >
                    <BrandLogo
                      variant="navbar"
                      height={22}
                      showTagline
                      priority
                      badge={
                        isPartner ? (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                            Partner
                          </span>
                        ) : undefined
                      }
                    />
                  </Link>
                </>
              ) : (
                <Link
                  href={isPartner ? '/partner' : '/'}
                  className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 group shrink-0"
                  aria-label="BookMyStudio Home"
                >
                  {/* Screens min-[440px]: Full brand logo with tagline */}
                  <div className="hidden min-[440px]:flex items-center">
                    <BrandLogo
                      variant="navbar"
                      height={22}
                      showTagline
                      priority
                      badge={
                        isPartner ? (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                            Partner
                          </span>
                        ) : undefined
                      }
                    />
                  </div>

                  {/* Compact Mobile Screens (<440px): Responsive brand logo with tagline */}
                  <div className="min-[440px]:hidden flex items-center">
                    <BrandLogo
                      variant="navbar"
                      height={19}
                      showTagline
                      priority
                      taglineClassName="text-[8.5px]"
                      badge={
                        isPartner ? (
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 rounded">
                            Partner
                          </span>
                        ) : undefined
                      }
                    />
                  </div>
                </Link>
              )}
            </div>

            {/* ========================================================
               CENTER: Dynamic Navigation Menu (Buyer ↔ Partner)
               ======================================================== */}
            <nav
              className="hidden lg:flex items-center gap-2"
              aria-label={isPartner ? 'Partner Business Navigation' : 'Marketplace Discovery Navigation'}
            >
              <div
                ref={navContainerRef}
                onMouseLeave={() => setHoveredNavIndex(null)}
                className="relative flex items-center p-1 rounded-full bg-zinc-100/90 dark:bg-[#121216]/90 border border-zinc-200 dark:border-[#27272A]/80 shadow-xs"
              >
                {/* Hardware-accelerated sliding background indicator */}
                <div
                  className="absolute rounded-full bg-white dark:bg-[#202028] border border-zinc-200/80 dark:border-[#32323D] shadow-xs pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    left: 0,
                    transform: `translateX(${indicatorStyle.left}px)`,
                    width: `${indicatorStyle.width}px`,
                    height: `${indicatorStyle.height}px`,
                    top: `${indicatorStyle.top}px`,
                    opacity: indicatorStyle.opacity,
                  }}
                />

                {navItems.map((item, idx) => {
                  const isCurrent = activeNavIndex === idx;
                  const isHovered = hoveredNavIndex === idx;
                  return (
                    <Link
                      key={item.href}
                      ref={(el) => {
                        navItemRefs.current[idx] = el;
                      }}
                      href={item.href}
                      onMouseEnter={() => setHoveredNavIndex(idx)}
                      className={`relative z-10 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
                        isCurrent || isHovered
                          ? 'text-zinc-950 dark:text-white font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Discreet "More" dropdown for Mode-Specific Tools */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                    moreMenuOpen || pathname === '/about' || pathname === '/contact'
                      ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-[#1E1E26] border border-zinc-200 dark:border-[#2E2E38]'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#16161C]'
                  }`}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  aria-label="More navigation links"
                >
                  <span>More</span>
                  <ChevronDownIcon
                    className={`w-3 h-3 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                      moreMenuOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''
                    }`}
                  />
                </button>

                {/* More Dropdown Menu */}
                {moreMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#141418] rounded-2xl shadow-xl dark:shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-dropdown-in">
                    {isPartner ? (
                      /* Partner Mode "More" Links */
                      <>
                        <Link
                          href="/list-your-studio"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-base font-bold leading-none">+</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Add New Listing
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Publish a studio, location, crew, or gear
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/partner?tab=reviews"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white">
                              Reviews &amp; Quality
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Ratings, client feedback &amp; trust
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/partner?tab=analytics"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white">
                              Business Analytics
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Views, conversion rate &amp; performance
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/account"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white">
                              Business Profile &amp; KYC
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Company legal name, phone &amp; verified badges
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/partner?tab=settings"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white">
                              Partner Settings
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Bank account, payouts &amp; preferences
                            </p>
                          </div>
                        </Link>
                      </>
                    ) : (
                      /* Buyer Mode "More" Links */
                      <>
                        <Link
                          href="/about"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white">About BookMyStudio</div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Mission, standards &amp; soundstage network
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/contact"
                          onClick={() => setMoreMenuOpen(false)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white">Production Support Desk</div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              Shoot coordination &amp; inquiry assistance
                            </p>
                          </div>
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <Link
                        href="/terms"
                        onClick={() => setMoreMenuOpen(false)}
                        className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                      >
                        Terms of Service
                      </Link>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <Link
                        href="/privacy"
                        onClick={() => setMoreMenuOpen(false)}
                        className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* ========================================================
               RIGHT: Contextual Actions, Mode Switch & Account
               ======================================================== */}
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
              
              {/* Partner Mode: Fast "+ Add Listing" CTA */}
              {isPartner ? (
                <Link
                  href="/list-your-studio"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-xs active:scale-95"
                >
                  <span className="text-sm font-extrabold leading-none">+</span>
                  <span>Add Listing</span>
                </Link>
              ) : (
                /* Buyer Mode: Location Selector & Utility Toolbar */
                <>
                  <div className="hidden md:flex items-center">
                    <HeaderLocationButton />
                  </div>

                  <div className="hidden sm:flex items-center gap-0.5">
                    {/* Saved Items Bookmark Link */}
                    <Link
                      href="/saved"
                      className={`relative p-2 rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        isActive('/saved')
                          ? 'text-white bg-[#1E1E26]'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#16161C]'
                      }`}
                      aria-label={`Saved listings with ${bookmarkedIds.length} items`}
                      title="Saved Listings"
                    >
                      <BookmarkIcon className="w-4 h-4" filled={bookmarkedIds.length > 0} />
                      {bookmarkedIds.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-amber-500 text-zinc-950 font-mono ring-2 ring-[#09090B] animate-scale-in">
                          {bookmarkedIds.length}
                        </span>
                      )}
                    </Link>

                    {/* Crew Roster & Gear Crate Link */}
                    <Link
                      href="/crew-list"
                      className={`relative p-2 rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        isActive('/crew-list')
                          ? 'text-white bg-[#1E1E26]'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#16161C]'
                      }`}
                      aria-label={`Gear crate with ${selectedCrew.length} crew members`}
                      title="Crew Roster & Gear Crate"
                    >
                      <GearCrateIcon className="w-4 h-4" />
                      {selectedCrew.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-amber-500 text-zinc-950 font-mono ring-2 ring-[#09090B] animate-scale-in">
                          {selectedCrew.length}
                        </span>
                      )}
                    </Link>
                  </div>
                </>
              )}

              {/* Compact Buyer ↔ Partner Mode Switch (Desktop/Tablet) */}
              <div className="hidden sm:flex items-center">
                <ModeSwitch />
              </div>

              {/* Theme Toggle (Desktop/Tablet) */}
              <div className="hidden sm:flex items-center">
                <ThemeToggle variant="header" />
              </div>

              {/* Auth-Aware Controls (Desktop/Tablet) */}
              {user ? (
                <div className="hidden sm:block">
                  <AccountMenu />
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Link
                    href={isPartner ? '/login?next=/partner' : '/login'}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-[#16161C] transition-colors whitespace-nowrap"
                  >
                    Log In
                  </Link>

                  <Link
                    href={isPartner ? '/create-account?role=partner' : '/create-account'}
                    className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-full transition-colors shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    {isPartner ? 'Partner Register' : 'Get Started'}
                  </Link>
                </div>
              )}

              {/* Theme Toggle (Mobile) */}
              <div className="flex sm:hidden items-center">
                <ThemeToggle variant="header" />
              </div>

              {/* Mobile Search Shortcut Button (< md, only in Buyer mode) */}
              {!isPartner && (
                <Link
                  href="/search"
                  className="md:hidden p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#16161C] transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Search Marketplace"
                  title="Search Marketplace"
                >
                  <SearchIcon className="w-4 h-4" />
                </Link>
              )}

              {/* Mobile / Tablet Menu Button Toggle (< lg) */}
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#16161C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================
         MOBILE & TABLET NAVIGATION SLIDE-OVER DRAWER
         ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-overlay-in transition-opacity"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Slide-in Drawer Container */}
          <div
            ref={drawerRef}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#121216] border-l border-zinc-200 dark:border-[#27272A] p-5 sm:p-6 shadow-2xl overflow-y-auto animate-drawer-in flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <Link
                  href={isPartner ? '/partner' : '/'}
                  onClick={closeMobileMenu}
                  className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -m-1"
                  aria-label={`BookMyStudio home — ${isPartner ? 'Partner' : 'Buyer'} mode`}
                >
                  <BrandLogo
                    variant="navbar"
                    height={22}
                    showTagline
                    priority
                    badge={
                      isPartner ? (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                          Partner
                        </span>
                      ) : undefined
                    }
                  />
                </Link>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Close Navigation"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Experience Mode Switch (Buyer ↔ Partner) */}
              <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                  EXPERIENCE MODE
                </span>
                <ModeSwitch
                  onSwitchComplete={closeMobileMenu}
                  className="w-full justify-between"
                />
              </div>

              {/* Mobile Theme Preference */}
              <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                  APPEARANCE
                </span>
                <ThemeToggle variant="menu" />
              </div>

              {/* Buyer Mode: Location Selector */}
              {!isPartner && (
                <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                    CURRENT LOCATION &amp; RADIUS
                  </span>
                  <div onClick={closeMobileMenu}>
                    <HeaderLocationButton
                      variant="detailed"
                      className="w-full bg-zinc-100 dark:bg-[#18181E] border-zinc-200 dark:border-zinc-700/80"
                    />
                  </div>
                </div>
              )}

              {/* Persona Navigation Group */}
              {isPartner ? (
                /* PARTNER MODE DRAWER CONTENT */
                <>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1 mb-2">
                      PARTNER BUSINESS CONSOLE
                    </span>
                    <div className="space-y-1">
                      {PARTNER_NAV_ITEMS.map((item) => {
                        const isCurrent = partnerTab === item.tabKey && pathname.startsWith('/partner');
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={`block px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] flex items-center transition-colors ${
                              isCurrent
                                ? 'bg-amber-500 text-zinc-950 font-bold'
                                : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                            }`}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                      <Link
                        href="/list-your-studio"
                        onClick={closeMobileMenu}
                        className="block px-3 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl min-h-[44px] flex items-center transition-colors hover:bg-amber-500/20"
                      >
                        + Add New Listing
                      </Link>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                      BUSINESS TOOLS &amp; METRICS
                    </span>
                    <div className="space-y-1">
                      <Link
                        href="/partner?tab=reviews"
                        onClick={closeMobileMenu}
                        className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white rounded-xl min-h-[44px] flex items-center transition-colors"
                      >
                        Listing Reviews &amp; Quality
                      </Link>
                      <Link
                        href="/partner?tab=analytics"
                        onClick={closeMobileMenu}
                        className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white rounded-xl min-h-[44px] flex items-center transition-colors"
                      >
                        Business Analytics
                      </Link>
                      <Link
                        href="/account"
                        onClick={closeMobileMenu}
                        className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white rounded-xl min-h-[44px] flex items-center transition-colors"
                      >
                        Business Profile &amp; KYC
                      </Link>
                      <Link
                        href="/partner?tab=settings"
                        onClick={closeMobileMenu}
                        className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white rounded-xl min-h-[44px] flex items-center transition-colors"
                      >
                        Partner Settings &amp; Bank
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                /* BUYER MODE DRAWER CONTENT */
                <>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                      DISCOVER MARKETPLACE
                    </span>
                    <div className="space-y-1">
                      {BUYER_DISCOVERY_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={`block px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] flex items-center transition-colors ${
                            isActive(item.href)
                              ? 'bg-amber-500 text-zinc-950 font-bold'
                              : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                      YOUR WORKSPACE
                    </span>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className={`block px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] flex items-center transition-colors ${
                          isActive('/dashboard')
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                      >
                        My Bookings &amp; Holds
                      </Link>
                      <Link
                        href="/saved"
                        onClick={closeMobileMenu}
                        className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] transition-colors ${
                          isActive('/saved')
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                      >
                        <span>Saved Listings</span>
                        {bookmarkedIds.length > 0 && (
                          <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold font-mono">
                            {bookmarkedIds.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/crew-list"
                        onClick={closeMobileMenu}
                        className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] transition-colors ${
                          isActive('/crew-list')
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                      >
                        <span>Crew Roster &amp; Gear Crate</span>
                        {selectedCrew.length > 0 && (
                          <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold font-mono">
                            {selectedCrew.length}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* Common: Company & Support */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                  COMPANY &amp; SUPPORT
                </span>
                <div className="space-y-1">
                  <Link
                    href="/about"
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] flex items-center transition-colors ${
                      isActive('/about')
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    About BookMyStudio
                  </Link>

                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] flex items-center transition-colors ${
                      isActive('/contact')
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    Production Support Desk
                  </Link>

                  <Link
                    href="/terms"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white rounded-xl min-h-[44px] flex items-center transition-colors"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>

            {/* Account Profile and Actions */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 safe-area-bottom">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                ACCOUNT
              </span>
              {user ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                        {(user.user_metadata?.full_name || user.email || 'P').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {user.user_metadata?.full_name || 'Production Partner'}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={isPartner ? '/account' : '/dashboard'}
                    onClick={closeMobileMenu}
                    className="block w-full text-center py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl min-h-[44px] flex items-center justify-center transition-colors"
                  >
                    {isPartner ? 'Business Profile & KYC' : 'Profile & Dashboard'}
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      closeMobileMenu();
                      await signOut();
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer min-h-[44px] flex items-center justify-center transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href={isPartner ? '/login?next=/partner' : '/login'}
                    onClick={closeMobileMenu}
                    className="block w-full text-center py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl min-h-[44px] flex items-center justify-center transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={isPartner ? '/create-account?role=partner' : '/create-account'}
                    onClick={closeMobileMenu}
                    className="block w-full text-center py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs min-h-[44px] flex items-center justify-center transition-colors"
                  >
                    {isPartner ? 'Create Partner Account' : 'Create Account'}
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
