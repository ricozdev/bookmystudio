'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

const PROJECT_NAME = 'BOOKMYSTUDIO';
const LETTERS = PROJECT_NAME.split('');

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function CinematicIntro() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Render on initial server-side load for homepage to prevent flash of homepage content
  const [shouldRender, setShouldRender] = useState<boolean>(isHomePage);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Synchronously subscribe to prefers-reduced-motion
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const dismissIntro = useCallback(() => {
    setIsExiting(true);
    try {
      sessionStorage.setItem('bms_intro_seen', 'true');
    } catch {
      // Ignore storage errors in restricted contexts
    }

    const timer = setTimeout(() => {
      setShouldRender(false);
      document.body.style.overflow = 'auto';
    }, isReducedMotion ? 50 : 500);

    return () => clearTimeout(timer);
  }, [isReducedMotion]);

  useEffect(() => {
    // Only run on the homepage route '/'
    if (pathname !== '/') {
      return;
    }

    try {
      // Check if user requested an explicit replay via query parameter (?intro=replay)
      const searchParams = new URLSearchParams(window.location.search);
      const isReplay = searchParams.get('intro') === 'replay';
      const hasSeen = sessionStorage.getItem('bms_intro_seen');

      // If already seen and not requested to replay, unmount asynchronously
      if (hasSeen && !isReplay) {
        const dismissTimer = setTimeout(() => {
          setShouldRender(false);
          document.body.style.overflow = 'auto';
        }, 0);
        return () => clearTimeout(dismissTimer);
      }
    } catch {
      // In restricted contexts, proceed to play
    }

    // Active session: ensure rendered and lock body scroll
    const activateTimer = setTimeout(() => {
      setShouldRender(true);
      setIsExiting(false);
      document.body.style.overflow = 'hidden';
    }, 0);

    // Allow keyboard dismissal via Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Automatically dismiss after the animation sequence
    // 2200ms for reduced motion, 4500ms for full animation (extended hold for reading tagline)
    const autoDismissTimer = setTimeout(dismissIntro, isReducedMotion ? 2200 : 4500);

    return () => {
      clearTimeout(activateTimer);
      clearTimeout(autoDismissTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [pathname, dismissIntro, isReducedMotion]);

  if (!shouldRender || pathname !== '/') {
    return null;
  }

  return (
    <main
      id="intro"
      className={`bms-intro-overlay ${isExiting ? 'bms-intro-exiting' : ''}`}
      aria-label="BookMyStudio Introduction"
      role="dialog"
      aria-modal="true"
    >
      <button
        id="skip"
        className="bms-intro-skip"
        type="button"
        onClick={dismissIntro}
        aria-label="Skip intro"
      >
        Skip ↗
      </button>

      <div className="bms-intro-brand-lockup">
        <div id="brand" className="bms-intro-brand" aria-label={PROJECT_NAME}>
          {LETTERS.map((character, index) => (
            <span
              key={index}
              className="bms-intro-letter"
              style={{
                animationDelay: isReducedMotion ? '0ms' : `${150 + index * 65}ms`,
              }}
            >
              {character}
            </span>
          ))}
        </div>

        <p className="bms-intro-tagline">
          Discover Your Perfect Studio Space!
        </p>
      </div>
    </main>
  );
}
