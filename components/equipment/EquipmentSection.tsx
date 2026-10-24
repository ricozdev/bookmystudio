'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EquipmentCard } from './EquipmentCard';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { marketplaceApi } from '@/lib/api/marketplace';
import { EquipmentItem } from '@/lib/types';

export function EquipmentSection() {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    let active = true;
    marketplaceApi.getEquipment({ limit: 4 }).then((res) => {
      if (active && res.success && Array.isArray(res.data)) {
        setEquipmentList(res.data.slice(0, 4));
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-14 sm:py-16 bg-slate-50/50 dark:bg-[#141414] border-t border-slate-100 dark:border-[#202020] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-[#202020] mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
                  PRODUCTION GEAR &amp; CAMERA PACKAGES
                </span>
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
                Cinema Cameras, Lighting &amp; Grip Packages
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-[#B3B3B3] max-w-2xl leading-relaxed">
                Rent turnkey camera, lighting, audio, and grip packages pre-staged for your studio call sheet.
              </p>
            </div>

            <Link
              href="/equipment"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start md:self-auto"
            >
              <span>Explore All Equipment</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 4-Column Equipment Grid with Staggered Scroll Reveals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {equipmentList.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 60}>
              <EquipmentCard equipment={item} />
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
