'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';
  const resetSuccess = searchParams.get('reset') === 'success';

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your work email address and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid work email address (e.g. producer@agency.com).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({
        email: email.trim(),
        password,
      });

      if (!res.success) {
        if (res.code === 'UNVERIFIED_EMAIL') {
          setErrorMsg('Your email has not been verified yet. Redirecting to verification...');
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
          return;
        }
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
        return;
      }

      // Role-Based Post-Login Routing based on verified server session roles
      const roles = res.user?.roles || [];
      const isExplicitNext = searchParams.has('next') && nextUrl.startsWith('/');

      let destination = '/dashboard';

      if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
        // Authorized SUPER_ADMIN and ADMIN automatically route to dedicated Admin Panel
        destination = isExplicitNext && nextUrl.startsWith('/admin') ? nextUrl : '/admin/dashboard';
      } else if (roles.includes('STUDIO_OWNER') || roles.includes('PROFESSIONAL')) {
        // Studio owners & professionals automatically route to Partner Console
        destination =
          isExplicitNext && (nextUrl.startsWith('/partner') || nextUrl.startsWith('/account'))
            ? nextUrl
            : '/partner';
      } else {
        // Customers receive normal customer experience
        destination = isExplicitNext && !nextUrl.startsWith('/admin') ? nextUrl : '/';
      }

      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Password Reset Success Notice */}
      {resetSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-page-enter"
        >
          <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
          <div>
            <span className="font-bold block text-zinc-900 dark:text-white">Password updated successfully.</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300/90">
              Please sign in with your new credentials to access your production account.
            </span>
          </div>
        </div>
      )}

      {/* Accessible Error Summary Alert */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/80 text-red-800 dark:text-red-200 text-xs space-y-1 animate-page-enter"
        >
          <div className="font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span>Unable to Sign In</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300/90">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Work Email Address */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Work Email Address
        </label>
        <div className="relative">
          <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="producer@agency.com"
            className="auth-input w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-[#121216] border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="auth-input w-full pl-10 pr-11 py-3 bg-zinc-50 dark:bg-[#121216] border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Device Option */}
      <div className="flex items-center pt-1">
        <label htmlFor="remember-me" className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Remember this production device for 30 days
          </span>
        </label>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to BookMyStudio</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
