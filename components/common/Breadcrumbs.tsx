import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`py-3 text-xs text-slate-500 dark:text-[#8A8A8A] font-medium ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        <li>
          <Link href="/" className="hover:text-slate-900 dark:hover:text-[#F5F5F5] transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-[#454545]">/</span>
              {isLast || !item.href ? (
                <span className="text-slate-900 dark:text-[#F5F5F5] font-semibold truncate max-w-xs" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-slate-900 dark:hover:text-[#F5F5F5] transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
