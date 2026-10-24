'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';

export function EmailOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    const cleaned = val.replace(/[^0-9]/g, '');

    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1); // Keep last entered character
    setDigits(newDigits);

    // Auto-advance to next input if filled
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    // Focus the next empty slot or the last one
    const nextEmptyIndex = newDigits.findIndex((d) => d === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === 6;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isComplete) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email) {
      setErrorMsg('No email address provided for verification. Please register or sign in again.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.verifyEmail({
        email: email.trim(),
        otp: fullCode,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Invalid or expired verification code.');
        return;
      }

      await refreshUser();
      router.push('/dashboard?verified=true');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify verification code.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setErrorMsg(null);
    setResendSuccess(false);

    if (!email) {
      setErrorMsg('Please enter your work email to request a new verification code.');
      return;
    }

    setIsResending(true);

    try {
      const res = await authApi.resendVerification({
        email: email.trim(),
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Unable to dispatch resend request.');
        return;
      }

      setResendSuccess(true);
      setCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to dispatch resend request.';
      setErrorMsg(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6" noValidate>
      {/* Sent Email Notice */}
      <div className="p-4 rounded-xl bg-zinc-100 dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Verification Code Sent</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          We sent a 6-digit confirmation code to{' '}
          <strong className="text-zinc-900 dark:text-white font-mono">{email || 'your email address'}</strong>.
        </p>
      </div>

      {/* Accessible Error Summary */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/80 text-red-800 dark:text-red-200 text-xs space-y-1 animate-page-enter"
        >
          <div className="font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span>Verification Unsuccessful</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300/90">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Resend Success Notice */}
      {resendSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
        >
          <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
          <span>A fresh verification code has been dispatched to your inbox.</span>
        </div>
      )}

      {/* Missing Email Input Prompt (if navigated without email in URL) */}
      {!emailParam && (
        <div className="space-y-1.5">
          <label htmlFor="otp-email" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Confirm Your Work Email
          </label>
          <input
            id="otp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="producer@agency.com"
            className="auth-input w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#121216] border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {/* 6 Digit Input Group (3 - 3 formatted) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 text-center">
          Enter 6-Digit Verification Code
        </label>
        
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <React.Fragment key={idx}>
              {idx === 3 && (
                <div className="w-2 h-0.5 bg-zinc-300 dark:bg-zinc-700 mx-0.5" aria-hidden="true" />
              )}
              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`Digit ${idx + 1} of 6`}
                className="auth-input w-11 sm:w-13 h-13 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-xl bg-zinc-50 dark:bg-[#121216] border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-[#18181E] transition-all shadow-xs"
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Resend Code Trigger & Countdown */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
        <span>Didn&apos;t receive code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isResending ? (
            'Sending...'
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            'Resend Code'
          )}
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isComplete || isLoading}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify &amp; Continue to Dashboard</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Wrong Email Address Fallback */}
      <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-2">
        <span>Entered the wrong email? </span>
        <Link
          href="/create-account"
          className="font-semibold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 transition-colors"
        >
          Update registration details
        </Link>
      </div>
    </form>
  );
}
