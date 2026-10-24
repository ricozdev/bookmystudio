'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ArrowLeftIcon,
  ShieldPolicyIcon,
  CheckCircleIcon,
  CamlockPowerIcon,
  SoundstageIcon,
} from '@/components/ui/Icons';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerPrompt?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerPrompt,
}: AuthLayoutProps) {
  const { isConfigured } = useAuth();
  const [showDevDiagnostic, setShowDevDiagnostic] = useState(false);

  return (
    <div className="auth-page-container min-h-screen w-full bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-150">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* ========================================================
           LEFT COLUMN: Dedicated, Distraction-Free Authentication Form
           ======================================================== */}
        <div className="auth-form-panel lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 max-w-2xl mx-auto w-full lg:max-w-none bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
          
          {/* Top Navigation Shell (Brand, ThemeToggle & Return to Marketplace) */}
          <header className="flex items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -m-1"
              aria-label="BookMyStudio Home"
            >
              <BrandLogo variant="navbar" height={26} priority />
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle variant="header" />
              <Link
                href="/studios"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Return to Marketplace</span>
                <span className="sm:hidden">Explore</span>
              </Link>
            </div>
          </header>

          {/* Form Container (Centered with comfortable breathing room) */}
          <main className="my-auto py-8 sm:py-12 max-w-[440px] w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Form Title & Context Subtitle */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {subtitle}
                </p>
              </div>

              {/* Injected Form Component */}
              <div className="pt-2">
                {children}
              </div>

              {/* Bottom Secondary Prompt (Sign in / Create account link) */}
              {footerPrompt && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-center text-xs text-zinc-600 dark:text-zinc-400">
                  <span>{footerPrompt.text} </span>
                  <Link
                    href={footerPrompt.linkHref}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-4 transition-colors"
                  >
                    {footerPrompt.linkText}
                  </Link>
                </div>
              )}
            </motion.div>
          </main>

          {/* Bottom Minimal Legal Footer */}
          <footer className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <span>&copy; 2026 BookMyStudio Inc.</span>
              <span>·</span>
              <span>Creative Production Network</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Production Support
              </Link>

              {/* Discreet Developer Diagnostic Toggle (Dev only) */}
              {process.env.NODE_ENV === 'development' && !isConfigured && (
                <button
                  type="button"
                  onClick={() => setShowDevDiagnostic(!showDevDiagnostic)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 hover:bg-amber-100 dark:bg-zinc-800 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 transition-colors cursor-pointer"
                  title="Developer Environment Diagnostic"
                >
                  ⚙ Dev Diagnostics
                </button>
              )}
            </div>
          </footer>

          {/* Discreet Developer Diagnostic Panel (Only displayed when developer explicitly toggles it) */}
          {process.env.NODE_ENV === 'development' && !isConfigured && showDevDiagnostic && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="font-mono text-[11px]">Developer Diagnostic: Supabase Auth Keys</span>
                <button
                  type="button"
                  onClick={() => setShowDevDiagnostic(false)}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-900"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90 font-mono">
                `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set in `.env.local`. Client forms operate with full UX validation. Set these keys to activate live Supabase authentication.
              </p>
            </div>
          )}

        </div>

        {/* ========================================================
           RIGHT COLUMN: High-Craft Editorial Production Atmosphere
           (Desktop Only - Visual Context & Real Market Realities)
           ======================================================== */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white flex-col justify-between p-12 lg:p-14 overflow-hidden border-l border-zinc-200 dark:border-zinc-800 transition-colors">
          
          {/* Background Production Stage Visual */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/studios/apex-stage-c.svg"
              alt="Apex Commercial Soundstage with overhead lighting grid"
              fill
              priority
              className="object-cover object-center brightness-90 dark:brightness-75 scale-100 transition-transform duration-1000"
            />
            {/* Cinematic Vignette Overlay Adaptive for Light & Dark */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-100 via-zinc-100/75 to-zinc-100/35 dark:from-zinc-950 dark:via-zinc-950/50 dark:to-zinc-950/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-100/80 via-transparent to-zinc-100/40 dark:from-zinc-950/60 dark:via-transparent dark:to-zinc-950/40" />
          </div>

          {/* Top Editorial Eyebrow Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/90 dark:border-white/10 text-xs font-mono text-zinc-700 dark:text-zinc-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>COMMERCIAL PRODUCTION NETWORK</span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 dark:text-zinc-400 uppercase font-semibold">
              NEW YORK · LOS ANGELES
            </span>
          </div>

          {/* Center Value Proposition & Set Realities */}
          <div className="relative z-10 max-w-md space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold block">
                VERIFIED SET ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-zinc-950 dark:text-white">
                Everything Your Production Needs. In One Connected Place.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                Coordinate certified soundproof stages, infinity cycloramas, IATSE department heads, and cinema packages with transparent 10-hour day rates.
              </p>
            </div>

            {/* Verified Specification Pillars */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-white/10 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <SoundstageIcon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] uppercase font-bold text-zinc-600 dark:text-zinc-300">
                    Acoustics
                  </span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white block text-xs">
                  STC 60+ Certified
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">
                  Sync Sound Dialogue
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-white/10 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <CamlockPowerIcon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] uppercase font-bold text-zinc-600 dark:text-zinc-300">
                    Distribution
                  </span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white block text-xs">
                  600A 3-Phase Camlock
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">
                  Heavy Cinema Lighting
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Compliance Footnote */}
          <div className="relative z-10 pt-6 border-t border-zinc-200/90 dark:border-white/15 space-y-3">
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
              <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-zinc-900 dark:text-white">
                $2,000,000 Direct Liability Insurance Included
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Standard 10-Hour Shift</span>
              </span>
              <span>Published Wrap Rates</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
