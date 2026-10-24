'use client';

import React, { useState, useMemo } from 'react';
import { CrewCard } from './CrewCard';
import { ProductionCrewMember } from '@/lib/types';
import { ScrollReveal } from '@/components/common/ScrollReveal';

interface CrewSectionProps {
  crewMembers: ProductionCrewMember[];
  selectedCrewIds: string[];
  onToggleCrewMember: (member: ProductionCrewMember) => void;
}

export function CrewSection({
  crewMembers,
  selectedCrewIds,
  onToggleCrewMember,
}: CrewSectionProps) {
  const [crewFilterTab, setCrewFilterTab] = useState<'all' | 'grip_sound' | 'kits_included'>('all');

  const filteredCrew = useMemo(() => {
    return crewMembers.filter((m) => {
      if (crewFilterTab === 'grip_sound') {
        return m.category === 'grip_sound';
      }
      if (crewFilterTab === 'kits_included') {
        return m.standardKitIncluded;
      }
      return true;
    });
  }, [crewMembers, crewFilterTab]);

  return (
    <section id="crew" className="py-14 sm:py-16 bg-white dark:bg-[#101010] border-t border-slate-100 dark:border-[#202020] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-[#202020]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#8A8A8A]">
                  CALL SHEET ROSTER
                </span>
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
                Hire Verified Heads of Department &amp; Gear Packages
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-[#B3B3B3] max-w-2xl leading-relaxed">
                Insured Union (IATSE Local 52/600) and vetted freelance department heads equipped with standard working packages.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100/90 dark:bg-[#181818] p-1 rounded-xl shrink-0 self-start md:self-auto border border-transparent dark:border-[#303030]">
              <button
                type="button"
                onClick={() => setCrewFilterTab(crewFilterTab === 'grip_sound' ? 'all' : 'grip_sound')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  crewFilterTab === 'grip_sound'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#B3B3B3] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
                }`}
              >
                Grip &amp; Sound Roles
              </button>

              <button
                type="button"
                onClick={() => setCrewFilterTab(crewFilterTab === 'kits_included' ? 'all' : 'kits_included')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  crewFilterTab === 'kits_included'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#B3B3B3] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
                }`}
              >
                Standard Kits Included
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 4-Column Crew Grid with Staggered Scroll Reveals */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredCrew.map((member, index) => (
            <ScrollReveal key={member.id} delay={index * 60}>
              <CrewCard
                member={member}
                isAdded={selectedCrewIds.includes(member.id)}
                onToggleAdd={onToggleCrewMember}
              />
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
