'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function TermsPage() {
  return (
    <div className="py-8 bg-white dark:bg-[#101010] min-h-[calc(100vh-140px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Terms of Service' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="pb-8 border-b border-slate-100 dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
              OPERATIONS &amp; CONTRACTS
            </span>
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
            Commercial Production Terms of Service
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-[#8A8A8A]">
            Last Updated: November 18, 2026 · Standard Commercial Studio Rental &amp; Operations Agreement
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-8 prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-[#B3B3B3] leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              1. 10-Hour Commercial Shoot Day Definition
            </h2>
            <p>
              All standard studio bookings operate on a guaranteed ten (10) consecutive hour shoot day basis unless otherwise expressly specified in the confirmed reservation agreement. The shoot day commences precisely at the agreed-upon call time (which includes initial grip truck load-in) and concludes when the stage is fully swept, equipment packed, and all crew members have completed load-out wrap.
            </p>
            <p>
              Overtime begins accruing precisely at the ten-hour and one-minute mark (10:01). Overtime is billed at one and one-half times (1.5x) the base hourly rate for hours 10 through 12, and double time (2.0x) for any hour or fraction of an hour extending beyond twelve (12) hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              2. White Cyclorama Maintenance &amp; Repaint Policy
            </h2>
            <p>
              White cycloramas and infinity coves are delivered clean, swept, and scuff-free. Productions must maintain the floor using shoe booties or clean production footwear during pre-rigging and camera setup.
            </p>
            <p>
              If the cyclorama floor is soiled, marked by vehicular tires, or painted with non-standard colored pigments, a standard cyclorama repaint fee (typically $350.00 to $500.00 depending on stage cove dimensions) will be automatically assessed to restore the cove to fresh architectural flat white.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              3. Power Tie-Ins &amp; Camlock Electrical Regulations
            </h2>
            <p>
              Heavy electrical connections to 3-phase 120/208V Camlock company switches must be executed exclusively by a licensed union gaffer, certified production electrician, or authorized facility stage manager. Tying in barefoot wires or bypassing electrical breakers is strictly prohibited. If power consumption exceeds contracted thresholds or requires facility generator tie-in, metered utility surcharges will apply.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              4. Hazardous Materials, Water &amp; Pyrotechnics
            </h2>
            <p>
              Open flames, smoke machines / hazers, atmospheric fire effects, water tank effects, stunts, and live animals require prior written authorization from the host facility at least forty-eight (48) hours prior to call time. Productions utilizing atmospheric hazers must coordinate with stage management to temporarily place optical smoke detector zones into bypass mode under certified FDNY Fire Watch supervision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              5. Cancellation, Postponement &amp; Refund Schedule
            </h2>
            <p>
              Due to commercial soundstage reservation commitments, the following cancellation schedule strictly applies to all bookings:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-[#B3B3B3]">
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Fourteen (14) or More Days Prior to Call Time:</strong> Full refund of stage rental fee minus a 3% administrative transaction fee.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Seven (7) to Thirteen (13) Days Prior to Call Time:</strong> Fifty percent (50%) refund of total stage rental fee.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Fewer Than Seven (7) Days Prior to Call Time:</strong> Stage rental fees are one hundred percent (100%) non-refundable. Productions may request a date postponement subject to stage host discretion and a 15% rebooking charge.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              6. Certificate of Insurance (COI) Requirements
            </h2>
            <p>
              All productions must maintain Commercial General Liability insurance of no less than $1,000,000 per occurrence / $2,000,000 aggregate, naming BookMyStudio LLC and the specific studio facility entity as Additional Insured. If the production does not hold an active annual commercial policy, coverage must be obtained via the BookMyStudio instant automated direct liability program prior to load-in.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}

