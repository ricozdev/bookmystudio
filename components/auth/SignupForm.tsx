'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';

export function SignupForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Password Validation Criteria
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full legal or production company name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Work email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid work email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters in length.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy to create an account.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (!res.success) {
        setGlobalError(res.error || 'Failed to create account. Please try again.');
        return;
      }

      // If user was created, route to email OTP verification
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An error occurred while creating your account.';
      setGlobalError(message);
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
            <span>Unable to Create Account</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300/90">
            {globalError}
          </p>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-fullname"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Full Legal / Producer Name
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="signup-fullname"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: '' }));
              }
            }}
            placeholder="Sarah Jenkins"
            className={`auth-input w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-[#121216] border ${
              fieldErrors.fullName
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-zinc-300 dark:border-zinc-800'
            } rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]`}
          />
        </div>
        {fieldErrors.fullName && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      {/* Work Email Address */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-email"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Work Email Address
        </label>
        <div className="relative">
          <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            placeholder="producer@agency.com"
            className={`auth-input w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-[#121216] border ${
              fieldErrors.email
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-zinc-300 dark:border-zinc-800'
            } rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all min-h-[46px]`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-password"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Create Password
        </label>
        <div className="relative">
          <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="signup-password"
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

        {/* Password Strength Requirement Indicators */}
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

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-confirm-password"
          className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          Confirm Password
        </label>
        <div className="relative">
          <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="signup-confirm-password"
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
            placeholder="Re-enter your password"
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

      {/* Terms & Privacy Checkbox */}
      <div className="pt-1">
        <label htmlFor="agree-terms" className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id="agree-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              if (fieldErrors.agreeTerms) {
                setFieldErrors((prev) => ({ ...prev, agreeTerms: '' }));
              }
            }}
            className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            I agree to the BookMyStudio{' '}
            <Link href="/terms" target="_blank" className="text-zinc-900 dark:text-white font-semibold underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="text-zinc-900 dark:text-white font-semibold underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-400">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {fieldErrors.agreeTerms && (
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
            {fieldErrors.agreeTerms}
          </p>
        )}
      </div>

      {/* Primary Submit Action */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Creating Production Account...</span>
            </>
          ) : (
            <>
              <span>Create Production Account</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
