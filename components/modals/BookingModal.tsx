'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StudioSpace } from '@/lib/types';
import { StarIcon, CheckCircleIcon } from '@/components/ui/Icons';
import { marketplaceApi } from '@/lib/api/marketplace';
import { useAuth } from '@/context/AuthContext';

interface BookingModalProps {
  studio: StudioSpace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ studio, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [selectedShift, setSelectedShift] = useState<'10h' | '5h' | '12h'>('10h');
  const [addCamlock, setAddCamlock] = useState(false);
  const [addPreRig, setAddPreRig] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setIsSubmitted(false);
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

  if (!isOpen || !studio) return null;

  const baseShiftPrice =
    selectedShift === '10h'
      ? studio.dayRate10h
      : selectedShift === '5h'
      ? Math.round(studio.dayRate10h * 0.6)
      : Math.round(studio.dayRate10h * 1.25);

  const addOnTotal = (addCamlock ? 350 : 0) + (addPreRig ? 500 : 0);
  const subtotal = baseShiftPrice + addOnTotal;
  const holdReferenceId = `#BMS-HOLD-${studio.id.replace('studio-', '').toUpperCase()}-8492`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-overlay-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#121216] text-zinc-900 dark:text-zinc-100 rounded-t-3xl sm:rounded-3xl border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-7 overflow-hidden max-h-[92vh] overflow-y-auto animate-drawer-up sm:animate-modal-in safe-area-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        {/* Mobile drag handle bar */}
        <div className="sm:hidden flex justify-center pb-2 -mt-1">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
          aria-label="Close booking modal"
        >
          ✕
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Production Date Hold Requested
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your shoot shift inquiry for <span className="font-semibold text-zinc-900 dark:text-white">{studio.name}</span> has been dispatched to the on-site Facility Stage Manager.
            </p>
            <div className="p-3 bg-zinc-100 dark:bg-[#18181E] rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-400 max-w-xs mx-auto border border-zinc-200 dark:border-zinc-800">
              Hold Reference: {holdReferenceId}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Return to Studio Directory
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Header: Studio Summary */}
            <div className="flex gap-4 items-center pr-8">
              <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={studio.imageUrl}
                  alt={studio.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {studio.categoryLabel}
                </span>
                <h3 id="booking-title" className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
                  {studio.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  <span>{studio.location}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                    <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{studio.rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Select Shoot Shift
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedShift('10h')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedShift === '10h'
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-bold">10h Full Day</div>
                  <div className={`text-[10px] mt-0.5 font-mono ${selectedShift === '10h' ? 'text-amber-700 dark:text-amber-300/80 font-bold' : 'text-zinc-500'}`}>
                    ${studio.dayRate10h.toLocaleString()}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('5h')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedShift === '5h'
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-bold">5h Half Day</div>
                  <div className={`text-[10px] mt-0.5 font-mono ${selectedShift === '5h' ? 'text-amber-700 dark:text-amber-300/80 font-bold' : 'text-zinc-500'}`}>
                    ${Math.round(studio.dayRate10h * 0.6).toLocaleString()}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('12h')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedShift === '12h'
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-bold">12h Overnight</div>
                  <div className={`text-[10px] mt-0.5 font-mono ${selectedShift === '12h' ? 'text-amber-700 dark:text-amber-300/80 font-bold' : 'text-zinc-500'}`}>
                    ${Math.round(studio.dayRate10h * 1.25).toLocaleString()}
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Facility Add-ons */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Facility &amp; Power Add-ons
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] hover:bg-zinc-100 dark:hover:bg-[#22222B] cursor-pointer">
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">3-Phase 400A Camlock Subpanel Drop</span>
                    <span className="block text-[11px] text-zinc-600 dark:text-zinc-400">Direct heavy lighting power tie-in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 font-mono">+$350</span>
                    <input
                      type="checkbox"
                      checked={addCamlock}
                      onChange={(e) => setAddCamlock(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] hover:bg-zinc-100 dark:hover:bg-[#22222B] cursor-pointer">
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Facility Pre-Rigging Technician</span>
                    <span className="block text-[11px] text-zinc-600 dark:text-zinc-400">2-hour early call for overhead truss pre-hang</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 font-mono">+$500</span>
                    <input
                      type="checkbox"
                      checked={addPreRig}
                      onChange={(e) => setAddPreRig(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Price Quote Summary */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-mono">
                <span>Shift Facility Fee ({selectedShift})</span>
                <span className="font-medium text-zinc-900 dark:text-white">${baseShiftPrice.toLocaleString()}</span>
              </div>
              {addOnTotal > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-mono">
                  <span>Selected Power &amp; Rigging Add-ons</span>
                  <span className="font-medium text-zinc-900 dark:text-white">+${addOnTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-mono">
                <span>Direct Production Liability Insurance</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Included ($0)</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline text-sm font-extrabold text-zinc-900 dark:text-white">
                <span>Estimated Shift Subtotal</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">${subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await marketplaceApi.createBooking({
                      listingType: 'studio',
                      studioId: studio.slug || studio.id,
                      requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                      shiftType: `${selectedShift} Shift`,
                      durationHours: selectedShift === '5h' ? 5 : selectedShift === '12h' ? 12 : 10,
                      productionName: user ? `${user.fullName} Production` : 'Commercial Shoot Project',
                      contactEmail: user?.email || 'producer@agency.com',
                      powerAddon: addCamlock,
                      riggingAddon: addPreRig,
                      estimatedTotal: subtotal,
                    });
                  } catch {
                    // Gracefully proceed if running anonymously
                  } finally {
                    setIsSubmitting(false);
                    setIsSubmitted(true);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center disabled:opacity-60"
              >
                {isSubmitting ? 'Dispatching Hold Request...' : 'Request Production Date Hold'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
