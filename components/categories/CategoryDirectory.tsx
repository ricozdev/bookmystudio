'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CycloramaCategoryIcon,
  SunDaylightIcon,
  SoundstageIcon,
  PodcastMicIcon,
  KitchenRangeIcon,
  WarehouseIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import { StudioCategory } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';

interface CategoryItem {
  id: string;
  categoryKey: StudioCategory | string;
  name: string;
  count: number;
  description: string;
  iconName: string;
}

interface CategoryDirectoryProps {
  selectedCategory?: StudioCategory | 'all';
  onSelectCategory?: (category: StudioCategory) => void;
}

export function CategoryDirectory({
  selectedCategory,
  onSelectCategory,
}: CategoryDirectoryProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    marketplaceApi
      .getStudioCategories()
      .then((res) => {
        if (isMounted && res?.data) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load studio categories', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSpaces = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'cyclorama':
        return <CycloramaCategoryIcon className="w-5 h-5" />;
      case 'sun':
        return <SunDaylightIcon className="w-5 h-5" />;
      case 'soundstage':
        return <SoundstageIcon className="w-5 h-5" />;
      case 'mic':
        return <PodcastMicIcon className="w-5 h-5" />;
      case 'kitchen':
        return <KitchenRangeIcon className="w-5 h-5" />;
      case 'warehouse':
        return <WarehouseIcon className="w-5 h-5" />;
      default:
        return <CycloramaCategoryIcon className="w-5 h-5" />;
    }
  };

  return (
    <section id="categories" className="py-8 bg-zinc-50 dark:bg-[#0E0E12] border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Subheader & Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-500 font-mono">
              STUDIO DIRECTORY
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Browse by Architecture &amp; Light Direction
            </span>
          </div>

          <Link
            href="/studios"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors group"
          >
            <span>View All {loading ? '...' : totalSpaces} Spaces</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Categories Row (Horizontal scroll on mobile, 6-col grid on desktop) */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[170px] sm:min-w-0 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-6 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-28 h-2.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))
            : categories.map((cat) => {
                const isSelected = selectedCategory === cat.categoryKey;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory?.(cat.categoryKey as StudioCategory)}
                    className={`flex-1 min-w-[170px] sm:min-w-0 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-[#18181E] border-amber-500 ring-1 ring-amber-500 shadow-sm'
                        : 'bg-white dark:bg-[#121216] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#18181E]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 group-hover:text-amber-500'
                        }`}
                      >
                        {getCategoryIcon(cat.iconName)}
                      </div>
                      <span className="text-[11px] font-bold text-zinc-500 font-mono">
                        {cat.count}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-white transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-tight">
                        {cat.description}
                      </div>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}

