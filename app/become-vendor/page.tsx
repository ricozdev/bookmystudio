'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  ShieldPolicyIcon,
  CheckCircleIcon,
  WarehouseIcon,
  CycloramaCategoryIcon,
  GearCrateIcon,
  StarIcon,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';

export default function BecomeVendorPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, becomeVendor, isVendor } = useAuth();

  const [selectedTypes, setSelectedTypes] = useState<('studio' | 'location' | 'crew' | 'equipment')[]>([
    'studio',
  ]);
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [prevUserId, setPrevUserId] = useState<string | null>(user?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    if (user.companyName) setCompanyName(user.companyName);
    if (user.phone) setPhone(user.phone);
    if (user.bio) setBio(user.bio);
  }

  useEffect(() => {
    if (!isLoading && !user && isConfigured) {
      router.push('/login?next=/become-vendor');
    }
  }, [user, isLoading, isConfigured, router]);

  const toggleType = (type: 'studio' | 'location' | 'crew' | 'equipment') => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? (prev.length > 1 ? prev.filter((t) => t !== type) : prev) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (selectedTypes.length === 0) {
      setErrorNotice('Please select at least one asset or service category you wish to list.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await becomeVendor({
        vendorTypes: selectedTypes,
        companyName: companyName.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
      });

      if (res.success) {
        setSuccessNotice('Host & vendor privileges activated successfully! Redirecting to create your listing...');
        setTimeout(() => {
          router.push('/list-your-studio');
        }, 1500);
      } else {
        setErrorNotice(res.error || 'Failed to activate vendor capabilities. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during onboarding.';
      setErrorNotice(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 bg-[var(--bg-page)] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Production Console', href: '/dashboard' },
            { label: 'Become a Vendor' },
          ]}
          className="mb-6"
        />

        {/* Page Hero */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-mono">
              STAGE HOST &amp; SUPPLIER ONBOARDING
            </span>
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            List Your Production Assets &amp; Services
          </h1>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Upgrade your account to list soundstages, film sets, cinema packages, or creative talent across India.
            Your existing client bookings, shortlists, and customer profile remain completely intact.
          </p>

          <div className="mt-6 flex items-center gap-3 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold">
              <ShieldPolicyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>$2,000,000 Primary Production Liability Protection</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Single Account: Rent &amp; List Seamlessly</span>
            </span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorNotice && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <span>{errorNotice}</span>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 font-bold px-2 py-1"
            >
              &times;
            </button>
          </div>
        )}

        {successNotice && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Already a Vendor Notice */}
        {isVendor && !successNotice && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold">You already have active vendor capabilities!</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                You can create a listing right away or update your business details below.
              </p>
            </div>
            <Link
              href="/list-your-studio"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold text-xs shrink-0 transition-colors"
            >
              Create Listing &rarr;
            </Link>
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          
          {/* Step 1: Asset Types Selection */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                STEP 1 OF 2
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                What would you like to list on BookMyStudio?
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Select all that apply. You can add more categories anytime from your dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Studio Stage */}
              <div
                onClick={() => toggleType('studio')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTypes.includes('studio')
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                    : 'bg-zinc-50 dark:bg-[#18181E] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CycloramaCategoryIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">Studio Stages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('studio')}
                    onChange={() => {}}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                  Soundstages, white cycloramas, daylight lofts, podcast studios, and prep kitchens.
                </p>
              </div>

              {/* Filming Location */}
              <div
                onClick={() => toggleType('location')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTypes.includes('location')
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                    : 'bg-zinc-50 dark:bg-[#18181E] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <WarehouseIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">Filming Locations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('location')}
                    onChange={() => {}}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                  Warehouses, industrial mills, rooftops, estates, commercial spaces, and outdoor acreage.
                </p>
              </div>

              {/* Cinema Equipment */}
              <div
                onClick={() => toggleType('equipment')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTypes.includes('equipment')
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                    : 'bg-zinc-50 dark:bg-[#18181E] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <GearCrateIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">Cinema Equipment</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('equipment')}
                    onChange={() => {}}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                  ARRI/RED cameras, Cine prime sets, motorized gimbals, LED lighting packages, and grip trucks.
                </p>
              </div>

              {/* Crew Services */}
              <div
                onClick={() => toggleType('crew')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTypes.includes('crew')
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                    : 'bg-zinc-50 dark:bg-[#18181E] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <StarIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">Crew &amp; Dept Heads</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('crew')}
                    onChange={() => {}}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                  Directors of Photography, Gaffers, Key Grips, Sound Recordists, and Production Designers.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Business & Contact Details */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                STEP 2 OF 2
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                Host / Vendor Profile
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Provide your commercial company details. These will appear on your verified vendor badge.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Company / Facility Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Motion Soundstages LLC"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Booking Dispatch Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Professional Bio or Facility Overview
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell filmmakers about your stage facilities, equipment inventory, or commercial production background..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submission Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              By activating, you agree to BookMyStudio Host Terms and platform production standards.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isSubmitting ? 'Activating Host Account...' : 'Activate Vendor Account & Continue →'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
