'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <div className="py-8 bg-white dark:bg-[#101010] min-h-[calc(100vh-140px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Privacy Policy' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="pb-8 border-b border-slate-100 dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
              LEGAL &amp; COMPLIANCE
            </span>
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
            Marketplace Privacy &amp; NDA Policy
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-[#8A8A8A]">
            Last Updated: November 18, 2026 · Standard Commercial Film &amp; Television Data Protections
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-8 prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-[#B3B3B3] leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              1. Commercial Project Confidentiality &amp; NDA Standards
            </h2>
            <p>
              BookMyStudio recognizes that commercial advertising campaigns, episodic television productions, feature films, and brand lookbooks frequently operate under strict Non-Disclosure Agreements (NDAs). We treat all project titles, call sheet rosters, talent names, script sides, and shoot dates entered into our platform as strictly confidential.
            </p>
            <p>
              Host studio facilities and crew members on the platform are contractually bound to maintain strict confidentiality regarding all creative productions staged within their premises. Unauthorized photography, social media posting, or disclosure of on-set activities is strictly prohibited and constitutes grounds for immediate termination from the BookMyStudio network.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              2. Information We Collect
            </h2>
            <p>
              To maintain our verified marketplace ecosystem, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-[#B3B3B3]">
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Production Company Credentials:</strong> Legal entity name, state of incorporation, Federal Employer Identification Number (EIN), Certificate of Good Standing, and authorized line producer contact details.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Insurance &amp; COI Data:</strong> Commercial General Liability policy documentation, insurance broker contacts, and policy endorsement records.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Facility Host Documentation:</strong> Deed or commercial lease agreements, structural floor plans, DOB occupancy certificates, electrical panel single-line diagrams, and ACH banking details for payout settlement.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-[#F5F5F5]">Crew Guild Affiliations:</strong> IATSE Local 52, Local 600, Local 798, or DGA union card numbers and kit equipment inventories.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              3. Secure Access Code &amp; Key Management
            </h2>
            <p>
              Physical access codes, lockbox combinations, roll-up gate frequencies, and alarm passcodes for studio spaces are never displayed publicly. Access credentials are only transmitted via encrypted communication channels to the verified production line producer exactly two (2) hours prior to the contracted call time, provided Certificate of Insurance (COI) verification and security hold authorizations have been successfully executed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              4. Payment &amp; ACH Security
            </h2>
            <p>
              All payment transactions, host direct deposits, and security deposits are processed via PCI-DSS Level 1 compliant financial infrastructure. BookMyStudio does not store full credit card numbers or raw bank account credentials on local application servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5F5]">
              5. Your Privacy Rights &amp; Data Deletion
            </h2>
            <p>
              Production companies and studio hosts may request an export or complete deletion of their account records at any time following the conclusion of active shoot reservations and financial reconciliation. To exercise your data rights, contact our compliance officer at <span className="font-semibold text-slate-900 dark:text-[#F5F5F5]">compliance@bookmystudio.com</span>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}

