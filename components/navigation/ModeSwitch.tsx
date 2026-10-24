'use client';

import React, { Suspense, useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export interface ModeSwitchProps {
  className?: string;
  onSwitchComplete?: () => void;
}

function getPreferenceSnapshot(): 'buyer' | 'partner' {
  if (typeof window === 'undefined') return 'buyer';
  try {
    const val = sessionStorage.getItem('bms_user_mode');
    if (val === 'partner' || val === 'buyer') return val;
  } catch {}
  return 'buyer';
}

function getPreferenceServerSnapshot(): 'buyer' | 'partner' {
  return 'buyer';
}

function subscribePreference(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bms_mode_changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bms_mode_changed', callback);
  };
}

export function setSavedPreference(mode: 'buyer' | 'partner') {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('bms_user_mode', mode);
      window.dispatchEvent(new Event('bms_mode_changed'));
    } catch {}
  }
}

export function usePartnerPreference(): 'buyer' | 'partner' {
  return useSyncExternalStore(
    subscribePreference,
    getPreferenceSnapshot,
    getPreferenceServerSnapshot
  );
}

/**
 * Determines whether a pathname represents a Partner section.
 * - /partner (and any sub-routes)
 * - /list-your-studio (hosting / listing creator flow)
 * - /become-vendor (partner onboarding / upgrade flow)
 * - /admin (platform review & curation portal)
 * - /dashboard when tab is 'listings', 'host', 'earnings', or 'calendar'
 * - Neutral routes respect the user's saved preference
 */
export function isPartnerPath(
  pathname: string | null,
  searchParams?: URLSearchParams | null,
  fallbackPreference?: 'buyer' | 'partner'
): boolean {
  if (!pathname) return false;

  if (
    pathname.startsWith('/partner') ||
    pathname.startsWith('/list-your-studio') ||
    pathname.startsWith('/become-vendor') ||
    pathname.startsWith('/admin')
  ) {
    return true;
  }

  if (pathname === '/dashboard') {
    const tab = searchParams?.get('tab');
    if (tab === 'listings' || tab === 'host' || tab === 'earnings' || tab === 'calendar') {
      return true;
    }
    return false;
  }

  // Definite Buyer routes
  if (
    pathname === '/' ||
    pathname.startsWith('/studios') ||
    pathname.startsWith('/locations') ||
    pathname.startsWith('/crew') ||
    pathname.startsWith('/equipment') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/crew-list') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/search')
  ) {
    return false;
  }

  // Neutral routes (like /account, /about, /contact, /terms, /privacy)
  if (fallbackPreference) {
    return fallbackPreference === 'partner';
  }

  return false;
}

function ModeSwitchInner({ className = '', onSwitchComplete }: ModeSwitchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preference = usePartnerPreference();

  // Active mode directly synchronized with current route and preference
  const isPartner = isPartnerPath(pathname, searchParams, preference);

  // Store the last visited buyer route in current session
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname && !isPartnerPath(pathname, searchParams)) {
      const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      try {
        sessionStorage.setItem('bms_last_buyer_path', fullPath);
      } catch {}
    }
  }, [pathname, searchParams]);

  const handleSwitch = (targetMode: 'buyer' | 'partner') => {
    if (targetMode === 'partner') {
      setSavedPreference('partner');

      if (!user) {
        // If not logged in, redirect to login then return to partner
        router.push('/login?next=/partner');
        onSwitchComplete?.();
        return;
      }

      if (!isPartner) {
        router.push('/partner');
        onSwitchComplete?.();
      }
    } else {
      setSavedPreference('buyer');

      if (isPartner) {
        let destination = '/';
        try {
          const stored = sessionStorage.getItem('bms_last_buyer_path');
          if (stored && !isPartnerPath(stored)) {
            destination = stored;
          }
        } catch {
          destination = '/';
        }
        router.push(destination);
        onSwitchComplete?.();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSwitch('buyer');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleSwitch('partner');
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleSwitch(isPartner ? 'buyer' : 'partner');
    }
  };

  return (
    <div
      role="group"
      aria-label="Experience Mode Switch"
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-full border transition-all duration-200 select-none shadow-xs
        bg-zinc-100 dark:bg-[#121216] border-zinc-300 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-700/80
        text-xs font-semibold ${className}`}
    >
      {/* Buyer Mode Button */}
      <button
        type="button"
        onClick={() => handleSwitch('buyer')}
        className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          !isPartner
            ? 'text-zinc-900 dark:text-white font-bold bg-white dark:bg-[#202028] border border-zinc-200 dark:border-[#32323D] shadow-xs'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
        }`}
        aria-pressed={!isPartner}
        title="Switch to Buyer Mode (browse and book studios, locations, crew, and equipment)"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            !isPartner ? 'bg-amber-500' : 'bg-transparent'
          }`}
          aria-hidden="true"
        />
        <span>Buyer</span>
      </button>

      {/* Two-State Physical Slider Track (Buyer ◉━━━━○ Partner) */}
      <button
        type="button"
        role="switch"
        aria-checked={isPartner}
        aria-label={`Navigation Mode: currently in ${isPartner ? 'Partner' : 'Buyer'} mode. Click or press Space to switch to ${isPartner ? 'Buyer' : 'Partner'} mode.`}
        onClick={() => handleSwitch(isPartner ? 'buyer' : 'partner')}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#09090B] ${
          isPartner ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
        title={`Toggle to ${isPartner ? 'Buyer' : 'Partner'} mode`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            isPartner ? 'translate-x-4 bg-zinc-950!' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Partner Mode Button */}
      <button
        type="button"
        onClick={() => handleSwitch('partner')}
        className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isPartner
            ? 'text-amber-800 dark:text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 shadow-xs'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
        }`}
        aria-pressed={isPartner}
        title="Switch to Partner Mode (manage stages, inventory, rate cards, and inbound holds)"
      >
        <span>Partner</span>
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            isPartner ? 'bg-amber-500 animate-pulse' : 'bg-transparent'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/**
 * Fallback skeleton during SSR / initial static generation hydration
 */
function ModeSwitchSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-full border border-zinc-300 dark:border-zinc-800/90 bg-zinc-100 dark:bg-[#121216] text-xs font-semibold ${className}`}
      aria-hidden="true"
    >
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-zinc-900 dark:text-white font-bold bg-white dark:bg-[#202028] border border-zinc-200 dark:border-[#32323D]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Buyer</span>
      </span>
      <span className="inline-flex h-5 w-9 shrink-0 rounded-full p-0.5 bg-zinc-300 dark:bg-zinc-700">
        <span className="inline-block h-4 w-4 rounded-full bg-white" />
      </span>
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-zinc-500 dark:text-zinc-400 font-medium">
        <span>Partner</span>
      </span>
    </div>
  );
}

export function ModeSwitch(props: ModeSwitchProps) {
  return (
    <Suspense fallback={<ModeSwitchSkeleton className={props.className} />}>
      <ModeSwitchInner {...props} />
    </Suspense>
  );
}

