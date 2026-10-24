'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { StarIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { useMarketplace } from '@/context/MarketplaceContext';

export default function CrewListPage() {
  const { selectedCrew, removeCrew, clearCrew } = useMarketplace();

  // Form State
  const [projectTitle, setProjectTitle] = useState('Commercial Shoot — Fall Campaign');
  const [productionCompany, setProductionCompany] = useState('Sundance Creative Studio LLC');
  const [producerName, setProducerName] = useState('Alex Rivera');
  const [producerEmail, setProducerEmail] = useState('alex@sundancecreative.com');
  const [shootDays, setShootDays] = useState(2);
  const [shootDate, setShootDate] = useState('2026-11-18');
  const [callLocation, setCallLocation] = useState('Greenpoint Cove Studio A, Brooklyn');
  const [notes, setNotes] = useState('Requires pre-rig call at 06:00 on Day 1. Sound mixer requires boom op package.');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalDailyRate = selectedCrew.reduce((acc, curr) => acc + curr.dayRate10h, 0);
  const estimatedPayroll = totalDailyRate * shootDays;
  const platformInsurance = 250 * shootDays;
  const estimatedTotal = estimatedPayroll + platformInsurance;

  const handleSubmitHold = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="py-8 bg-white dark:bg-[#09090B] min-h-[calc(100vh-140px)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Production Crew', href: '/crew' },
            { label: 'Call Sheet Roster' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                DISPATCH &amp; PAYROLL ROSTER
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Call Sheet Crew Roster
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Dispatch simultaneous 48-hour holds to all selected department heads, Gaffers, DPs, and Sound Mixers for your upcoming shoot.
            </p>
          </div>

          {selectedCrew.length > 0 && (
            <button
              type="button"
              onClick={clearCrew}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/40 text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
            >
              Clear Entire Roster
            </button>
          )}
        </div>

        {selectedCrew.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Your Call Sheet Roster is Empty"
              description="You have not selected any production crew members yet. Browse our verified Directors of Photography, Gaffers, Sound Recordists, and Hair/Makeup artists to assemble your team."
              actionLabel="Browse Production Crew Directory"
              actionHref="/crew"
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Selected Crew List (Span 7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                  Selected Heads of Department ({selectedCrew.length})
                </h2>
                <Link
                  href="/crew"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>+ Add More Crew</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>

              {selectedCrew.map((member) => (
                <div
                  key={member.id}
                  className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121216] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/crew/${member.slug}`}
                          className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline text-sm sm:text-base"
                        >
                          {member.name}
                        </Link>
                        <Badge variant="secondary" size="sm">
                          {member.unionAffiliation}
                        </Badge>
                      </div>

                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {member.role} · {member.location}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{member.rating}</span>
                          <span>({member.reviewCount})</span>
                        </span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Next Open: {member.nextAvailable}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white">
                        ${member.dayRate10h}
                        <span className="text-[11px] font-normal text-zinc-400">/day</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">10-hr guarantee</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/crew/${member.slug}`}
                        className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold px-2 py-1"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeCrew(member.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Roster Regulatory Standards Box */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Standard Production Dispatch Guarantees</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  All day rates reflect a 10-hour working day under standard commercial film guild provisions. Overtime is billed at 1.5x after 10 hours and 2x after 12 hours. Meal penalties apply if first meal break is not called within 6 hours of general call.
                </p>
              </div>
            </div>

            {/* Right Column: Dispatch & Hold Form (Span 5) */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121216] shadow-xs">
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Dispatch Hold Request
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Send simultaneous 48-hour first-hold notices to all selected crew representatives.
                </p>

                {isSubmitted ? (
                  <div className="mt-6 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-300">
                      <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span>Shoot Holds Dispatched!</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      First-hold notices for <strong className="font-semibold">{projectTitle}</strong> have been sent to agents for all {selectedCrew.length} selected department heads.
                    </p>
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-400">
                      <strong>Interactive Prototype Demonstration:</strong> Illustrative demonstration. No live guild notices or credit card charges were processed.
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-2 w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit Shoot Details
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitHold} className="mt-5 space-y-4">
                    {/* Project Title */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Project / Campaign Title
                      </label>
                      <input
                        type="text"
                        required
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Company & Producer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Production Company
                        </label>
                        <input
                          type="text"
                          required
                          value={productionCompany}
                          onChange={(e) => setProductionCompany(e.target.value)}
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Producer Name
                        </label>
                        <input
                          type="text"
                          required
                          value={producerName}
                          onChange={(e) => setProducerName(e.target.value)}
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Producer Email */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Producer Work Email
                      </label>
                      <input
                        type="email"
                        required
                        value={producerEmail}
                        onChange={(e) => setProducerEmail(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Shoot Dates & Days */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          First Shoot Day
                        </label>
                        <input
                          type="date"
                          required
                          value={shootDate}
                          onChange={(e) => setShootDate(e.target.value)}
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Total Shoot Days
                        </label>
                        <select
                          value={shootDays}
                          onChange={(e) => setShootDays(Number(e.target.value))}
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value={1}>1 Day (Single Shoot)</option>
                          <option value={2}>2 Days (Weekend / Multi-Day)</option>
                          <option value={3}>3 Days (Commercial)</option>
                          <option value={5}>5 Days (Weekly Shoot)</option>
                        </select>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Stage / Shoot Location
                      </label>
                      <input
                        type="text"
                        required
                        value={callLocation}
                        onChange={(e) => setCallLocation(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Call Notes &amp; Gear Kit Inclusions
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Daily Payroll Subtotal ({selectedCrew.length} Crew)</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">${totalDailyRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Total Shoot Days ({shootDays} {shootDays === 1 ? 'day' : 'days'})</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">${estimatedPayroll.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Guild &amp; Production Insurance Bond</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">${platformInsurance.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between text-sm font-extrabold text-zinc-950 dark:text-white">
                        <span>Estimated Total</span>
                        <span>${estimatedTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      Dispatch Shoot Holds ({selectedCrew.length} Crew)
                    </button>

                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
                      Interactive demonstration. No deposit or payment is collected at this step.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
