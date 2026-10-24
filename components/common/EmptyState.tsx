import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200 dark:border-[#303030] p-8 my-6">
      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-[#262626] flex items-center justify-center text-slate-400 dark:text-[#8A8A8A] mb-3">
        {icon || (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-[#F5F5F5]">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8A8A] max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-4 px-4 py-2 bg-slate-900 dark:bg-[#F5F5F5] text-white dark:text-[#101010] rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-slate-900 dark:bg-[#F5F5F5] text-white dark:text-[#101010] rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

