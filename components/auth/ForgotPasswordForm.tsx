'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MailIcon, CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon } from '@/components/ui/Icons';
import { authApi } from '@/lib/api/auth';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email: email.trim() });
      // Always show confirmation to prevent email enumeration
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to dispatch recovery email.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center animate-page-enter">
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Recovery Instructions Sent
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
            If an account is associated with{' '}
            <strong className="text-zinc-900 dark:text-white font-mono">{email}</strong>, a secure password recovery link has been dispatched. Please check your inbox.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <span>Return to Sign In</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Accessible Error Summary */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/80 text-red-800 dark:text-red-200 text-xs space-y-1 animate-page-enter"
        >
          <div className="font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span>Unable to Dispatch Recovery Link</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300/90">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Work Email Address */}
      <div className="space-y-1.5">
        <label
          htmlFor="forgot-email"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Registered Work Email
        </label>
        <div className="relative">
          <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="producer@agency.com"
            className="auth-input w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-[#121216] border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]"
          />
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          We will send a one-time secure link to reset your production password.
        </p>
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
              <span>Sending Instructions...</span>
            </>
          ) : (
            <>
              <span>Send Recovery Link</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Back to Login Action */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
}
