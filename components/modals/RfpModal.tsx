'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@/components/ui/Icons';

interface RfpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RfpModal({ isOpen, onClose }: RfpModalProps) {
  const [productionName, setProductionName] = useState('');
  const [powerNeeded, setPowerNeeded] = useState('600A 3-Phase Camlock');
  const [needPermits, setNeedPermits] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

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
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#121216] text-zinc-900 dark:text-[#FAFAFA] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto animate-modal-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfp-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
          aria-label="Close RFP modal"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircleIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-[#FAFAFA]">
              Stage RFP Submitted
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
              Our Facility Coordination team has received your production parameters. A dedicated stage engineer will contact your production coordinator within 2 hours.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-5"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                FACILITY COORDINATION DESK
              </span>
              <h3 id="rfp-title" className="text-xl font-extrabold text-zinc-900 dark:text-[#FAFAFA] mt-0.5">
                Submit Production Stage RFP
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                For commercial shoots requiring multi-day pre-rigging, generator tie-ins, heavy truss load calculations, or DOB street permits.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Production or Agency Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anonymous Content / Nike Campaign"
                  value={productionName}
                  onChange={(e) => setProductionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] text-zinc-900 dark:text-[#FAFAFA] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Estimated Power Distribution Requirement
                </label>
                <select
                  value={powerNeeded}
                  onChange={(e) => setPowerNeeded(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-zinc-50 dark:bg-[#18181E] text-zinc-900 dark:text-[#FAFAFA]"
                >
                  <option className="bg-white dark:bg-[#18181E] text-zinc-900 dark:text-white">300A 3-Phase Camlock</option>
                  <option className="bg-white dark:bg-[#18181E] text-zinc-900 dark:text-white">600A 3-Phase Camlock</option>
                  <option className="bg-white dark:bg-[#18181E] text-zinc-900 dark:text-white">1200A Twin-Pack Generator Tap</option>
                  <option className="bg-white dark:bg-[#18181E] text-zinc-900 dark:text-white">Standard 100A Wall Circuit Only</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#FAFAFA]">NYC DOB / City Street Filming Permits</div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Need curb parking posting &amp; generator permits</div>
                </div>
                <input
                  type="checkbox"
                  checked={needPermits}
                  onChange={(e) => setNeedPermits(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Submit Stage RFP
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
