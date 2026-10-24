'use client';

import React from 'react';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProductionCategoryNav } from '@/components/landing/ProductionCategoryNav';
import { HomeLocationDiscovery } from '@/components/home/HomeLocationDiscovery';
import { ProductionProblemSection } from '@/components/landing/ProductionProblemSection';
import { ProductionWorkflowsSection } from '@/components/landing/ProductionWorkflowsSection';
import { HowItWorksSteps } from '@/components/landing/HowItWorksSteps';
import { ValuePropsSection } from '@/components/landing/ValuePropsSection';
import { TwoSidedMarketplaceSection } from '@/components/landing/TwoSidedMarketplaceSection';
import { TechnicalClaritySection } from '@/components/landing/TechnicalClaritySection';
import { LandingFinalCta } from '@/components/landing/LandingFinalCta';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <main className="flex-1">
        
        {/* 1. Value-First Hero: Every Production. One Connected Place. */}
        <LandingHero />

        {/* 2. Concise Category Navigation Section: Studios, Locations, Crew, Equipment */}
        <ProductionCategoryNav />

        {/* 3. Location-Aware Discovery Showcase: Studios, Locations, Crew, Equipment Near User */}
        <HomeLocationDiscovery />

        {/* 4. The Problem: Coordinating Production Resources Shouldn't Require 20 Disconnected Tabs */}
        <ProductionProblemSection />

        {/* 5. Production Workflows: Real Production Categories (Film, Fashion, Commercial, Tabletop) */}
        <ProductionWorkflowsSection />

        {/* 6. How BookMyStudio Works: 4-Step Production Process */}
        <HowItWorksSteps />

        {/* 7. Why BookMyStudio: Practical Value Propositions */}
        <ValuePropsSection />

        {/* 8. Built for Both Sides: For Producers & Stage Operators */}
        <TwoSidedMarketplaceSection />

        {/* 9. Technical Clarity: Verified Realities on Set */}
        <TechnicalClaritySection />

        {/* 10. Final Call to Action: Your Next Production Starts Here */}
        <LandingFinalCta />

      </main>
    </div>
  );
}
