'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingCalendar } from './BookingCalendar';
import { TimeSlotSelector } from './TimeSlotSelector';
import { marketplaceApi } from '@/lib/api/marketplace';
import { AvailabilitySlot, BookingQuoteResponse } from '@/lib/types';
import { ShieldCheckIcon, ClockIcon } from '@/components/ui/Icons';

interface BookingWidgetProps {
  listingId: string;
  category: 'studio' | 'location' | 'crew' | 'equipment';
  title: string;
  hourlyRate: number;
  dayRate10h: number;
  location?: string;
  imageUrl?: string;
  specsSummary?: string;
}

export function BookingWidget({
  listingId,
  category,
  title,
  hourlyRate,
  dayRate10h,
  location,
  imageUrl,
  specsSummary,
}: BookingWidgetProps) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState(10);
  const [powerAddon, setPowerAddon] = useState(false);
  const [riggingAddon, setRiggingAddon] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState(12);

  // Initialize tomorrow's date client-side
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    queueMicrotask(() => {
      setSelectedDate(d.toISOString().slice(0, 10));
    });
  }, []);

  // Slots for the active date
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Authoritative quote from server
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Active step view (calendar or slots or summary)
  const [activeTab, setActiveTab] = useState<'calendar' | 'slots'>('slots');

  // Load slots for selected date
  useEffect(() => {
    if (!category || !listingId || !selectedDate) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setIsLoadingSlots(true);
        return marketplaceApi.getAvailability(category, listingId, { date: selectedDate });
      })
      .then((res) => {
        if (!cancelled && res?.success && res.data?.slots) {
          setSlots(res.data.slots);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, listingId, selectedDate]);

  // Load quote from server whenever booking parameters change
  useEffect(() => {
    if (!category || !listingId || !selectedDate || !selectedStartTime) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setIsQuoting(true);
        setQuoteError(null);
        return marketplaceApi.calculateQuote({
          category,
          listingId,
          requestedDate: selectedDate,
          startTime: selectedStartTime,
          durationHours,
          powerAddon,
          riggingAddon,
          shiftType: `${durationHours}h Shoot Shift`,
        });
      })
      .then((res) => {
        if (cancelled) return;
        if (res?.success && res.data) {
          setQuote(res.data);
        } else if (res?.error) {
          setQuoteError(res.error);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Unable to calculate quote';
          setQuoteError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setIsQuoting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, listingId, selectedDate, selectedStartTime, durationHours, powerAddon, riggingAddon]);

  // Date selection handler
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('slots'); // automatically shift focus to time slots
  };

  // Duration selection handler
  const handleDurationSelect = (hours: number) => {
    setDurationHours(hours);
  };

  // Start time selection handler
  const handleStartTimeSelect = (timeStr: string) => {
    setSelectedStartTime(timeStr);
  };

  // Proceed to Checkout handler
  const handleProceedToCheckout = () => {
    const bookingDetails = {
      category,
      listingId,
      title,
      location,
      imageUrl,
      specsSummary,
      requestedDate: selectedDate,
      startTime: selectedStartTime,
      endTime: quote?.endTime || '19:00',
      durationHours,
      powerAddon,
      riggingAddon,
      attendeesCount,
      estimatedTotal: quote?.estimatedTotal || dayRate10h,
      pricingBreakdown: quote?.pricingBreakdown,
    };

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bms_pending_booking', JSON.stringify(bookingDetails));
      }
    } catch {
      // Session storage failover
    }

    const query = new URLSearchParams({
      category,
      id: listingId,
      date: selectedDate,
      start: selectedStartTime,
      duration: String(durationHours),
      power: String(powerAddon),
      rig: String(riggingAddon),
    }).toString();

    router.push(`/checkout?${query}`);
  };

  // Display rates
  const formattedHourly = `$${hourlyRate}/hr`;
  const formattedDay = `$${dayRate10h.toLocaleString()}/day`;

  return (
    <div
      id="inquiry-form"
      className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl sticky top-24 scroll-mt-24 space-y-6"
    >
      {/* Top Header & Rates */}
      <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight tabular-nums">
            {durationHours >= 10 ? formattedDay : formattedHourly}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5 font-medium">
            {durationHours >= 10 ? '10h Standard Day' : 'per hour hire'}
          </span>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-full">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Verified Stage
          </span>
        </div>
      </div>

      {/* Tabs: Date vs Slots */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 px-1 text-center text-xs font-bold rounded-lg transition-all truncate ${
            activeTab === 'calendar'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">1. Select Date ({selectedDate})</span>
          <span className="sm:hidden inline">1. Date ({selectedDate.slice(5)})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`flex-1 py-2 px-1 text-center text-xs font-bold rounded-lg transition-all truncate ${
            activeTab === 'slots'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">2. Time Slot ({selectedStartTime})</span>
          <span className="sm:hidden inline">2. Time ({selectedStartTime})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'calendar' ? (
        <BookingCalendar
          category={category}
          listingId={listingId}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      ) : (
        <TimeSlotSelector
          slots={slots}
          selectedStartTime={selectedStartTime}
          selectedDuration={durationHours}
          onSelectStartTime={handleStartTimeSelect}
          onSelectDuration={handleDurationSelect}
          isLoading={isLoadingSlots}
        />
      )}

      {/* Production Specs & Add-ons */}
      <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          <span>Production Add-ons</span>
          <span className="text-[10px] text-zinc-500 normal-case">Optional facility packages</span>
        </div>

        {/* Camlock Power */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={powerAddon}
              onChange={(e) => setPowerAddon(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-amber-500/30"
            />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">3-Phase Camlock Distro (400A/600A)</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Direct tie-in with dedicated facility master disconnect</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">+$350</span>
        </label>

        {/* Pre-Rigging Access */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={riggingAddon}
              onChange={(e) => setRiggingAddon(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-amber-500/30"
            />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">Pre-Rigging & Grid Early Access</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">2-hour staging buffer prior to principal photography</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">+$500</span>
        </label>

        {/* Attendees / Crew Headcount */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-white">Crew & Talent Headcount</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Determines staging lounge & parking allocation</div>
          </div>
          <select
            value={attendeesCount}
            onChange={(e) => setAttendeesCount(Number(e.target.value))}
            className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value={5}>1 – 5 people</option>
            <option value={12}>6 – 15 people</option>
            <option value={25}>16 – 30 people</option>
            <option value={50}>31 – 50 people</option>
            <option value={100}>50+ people (Large)</option>
          </select>
        </div>
      </div>

      {/* Price Summary Breakdown */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Stage Hire ({durationHours}h @ {durationHours >= 10 ? 'day rate' : `$${hourlyRate}/hr`})
          </span>
          <span className="font-mono text-zinc-800 dark:text-zinc-300 font-semibold">
            ${quote?.pricingBreakdown?.subtotal ? quote.pricingBreakdown.subtotal.toLocaleString() : (durationHours >= 10 ? dayRate10h : hourlyRate * durationHours).toLocaleString()}
          </span>
        </div>

        {(powerAddon || riggingAddon) && (
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Production Add-ons</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
              +${quote?.pricingBreakdown?.addonsTotal || ((powerAddon ? 350 : 0) + (riggingAddon ? 500 : 0))}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>Soundstage Prep & Site Handover</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Included</span>
        </div>

        {quoteError && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300">
            {quoteError}
          </div>
        )}

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-baseline justify-between">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">Estimated Total</span>
          <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
            ${quote?.estimatedTotal ? quote.estimatedTotal.toLocaleString() : (durationHours >= 10 ? dayRate10h : hourlyRate * durationHours).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 15-Minute Priority Hold Guarantee Badge */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <ClockIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-900 dark:text-white font-medium">15-Minute Priority Hold Guarantee:</strong>{' '}
          Submitting holds your stage window instantly. No payment is charged until your production specs & COI are confirmed.
        </div>
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleProceedToCheckout}
        disabled={isQuoting || Boolean(quoteError)}
        className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-extrabold text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Proceed to Production Checkout</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>

      <p className="text-center text-[10px] text-zinc-500">
        Free cancellation up to 48 hours prior to call time • Instant facility contact
      </p>
    </div>
  );
}
