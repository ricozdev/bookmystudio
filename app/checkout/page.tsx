'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi, BookingPayload } from '@/lib/api/marketplace';
import { BookingQuoteResponse, BookingPricingBreakdown } from '@/lib/types';
import {
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldPolicyIcon,
} from '@/components/ui/Icons';

interface PendingBookingState {
  category: 'studio' | 'location' | 'crew' | 'equipment';
  listingId: string;
  title: string;
  location?: string;
  imageUrl?: string;
  specsSummary?: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  powerAddon: boolean;
  riggingAddon: boolean;
  attendeesCount: number;
  estimatedTotal: number;
  pricingBreakdown?: BookingPricingBreakdown | null;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Load initial params from URL or sessionStorage
  const [bookingState, setBookingState] = useState<PendingBookingState | null>(null);

  // Form Fields
  const [productionName, setProductionName] = useState('');
  const [producerName, setProducerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [projectType, setProjectType] = useState('Commercial Shoot');
  const [attendeesCount, setAttendeesCount] = useState(12);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToCoi, setAgreedToCoi] = useState(false);

  // Quote State
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictOccurred, setConflictOccurred] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Record<string, unknown> | null>(null);

  // Countdown timer for 15-minute priority hold
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setHoldSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedHoldTime = useMemo(() => {
    const mins = Math.floor(holdSecondsRemaining / 60);
    const secs = holdSecondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [holdSecondsRemaining]);

  // Read params on client mount
  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      let saved: PendingBookingState | null = null;
      try {
        const raw = sessionStorage.getItem('bms_pending_booking');
        if (raw) saved = JSON.parse(raw);
      } catch {}

      const rawCategory = searchParams.get('category') || saved?.category || 'studio';
      const queryCategory: 'studio' | 'location' | 'crew' | 'equipment' =
        rawCategory === 'location' || rawCategory === 'crew' || rawCategory === 'equipment' ? rawCategory : 'studio';
      const queryId = searchParams.get('id') || saved?.listingId || 'studio-stage-c';
      const queryDate = searchParams.get('date') || saved?.requestedDate || new Date().toISOString().slice(0, 10);
      const queryStart = searchParams.get('start') || saved?.startTime || '09:00';
      const queryDuration = Number(searchParams.get('duration') || saved?.durationHours || 10);
      const queryPower = searchParams.get('power') === 'true' || Boolean(saved?.powerAddon);
      const queryRig = searchParams.get('rig') === 'true' || Boolean(saved?.riggingAddon);

      const merged: PendingBookingState = {
        category: queryCategory,
        listingId: queryId,
        title: saved?.title || 'Production Soundstage',
        location: saved?.location || 'Mumbai, Maharashtra',
        imageUrl: saved?.imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
        specsSummary: saved?.specsSummary || 'Commercial Stage',
        requestedDate: queryDate,
        startTime: queryStart,
        endTime: saved?.endTime || '19:00',
        durationHours: queryDuration,
        powerAddon: queryPower,
        riggingAddon: queryRig,
        attendeesCount: saved?.attendeesCount || 12,
        estimatedTotal: saved?.estimatedTotal || 1800,
        pricingBreakdown: saved?.pricingBreakdown,
      };

      setBookingState(merged);
      setAttendeesCount(merged.attendeesCount);

      // Pre-fill user details if logged in
      if (user) {
        if (user.fullName) setProducerName(user.fullName);
        if (user.email) setContactEmail(user.email);
        if (user.phone) setContactPhone(user.phone);
        if (user.companyName) setProductionName(user.companyName);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, user]);

  // Re-quote from backend to guarantee authoritative pricing
  useEffect(() => {
    if (!bookingState?.listingId || !bookingState?.requestedDate) return;

    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;
      setIsQuoting(true);

      marketplaceApi
        .calculateQuote({
          category: bookingState.category,
          listingId: bookingState.listingId,
          requestedDate: bookingState.requestedDate,
          startTime: bookingState.startTime,
          durationHours: bookingState.durationHours,
          powerAddon: bookingState.powerAddon,
          riggingAddon: bookingState.riggingAddon,
        })
        .then((res) => {
          if (!isMounted) return;
          if (res.success && res.data) {
            setQuote(res.data);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsQuoting(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [bookingState]);

  // Format 12-hour display
  const formatTimeWindow = (startStr: string, endStr?: string) => {
    const to12h = (t: string) => {
      const [hStr, mStr] = t.split(':');
      let h = Number(hStr);
      const m = mStr || '00';
      const p = h >= 12 ? 'PM' : 'AM';
      if (h === 0) h = 12;
      else if (h > 12) h -= 12;
      return `${String(h).padStart(2, '0')}:${m} ${p}`;
    };

    if (!endStr) return to12h(startStr);
    return `${to12h(startStr)} – ${to12h(endStr)}`;
  };

  // Submit Booking Form Handler
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingState) return;

    if (!productionName.trim()) {
      setErrorMessage('Please provide your Production / Agency name.');
      return;
    }

    if (!producerName.trim()) {
      setErrorMessage('Please provide the Producer / Contact person name.');
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setErrorMessage('Please provide a valid contact email address.');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMessage('Please provide a contact phone number.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please accept the stage rental policy and terms to proceed.');
      return;
    }

    if (!agreedToCoi) {
      setErrorMessage('Please confirm that your production will supply a Certificate of Insurance (COI).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setConflictOccurred(false);

    try {
      const payload: BookingPayload = {
        listingType: bookingState.category,
        requestedDate: bookingState.requestedDate,
        startTime: bookingState.startTime,
        shiftType: `${bookingState.durationHours}h Production Shift (${projectType})`,
        durationHours: bookingState.durationHours,
        attendeesCount,
        productionName: productionName || `${projectType} Production`,
        contactEmail: contactEmail || user?.email || '',
        contactPhone,
        powerAddon: bookingState.powerAddon,
        riggingAddon: bookingState.riggingAddon,
        specialInstructions,
        estimatedTotal: quote?.estimatedTotal || bookingState.estimatedTotal,
      };

      if (bookingState.category === 'studio') {
        payload.studioId = bookingState.listingId;
      } else if (bookingState.category === 'location') {
        payload.locationId = bookingState.listingId;
      } else if (bookingState.category === 'equipment') {
        payload.equipmentId = bookingState.listingId;
      } else if (bookingState.category === 'crew') {
        payload.crewId = bookingState.listingId;
      }

      const res = await marketplaceApi.createBooking(payload);

      if (res.success && res.data) {
        setConfirmedBooking(res.data);
        // Clear pending booking from storage
        try {
          sessionStorage.removeItem('bms_pending_booking');
        } catch {}
      } else {
        setErrorMessage(res.error || 'Failed to submit reservation hold.');
      }
    } catch (err: unknown) {
      const errObj = err as { status?: number; response?: { status?: number }; message?: string };
      const status = errObj.status || errObj.response?.status;
      if (status === 409 || errObj.message?.includes('conflict') || errObj.message?.includes('already booked')) {
        setConflictOccurred(true);
        setErrorMessage(
          'This soundstage time window was just reserved by another production team. Please pick another date or time slot.'
        );
      } else {
        setErrorMessage(errObj.message || 'An unexpected error occurred while placing your stage hold.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If confirmed, show Confirmation Screen
  if (confirmedBooking) {
    const bookingId = String(confirmedBooking.id || confirmedBooking._id || 'BMS-STAGE-HOLD');
    return (
      <main className="min-h-screen bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#121216] border border-emerald-500/30 dark:border-emerald-800/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircleIcon className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full">
                15-Minute Priority Hold Secured
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Stage Reservation Hold Dispatched
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your production hold for <span className="text-zinc-900 dark:text-white font-semibold">{bookingState?.title}</span> has been registered with the stage facilities engineer.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Hold Reference:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">#{bookingId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Scheduled Date:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">{bookingState?.requestedDate}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Shoot Window:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {formatTimeWindow(bookingState?.startTime || '09:00', quote?.endTime || bookingState?.endTime)} ({bookingState?.durationHours}h)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Authoritative Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  ${(quote?.estimatedTotal || bookingState?.estimatedTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Next Steps Checklist */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-left space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Next Steps for Your Production:
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                <li>A facility technician will review power tie-in and load-in specs within 2 business hours.</li>
                <li>Submit your Certificate of Insurance (COI) naming the stage as additional insured prior to call time.</li>
                <li>Roll-up gate access PIN and soundstage protocol have been dispatched to <strong className="text-zinc-900 dark:text-white">{contactEmail}</strong>.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/account"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm text-center shadow transition-all"
              >
                View My Bookings & Holds
              </Link>
              <Link
                href="/studios"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-sm text-center transition-all"
              >
                Explore More Stages
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Marketplace</Link>
          <span>/</span>
          <Link href={`/${bookingState?.category === 'studio' ? 'studios' : bookingState?.category === 'location' ? 'locations' : bookingState?.category === 'crew' ? 'crew' : 'equipment'}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors capitalize">
            {bookingState?.category || 'Stage'}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold">Production Checkout</span>
        </div>

        {/* Priority Hold Banner */}
        <div className="bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent border border-amber-300 dark:border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                15-Minute Priority Hold Guaranteed
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                This stage date and time are reserved for your checkout session. No charge is made today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-sm font-bold text-amber-600 dark:text-amber-400 shadow-2xs">
            <span>Hold Timer:</span>
            <span>{formattedHoldTime}</span>
          </div>
        </div>

        {/* Main Grid: Form Left (7 cols), Order Summary Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mobile Order Summary Preview Card (visible on mobile only above the form) */}
          <div data-testid="mobile-order-summary" aria-label="Mobile order summary preview" className="lg:hidden bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <div className="flex gap-3 items-center">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                <Image
                  src={bookingState?.imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04'}
                  alt={bookingState?.title || 'Stage thumbnail'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-1.5 py-0.5 rounded">
                  {bookingState?.category}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate mt-0.5">
                  {bookingState?.title}
                </h3>
                <div className="flex items-center justify-between gap-2 mt-1 text-xs">
                  <span className="text-zinc-500 font-mono text-[11px] truncate">
                    {bookingState?.requestedDate} • {bookingState?.startTime} ({bookingState?.durationHours}h)
                  </span>
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-white font-mono shrink-0">
                    ${(quote?.estimatedTotal || bookingState?.estimatedTotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: Production Info & Specifications Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmitBooking} className="space-y-6" noValidate>
              {/* Conflict Alert Banner */}
              {conflictOccurred && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Booking Slot Conflict
                  </div>
                  <p className="text-red-700 dark:text-red-200/90 leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/60 dark:hover:bg-red-800 text-red-800 dark:text-white font-semibold text-[11px] transition-colors"
                  >
                    ← Return to Detail Page to Select Another Slot
                  </button>
                </div>
              )}

              {/* 1. Production Project Identity */}
              <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    1. Production & Shoot Details
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-medium">Facility Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Production / Agency Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productionName}
                      onChange={(e) => setProductionName(e.target.value)}
                      placeholder="e.g. Apex Visuals LLC"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Shoot Category
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="Commercial Shoot">Commercial / Advertising</option>
                      <option value="Music Video">Music Video Production</option>
                      <option value="Narrative Feature / Series">Narrative Feature / Series</option>
                      <option value="Editorial Photography">Editorial & Stills Photography</option>
                      <option value="Corporate / Tech Keynote">Corporate / Tech Keynote</option>
                      <option value="Virtual Production">Virtual Production / VFX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Producer / Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={producerName}
                      onChange={(e) => setProducerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Cast & Crew Headcount
                    </label>
                    <select
                      value={attendeesCount}
                      onChange={(e) => setAttendeesCount(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value={5}>1 – 5 people (Micro crew)</option>
                      <option value={12}>6 – 15 people (Standard commercial)</option>
                      <option value={25}>16 – 30 people (Full production)</option>
                      <option value={50}>31 – 50 people (Feature scale)</option>
                      <option value={100}>50+ people (Large soundstage crew)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="producer@agency.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Facility Access & Technical Requests */}
              <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    2. Facility Load-In & Special Requests
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-medium">Stage Logistics</span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {bookingState?.powerAddon && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-medium">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        3-Phase Camlock Distro Included
                      </span>
                    )}
                    {bookingState?.riggingAddon && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-medium">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Early Pre-Rigging Grid Access
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Load-in specifics, grip truck parking, or power requirements
                    </label>
                    <textarea
                      rows={3}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., 5-ton grip truck arriving at 07:30 AM, need 60A distro near south cyc wall, hazers permitted..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl p-3 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Insurance & Compliance Declarations */}
              <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    3. Insurance & Stage Compliance
                  </h3>
                  <ShieldPolicyIcon className="w-4 h-4 text-zinc-400" />
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToCoi}
                    onChange={(e) => setAgreedToCoi(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-amber-500/30"
                  />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-zinc-900 dark:text-white">Certificate of Insurance (COI):</strong> I acknowledge that our production team will provide a standard \$1M general liability COI naming the stage facility as additional insured prior to call time.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-amber-500/30"
                  />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-zinc-900 dark:text-white">Stage Rental & Safety Policy:</strong> I agree to BookMyStudio terms of service, acoustic rules, load-in protocols, and free cancellation up to 48 hours prior to reservation.
                  </span>
                </label>
              </div>

              {/* Error Notice */}
              {errorMessage && !conflictOccurred && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isQuoting}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-extrabold text-base tracking-wide shadow-[0_0_24px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Stage Window...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Production Reservation</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Sticky Summary & Breakdown */}
          <div className="lg:col-span-5 space-y-5 sticky top-24">
            <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Thumbnail & Title */}
              <div className="flex gap-4 items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                  <Image
                    src={bookingState?.imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04'}
                    alt={bookingState?.title || 'Stage thumbnail'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-md">
                    {bookingState?.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate mt-1">
                    {bookingState?.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                    {bookingState?.location}
                  </p>
                </div>
              </div>

              {/* Reservation Timing Details */}
              <div className="space-y-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    Shoot Date:
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {bookingState?.requestedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    Time Window:
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white font-mono">
                    {formatTimeWindow(bookingState?.startTime || '09:00', quote?.endTime || bookingState?.endTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Duration:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {bookingState?.durationHours} Hours
                  </span>
                </div>
              </div>

              {/* Authoritative Pricing Breakdown */}
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span>Base Stage Hire ({bookingState?.durationHours}h)</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">
                    ${quote?.pricingBreakdown?.subtotal ? quote.pricingBreakdown.subtotal.toLocaleString() : (bookingState?.estimatedTotal || 1800).toLocaleString()}
                  </span>
                </div>

                {Boolean(bookingState?.powerAddon) && (
                  <div className="flex items-center justify-between">
                    <span>3-Phase Camlock Distro Tie-in</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">+$350</span>
                  </div>
                )}

                {Boolean(bookingState?.riggingAddon) && (
                  <div className="flex items-center justify-between">
                    <span>Early Pre-Rigging Grid Access</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">+$500</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Soundstage Prep & Site Handover</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Included</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Platform Service Fee</span>
                  <span className="text-zinc-600 dark:text-zinc-400 font-mono">$0</span>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white block">Grand Total</span>
                    <span className="text-[10px] text-zinc-500">Hold placed today • No card charged</span>
                  </div>
                  <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    ${(quote?.estimatedTotal || bookingState?.estimatedTotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Zero advance deposit required for holding. Pay after engineering walkthrough.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6 text-zinc-600 dark:text-zinc-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading soundstage checkout session...</span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
