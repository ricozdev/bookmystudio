'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldPolicyIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

interface AdminNavItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  superAdminOnly?: boolean;
}

function GridIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ClipboardCheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function UsersIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function BuildingIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function CalendarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function KeyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function ScrollIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CogIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: GridIcon },
  { href: '/admin/listings', label: 'Curation Desk', icon: ClipboardCheckIcon },
  { href: '/admin/users', label: 'User Registry', icon: UsersIcon },
  { href: '/admin/partners', label: 'Partner Network', icon: BuildingIcon },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarIcon },
  { href: '/admin/access-management', label: 'Access Management', icon: KeyIcon, superAdminOnly: true },
  { href: '/admin/audit-logs', label: 'Audit Ledger', icon: ScrollIcon },
  { href: '/admin/settings', label: 'System Settings', icon: CogIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isSuperAdmin, isAdmin, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Allow admin login page to render without full admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">Verifying administrative credentials...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthorized Barrier (Strict server & client role check)
  if (!user || (!isSuperAdmin && !isAdmin)) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <ShieldPolicyIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Administrator Access Required</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This console is restricted to authorized BookMyStudio platform administrators and curators.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign In with Admin Credentials</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            >
              Return to Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter navigation items by role
  const visibleNavItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) {
      return isSuperAdmin;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row antialiased transition-colors duration-150">
      {/* ========================================================
         1. SIDEBAR (Desktop Fixed, Mobile Slide-In)
         ======================================================== */}
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#101014] border-r border-zinc-200 dark:border-zinc-800/80 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
            <Link href="/admin/dashboard" className="flex flex-col items-start gap-1 group">
              <BrandLogo variant="navbar" height={22} showTagline priority />
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400">
                  {isSuperAdmin ? 'SUPER ADMIN CONSOLE' : 'ADMIN CONSOLE'}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close Sidebar"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Admin Navigation">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 py-1">
              Platform Controls
            </span>
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-500 dark:text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.superAdminOnly && (
                    <span
                      className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isActive
                          ? 'bg-zinc-950/20 text-zinc-950'
                          : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      Super
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0C0C0F] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user.fullName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.fullName}</div>
              <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">{user.email}</div>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-850">
            <ThemeToggle variant="menu" />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-850">
            <Link
              href="/"
              className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>← Marketplace</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
         2. MAIN CONTENT AREA WITH TOP BAR
         ======================================================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-150">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg lg:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                Console /
              </span>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                {pathname.replace('/admin/', '').replace(/-/g, ' ') || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="header" />

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SERVER</span>
            </div>

            <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              {isSuperAdmin ? 'SUPER ADMIN' : 'CURATOR ADMIN'}
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

