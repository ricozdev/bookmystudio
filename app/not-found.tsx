import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center bg-white dark:bg-[#101010]">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#181818] flex items-center justify-center text-slate-400 dark:text-[#8A8A8A] mb-4 border border-slate-200 dark:border-[#262626]">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
        404 — PRODUCTION LISTING NOT FOUND
      </span>

      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F5F5F5] tracking-tight">
        This Production Stage or Profile Does Not Exist
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-[#B3B3B3] max-w-md mx-auto leading-relaxed">
        The studio space, filming location, or professional profile you are looking for may have been archived or moved to another certified hub.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/studios"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <span>Explore Studios</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/locations"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#303030] text-slate-700 dark:text-[#F5F5F5] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors"
        >
          Filming Locations
        </Link>

        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#303030] text-slate-700 dark:text-[#F5F5F5] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

