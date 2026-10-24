'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from '@/components/ui/Icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, isSuperAdmin, isAdmin, signOut } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated with admin privileges, redirect smoothly
  useEffect(() => {
    if (user && (isSuperAdmin || isAdmin)) {
      router.replace('/admin/dashboard');
    }
  }, [user, isSuperAdmin, isAdmin, router]);

  if (user && (isSuperAdmin || isAdmin)) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your administrator work email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        email: email.trim(),
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Invalid administrator credentials.');
        return;
      }

      const roles = res.user?.roles || [];
      const hasAdminAccess = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');

      if (!hasAdminAccess) {
        // Authenticated as standard customer without admin role
        await signOut();
        setErrorMsg('Access Denied: This account does not possess platform administrator privileges.');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center p-4 antialiased transition-colors duration-150">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group focus:outline-none">
            <BrandLogo variant="navbar" height={28} showTagline priority />
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
            <span>ADMINISTRATIVE CONTROL PORTAL</span>
          </div>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl space-y-5">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Staff Sign In</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Authorized credentials required to access platform supervision and curation tools.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs space-y-1 animate-in fade-in">
              <span className="font-bold block">Authentication Notice</span>
              <p className="text-[11px] leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bookmystudio.com"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <MailIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <LockIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              ← Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

