'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, LockIcon, ArrowRightIcon, ArrowLeftIcon } from '@/components/ui/Icons';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { refreshUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!token) {
      errors.token = 'Password reset token is missing. Please click the link in your recovery email.';
    }

    if (!password) {
      errors.password = 'New password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters in length.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        token,
        password,
      });

      if (!res.success) {
        setGlobalError(res.error || 'Unable to update password. Recovery link may have expired.');
        return;
      }

      await refreshUser();
      router.push('/login?reset=success');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to update password.';
      setGlobalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Accessible Global Error Alert */}
      {globalError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/80 text-red-800 dark:text-red-200 text-xs space-y-1 animate-page-enter"
        >
          <div className="font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span>Password Update Failed</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300/90">
            {globalError}
          </p>
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="new-password"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          New Password
        </label>
        <div className="relative">
          <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            placeholder="At least 8 characters"
            className={`auth-input w-full pl-10 pr-11 py-3 bg-zinc-50 dark:bg-[#121216] border ${
              fieldErrors.password
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-zinc-300 dark:border-zinc-800'
            } rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]`}
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

        {/* Dynamic Criteria checklist */}
        <div className="pt-1 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
            <span>{hasMinLength ? '✓' : '○'}</span>
            <span>8+ characters</span>
          </span>
          <span className={`inline-flex items-center gap-1 ${hasNumberOrSymbol ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
            <span>{hasNumberOrSymbol ? '✓' : '○'}</span>
            <span>Number or symbol</span>
          </span>
        </div>
      </div>

      {/* Confirm New Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirm-new-password"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Confirm New Password
        </label>
        <div className="relative">
          <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="confirm-new-password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }
            }}
            placeholder="Re-enter your new password"
            className={`auth-input w-full pl-10 pr-11 py-3 bg-zinc-50 dark:bg-[#121216] border ${
              fieldErrors.confirmPassword
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-zinc-300 dark:border-zinc-800'
            } rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
            {fieldErrors.confirmPassword}
          </p>
        )}
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
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Save New Password &amp; Sign In</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Back to Sign In */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Cancel and return to Sign In</span>
        </Link>
      </div>
    </form>
  );
}
