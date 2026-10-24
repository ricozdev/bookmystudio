'use client';

import React, { useEffect } from 'react';
import { ShieldPolicyIcon, CheckCircleIcon } from '@/components/ui/Icons';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyModal({ isOpen, onClose }: PolicyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-overlay-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#121216] text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto animate-modal-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
          aria-label="Close insurance policy modal"
        >
          ✕
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShieldPolicyIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                PRODUCTION ASSURANCE PROGRAM
              </span>
              <h3 id="policy-title" className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                $2,000,000 Direct Production Liability &amp; COI Endorsement
              </h3>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Every studio booked through BookMyStudio is backed by our standardized commercial production coverage. This replaces the traditional 48-hour manual certificate review with instant verified endorsements.
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Instant Automated COI Issuance</h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Named facility owner and stage manager are automatically endorsed as additional insured with waiver of subrogation within 60 seconds of checkout.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">$2,000,000 Host Property Protection</h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Covers physical cyclorama coves, flooring, electrical Camlock panels, and structural overhead rigging trusses against set accidental damage.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Union &amp; Commercial Signatory Ready</h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Compliant with IATSE Local 52/600 and AICP standard commercial production guidelines.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Close Policy Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

