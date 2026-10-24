'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhoneInput, PhoneChangeValue } from './PhoneInput';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPhone?: string | null;
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  initialPhone = '',
}: PhoneVerificationModalProps) {
  const { refreshUser } = useAuth();

  const [step, setStep] = useState<'ENTER_PHONE' | 'ENTER_OTP' | 'SUCCESS'>('ENTER_PHONE');
  const [phoneVal, setPhoneVal] = useState<PhoneChangeValue>({
    raw: initialPhone || '',
    e164: initialPhone || '',
    isValid: false,
    country: 'IN',
  });

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset or initialize when modal opens during render
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setErrorMsg(null);
      setSimulatedOtpNotice(null);
      if (initialPhone) {
        setPhoneVal({
          raw: initialPhone,
          e164: initialPhone,
          isValid: true,
          country: 'IN',
        });
      }
      setStep('ENTER_PHONE');
      setOtpDigits(['', '', '', '', '', '']);
    }
  }

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'ENTER_OTP') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSimulatedOtpNotice(null);

    const targetPhone = phoneVal.e164 || phoneVal.raw;
    if (!targetPhone) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.sendPhoneOtp(targetPhone);
      if (res.success) {
        setMaskedPhone(res.maskedPhone || targetPhone);
        setCooldownSeconds(res.cooldownSeconds || 60);
        if (res.simulatedOtp) {
          setSimulatedOtpNotice(`Dev OTP: ${res.simulatedOtp}`);
        }
        setStep('ENTER_OTP');
      } else {
        setErrorMsg(res.error || 'Failed to dispatch verification code.');
        if (res.retryAfter) {
          setCooldownSeconds(res.retryAfter);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error dispatching OTP.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return; // numbers only

    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);

    // Auto-advance
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if complete
    const fullOtp = next.join('');
    if (fullOtp.length === 6 && !next.includes('')) {
      handleVerifyOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const next = [...otpDigits];
        next[index - 1] = '';
        setOtpDigits(next);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const digits = pasteData.slice(0, 6).split('');
    const next = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    setOtpDigits(next);

    const focusIdx = Math.min(digits.length, 5);
    otpInputRefs.current[focusIdx]?.focus();

    if (next.every((d) => d !== '')) {
      handleVerifyOtp(next.join(''));
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const otp = typeof codeToVerify === 'string' ? codeToVerify : otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMsg('Please enter all 6 digits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await authApi.verifyPhoneOtp(otp);
      if (res.success) {
        setStep('SUCCESS');
        await refreshUser();
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Verification failed. Incorrect OTP.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify OTP.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs transition-opacity"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 text-zinc-900 dark:text-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              {step === 'SUCCESS'
                ? 'Phone Verified'
                : step === 'ENTER_OTP'
                ? 'Enter 6-Digit Code'
                : 'Verify Phone Number'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Required for host listing publishing &amp; crew dispatch
            </p>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {simulatedOtpNotice && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between">
            <span className="font-mono font-bold">{simulatedOtpNotice}</span>
            <button
              type="button"
              onClick={() => {
                const devCode = simulatedOtpNotice.replace('Dev OTP: ', '').trim();
                if (devCode.length === 6) {
                  setOtpDigits(devCode.split(''));
                  handleVerifyOtp(devCode);
                }
              }}
              className="px-2 py-1 text-[11px] bg-amber-500 text-black font-semibold rounded-md hover:bg-amber-400"
            >
              Fill &amp; Verify
            </button>
          </div>
        )}

        {/* STEP 1: Enter Phone */}
        {step === 'ENTER_PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Mobile Number
              </label>
              <PhoneInput
                value={phoneVal.raw}
                onChange={setPhoneVal}
                autoFocus
                disabled={isSubmitting}
              />
              <p className="mt-2 text-[11px] text-zinc-500">
                We will dispatch an SMS containing a one-time 6-digit code. Standard carrier rates may apply.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !phoneVal.raw}
              className="w-full py-3 min-h-[44px] bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-zinc-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Sending Code...</span>
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 'ENTER_OTP' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                <span>Sent to: <strong className="text-zinc-900 dark:text-zinc-200">{maskedPhone}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('ENTER_PHONE');
                    setErrorMsg(null);
                  }}
                  className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium underline underline-offset-2"
                >
                  Edit number
                </button>
              </div>

              {/* 6 Digit Input Group */}
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 sm:w-12 h-13 sm:h-14 text-center text-lg sm:text-xl font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 focus:outline-hidden transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isSubmitting || otpDigits.some((d) => d === '')}
                className="w-full py-3 min-h-[44px] bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-zinc-950" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                {cooldownSeconds > 0 ? (
                  <span className="text-xs text-zinc-500">
                    Resend code in <strong className="text-zinc-700 dark:text-zinc-400 font-mono">{cooldownSeconds}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSubmitting}
                    className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium hover:underline cursor-pointer"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'SUCCESS' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">Phone Number Verified!</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
              Your phone number is confirmed. You can now publish studio stages and receive live shoot dispatches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
