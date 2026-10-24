'use client';

import React, { useState } from 'react';
import {
  CamlockPowerIcon,
  GripIcon,
  TruckLoadingIcon,
  StageManagerIcon,
  ShieldPolicyIcon,
  CheckCircleIcon,
} from '@/components/ui/Icons';
import { FACILITY_COMPARISON_DATA } from '@/lib/data';

export function FacilityComparison() {
  const [mobileActiveTier, setMobileActiveTier] = useState<'dryHire' | 'turnkey'>('turnkey');

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'power':
        return <CamlockPowerIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'grip':
        return <GripIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'truck':
        return <TruckLoadingIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'manager':
        return <StageManagerIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'shield':
        return <ShieldPolicyIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <CamlockPowerIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <section id="comparison" className="py-14 sm:py-16 bg-zinc-50 dark:bg-[#0E0E12] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              FACILITY STANDARDS
            </span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Dry Hire Space <span className="text-zinc-400 font-normal">vs.</span> Turnkey Production Stage
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Understand operational tiers before booking. Every reservation on BookMyStudio includes our automated $2,000,000 direct production liability certificate.
          </p>
        </div>

        {/* Mobile Tier Switcher (< md) */}
        <div className="mb-6 md:hidden flex p-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileActiveTier('dryHire')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              mobileActiveTier === 'dryHire'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Standard Dry Hire
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTier('turnkey')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              mobileActiveTier === 'turnkey'
                ? 'bg-amber-500 text-white'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Turnkey Production
          </button>
        </div>

        {/* Desktop Comparison Table (hidden on mobile, shown on md+) */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121216] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-100/60 dark:bg-zinc-900/60 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="py-4 px-6 w-1/3">Production Capability</th>
                <th className="py-4 px-6 w-1/3 text-zinc-700 dark:text-zinc-300">Dry Hire Space</th>
                <th className="py-4 px-6 w-1/3 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">Turnkey Commercial Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {FACILITY_COMPARISON_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      {getServiceIcon(row.iconName)}
                    </div>
                    <span>{row.specification}</span>
                  </td>
                  <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">
                    {row.standardDryHire}
                  </td>
                  <td className="py-4 px-6 font-medium text-zinc-900 dark:text-zinc-100 bg-amber-50/30 dark:bg-amber-950/10">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>{row.turnkeyStage}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Comparison Cards (< md) */}
        <div className="md:hidden space-y-3">
          {FACILITY_COMPARISON_DATA.map((row) => (
            <div
              key={row.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216]"
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {getServiceIcon(row.iconName)}
                </div>
                <span>{row.specification}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-9">
                {mobileActiveTier === 'dryHire' ? row.standardDryHire : (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{row.turnkeyStage}</span>
                )}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
