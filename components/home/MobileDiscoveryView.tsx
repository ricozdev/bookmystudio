'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SearchIcon,
  ArrowRightIcon,
  ShieldPolicyIcon,
  CycloramaCategoryIcon,
  SunDaylightIcon,
  SoundstageIcon,
  KitchenRangeIcon,
  WarehouseIcon,
  ClapperboardIcon,
  GearCrateIcon,
} from '@/components/ui/Icons';
import { StudioCard } from '@/components/studios/StudioCard';
import { LocationCard } from '@/components/locations/LocationCard';
import { CrewCard } from '@/components/crew/CrewCard';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { StudioSpace, FilmingLocation, ProductionCrewMember, EquipmentItem } from '@/lib/types';
import { marketplaceApi } from '@/lib/api/marketplace';

interface MobileDiscoveryViewProps {
  onOpenSearch: () => void;
  onOpenPolicyModal: () => void;
  onOpenCalculator: () => void;
}

const CATEGORIES = [
  {
    label: 'Cycloramas',
    desc: 'White Cove',
    href: '/studios?category=cyclorama',
    icon: CycloramaCategoryIcon,
    badge: 'Stage A',
  },
  {
    label: 'Soundstages',
    desc: 'STC 60+ Sound',
    href: '/studios?category=soundstage',
    icon: SoundstageIcon,
    badge: 'Silent',
  },
  {
    label: 'Daylight Lofts',
    desc: 'North Facing',
    href: '/studios?category=daylight',
    icon: SunDaylightIcon,
    badge: 'Natural',
  },
  {
    label: 'Filming Locations',
    desc: 'Warehouses & Lofts',
    href: '/locations',
    icon: WarehouseIcon,
    badge: 'Raw Set',
  },
  {
    label: 'Kitchen Stages',
    desc: 'Culinary Sets',
    href: '/studios?category=kitchen',
    icon: KitchenRangeIcon,
    badge: 'Working',
  },
  {
    label: 'Camera Crew',
    desc: 'Union Heads of Dept',
    href: '/crew',
    icon: ClapperboardIcon,
    badge: 'IATSE',
  },
  {
    label: 'Cinema Packages',
    desc: 'Arri Alexa & Grip',
    href: '/equipment',
    icon: GearCrateIcon,
    badge: 'Turnkey',
  },
];

export function MobileDiscoveryView({
  onOpenSearch,
  onOpenPolicyModal,
  onOpenCalculator,
}: MobileDiscoveryViewProps) {
  const [featuredStudios, setFeaturedStudios] = useState<StudioSpace[]>([]);
  const [featuredLocations, setFeaturedLocations] = useState<FilmingLocation[]>([]);
  const [featuredCrew, setFeaturedCrew] = useState<ProductionCrewMember[]>([]);
  const [featuredGear, setFeaturedGear] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      marketplaceApi.getStudios({ limit: 4 }).catch(() => null),
      marketplaceApi.getLocations({ limit: 3 }).catch(() => null),
      marketplaceApi.getProfessionals({ limit: 3 }).catch(() => null),
      marketplaceApi.getEquipment({ limit: 3 }).catch(() => null),
    ]).then(([sRes, lRes, cRes, eRes]) => {
      if (!active) return;
      if (sRes?.success && Array.isArray(sRes.data)) setFeaturedStudios(sRes.data.slice(0, 4));
      if (lRes?.success && Array.isArray(lRes.data)) setFeaturedLocations(lRes.data.slice(0, 3));
      if (cRes?.success && Array.isArray(cRes.data)) setFeaturedCrew(cRes.data.slice(0, 3));
      if (eRes?.success && Array.isArray(eRes.data)) setFeaturedGear(eRes.data.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. App-Style Search Trigger Header */}
      <section className="px-4 pt-4">
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 dark:from-[#181818] dark:to-[#121212] p-5 text-white shadow-xl overflow-hidden border border-slate-800 dark:border-[#262626]">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified Commercial Production Stages</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Find the Perfect Stage for Your Next Shoot
          </h1>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-sm">
            Instant booking for cycloramas, soundstages, filming locations, and union camera crews.
          </p>

          {/* Native-Feeling Search Pill */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-4 w-full p-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <SearchIcon className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="block text-xs font-semibold text-white">
                  Where is your next shoot?
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  Brooklyn · Manhattan · Soundstages · Daylight
                </span>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
              Search
            </span>
          </button>
        </div>
      </section>

      {/* 2. Visual Category Discovery Row (Horizontal Touch Carousel) */}
      <section className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
            BROWSE BY ARCHETYPE
          </span>
          <Link href="/studios" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            View All
          </Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="snap-start shrink-0 w-32 p-3 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/90 dark:border-[#303030] shadow-2xs hover:border-slate-300 dark:hover:border-[#404040] transition-all flex flex-col justify-between h-30 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#252525] flex items-center justify-center text-slate-700 dark:text-[#F5F5F5] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#252525] text-slate-600 dark:text-[#A0A0A0]">
                    {cat.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F5F5] leading-tight truncate">
                    {cat.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-[#8A8A8A] truncate mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Certified Stages (Horizontal Swipe Carousel) */}
      <section className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
              TOP PRODUCTION SUITES
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F5F5F5]">
              Featured Production Stages
            </h2>
          </div>
          <Link
            href="/studios"
            className="text-xs font-bold text-slate-800 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-none snap-x snap-mandatory">
          {featuredStudios.map((studio) => (
            <div key={studio.id} className="snap-start shrink-0 w-[280px]">
              <StudioCard studio={studio} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Curated Filming Locations (Horizontal Carousel) */}
      <section className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
              RAW ARCHITECTURAL SPACES
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F5F5F5]">
              Vetted Filming Locations
            </h2>
          </div>
          <Link
            href="/locations"
            className="text-xs font-bold text-slate-800 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-none snap-x snap-mandatory">
          {featuredLocations.map((loc) => (
            <div key={loc.id} className="snap-start shrink-0 w-[280px]">
              <LocationCard location={loc} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Union Heads of Department Roster Spotlight */}
      <section className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
              CALL SHEET TALENT
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F5F5F5]">
              Union Heads of Department
            </h2>
          </div>
          <Link
            href="/crew"
            className="text-xs font-bold text-slate-800 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>Roster</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-none snap-x snap-mandatory">
          {featuredCrew.map((member) => (
            <div key={member.id} className="snap-start shrink-0 w-[280px]">
              <CrewCard member={member} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Turnkey Cinema Camera & Lighting Packages */}
      <section className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
              PRE-STAGED EQUIPMENT
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F5F5F5]">
              Cinema Cameras &amp; Grip Packages
            </h2>
          </div>
          <Link
            href="/equipment"
            className="text-xs font-bold text-slate-800 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>Gear</span>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-3 scrollbar-none snap-x snap-mandatory">
          {featuredGear.map((item) => (
            <div key={item.id} className="snap-start shrink-0 w-[280px]">
              <EquipmentCard equipment={item} />
            </div>
          ))}
        </div>
      </section>

      {/* 7. Direct Policy Guarantee & Host Entry Point */}
      <section className="px-4 space-y-4">
        {/* $2M Direct Liability Policy Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <ShieldPolicyIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
              $2,000,000 Direct Liability Policy Included
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-0.5 leading-snug">
              Every stage hold automatically includes verified commercial film insurance and facility damage endorsement.
            </p>
            <button
              type="button"
              onClick={onOpenPolicyModal}
              className="mt-2 text-[11px] font-bold text-emerald-900 dark:text-emerald-300 underline cursor-pointer"
            >
              View COI Endorsement Terms
            </button>
          </div>
        </div>

        {/* Host Enrollment Banner */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#303030] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8A8A8A]">
              STAGE OWNER &amp; VENDOR NETWORK
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F5F5]">
            List Your Studio Space or Filming Location
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#B3B3B3] leading-relaxed">
            Reach commercial production companies, ad agencies, and union directors looking for verified stages in New York.
          </p>

          <div className="flex items-center gap-2.5 pt-1">
            <Link
              href="/list-your-studio"
              className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold text-center shadow-xs active:scale-95 transition-all"
            >
              List Your Stage
            </Link>
            <button
              type="button"
              onClick={onOpenCalculator}
              className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-[#404040] text-slate-700 dark:text-[#F5F5F5] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#252525] transition-all cursor-pointer"
            >
              Earnings Calc
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
