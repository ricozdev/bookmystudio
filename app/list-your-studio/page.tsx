'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  ShieldPolicyIcon,
  CheckCircleIcon,
  WarehouseIcon,
  CycloramaCategoryIcon,
  GearCrateIcon,
  LocationPinIcon,
  StarIcon,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi, ListingType } from '@/lib/api/marketplace';
import { ListingLocationFormSection, ListingLocationData } from '@/components/location/ListingLocationFormSection';
import { PhoneVerificationModal } from '@/components/auth/PhoneVerificationModal';

export default function ListYourStudioPage() {
  const { user, refreshUser, isVendor } = useAuth();

  // Active Category Type
  const [listingType, setListingType] = useState<ListingType>('studio');
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    success: boolean;
    type: ListingType;
    title: string;
    reviewStatus: string;
    publicationStatus?: string;
    slug?: string;
    id: string;
  } | null>(null);

  // --- STUDIO FORM STATE ---
  const [studioName, setStudioName] = useState('');
  const [studioCategory, setStudioCategory] = useState<'cyclorama' | 'soundstage' | 'daylight' | 'podcast' | 'kitchen' | 'industrial'>('cyclorama');
  const [studioLocationData, setStudioLocationData] = useState<ListingLocationData>({
    locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
    locationAddress: {
      formatted: 'Plot 42, Off New Link Road, Andheri West, Mumbai, Maharashtra - 400053',
      building: 'CineSpace Soundstages, Stage 2',
      street: 'Off New Link Road',
      locality: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      country: 'India',
      accuracy: 'rooftop',
      isExactAddressPublic: true,
      mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
    },
    mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
    location: 'Andheri West, Mumbai',
    submarket: 'Andheri West',
  });
  const [studioSqFt, setStudioSqFt] = useState('3200');
  const [studioGridHeight, setStudioGridHeight] = useState('18 ft');
  const [studioPower, setStudioPower] = useState('600A 3-Phase Camlock');
  const [studioAccess, setStudioAccess] = useState('Ground Floor Drive-In Gate (14ft)');
  const [studioDayRate, setStudioDayRate] = useState('1400');
  const [studioHourlyRate, setStudioHourlyRate] = useState('160');
  const [studioDesc, setStudioDesc] = useState('');
  const [studioAmenities, setStudioAmenities] = useState('HMU Stations, Production Office, Client Lounge, High-Speed Fiber');
  const [studioImageUrl, setStudioImageUrl] = useState('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop');
  const [studioEquipmentHighlight, setStudioEquipmentHighlight] = useState('Pre-rigged 400A Camlock distro with motorized truss grid');
  const [studioCamlock, setStudioCamlock] = useState(true);
  const [studioDriveIn, setStudioDriveIn] = useState(true);
  const [studioStc60, setStudioStc60] = useState(true);
  const [studioNorthDaylight, setStudioNorthDaylight] = useState(false);
  const [studioGripIncluded, setStudioGripIncluded] = useState(true);

  // --- FILMING LOCATION FORM STATE ---
  const [locName, setLocName] = useState('');
  const [locCategory, setLocCategory] = useState<'industrial' | 'loft' | 'warehouse' | 'rooftop' | 'commercial' | 'outdoor'>('warehouse');
  const [locLocationData, setLocLocationData] = useState<ListingLocationData>({
    locationGeo: { type: 'Point', coordinates: [72.8872, 19.1601] },
    locationAddress: {
      formatted: 'Dadasaheb Phalke Chitranagari, Film City, Goregaon East, Mumbai, Maharashtra - 400065',
      building: 'Warehouse Set 5',
      street: 'Film City Road',
      locality: 'Goregaon East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400065',
      country: 'India',
      accuracy: 'street',
      isExactAddressPublic: true,
      mapUrl: 'https://maps.google.com/?q=19.1601,72.8872',
    },
    mapUrl: 'https://maps.google.com/?q=19.1601,72.8872',
    location: 'Film City, Goregaon East, Mumbai',
    submarket: 'Goregaon East',
  });
  const [locAreaSqFt, setLocAreaSqFt] = useState('6500');
  const [locCeilingHeight, setLocCeilingHeight] = useState('22 ft');
  const [locPowerSupply, setLocPowerSupply] = useState('400A 3-Phase 120/208V Direct Distribution');
  const [locVehicleAccess, setLocVehicleAccess] = useState('Loading Dock with Freight Elevator (8,000 lbs)');
  const [locCurfew, setLocCurfew] = useState('24/7 Overnight Filming Permitted');
  const [locPermits, setLocPermits] = useState('Standard Film Production Permit Required');
  const [locDayRate, setLocDayRate] = useState('2200');
  const [locHourlyRate, setLocHourlyRate] = useState('250');
  const [locDesc, setLocDesc] = useState('');
  const [locAmenities, setLocAmenities] = useState('Basecamp Parking, Freight Elevator, 3-Phase Camlock, Restrooms');
  const [locImageUrl, setLocImageUrl] = useState('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop');

  // --- CREW / PROFESSIONAL FORM STATE ---
  const [crewName, setCrewName] = useState('');
  const [crewRole, setCrewRole] = useState('Director of Photography');
  const [crewCategory, setCrewCategory] = useState<'camera_lighting' | 'grip_sound' | 'styling_art' | 'post_production' | 'production'>('camera_lighting');
  const [crewLocationData, setCrewLocationData] = useState<ListingLocationData>({
    locationGeo: { type: 'Point', coordinates: [72.8335, 19.0596] },
    locationAddress: {
      formatted: 'Bandra West, Mumbai, Maharashtra',
      locality: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India',
      accuracy: 'locality',
      isExactAddressPublic: false,
    },
    location: 'Bandra West, Mumbai (Local Hire)',
    serviceRadiusKm: 50,
  });
  const [crewDayRate, setCrewDayRate] = useState('1500');
  const [crewCredits, setCrewCredits] = useState('Commercial Campaign, Global Feature, OTT Docuseries');
  const [crewBio, setCrewBio] = useState('');
  const [crewSkills, setCrewSkills] = useState('ARRI Alexa 35, Anamorphic Lensing, Motion Control, Gaffer Sync');
  const [crewWorkingKit, setCrewWorkingKit] = useState('SmallHD Cine 7 Monitor, Teradek Bolt 4K 750, Sekonic C-800');
  const [crewNextAvailable, setCrewNextAvailable] = useState('Immediate / Next Week');
  const [crewUnion, setCrewUnion] = useState('WICA / CCWA (Union / Commercial Roster)');
  const [crewStandardKitIncluded, setCrewStandardKitIncluded] = useState(true);
  const [crewImageUrl, setCrewImageUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop');

  // --- EQUIPMENT FORM STATE ---
  const [equipName, setEquipName] = useState('');
  const [equipBrand, setEquipBrand] = useState('ARRI');
  const [equipCategory, setEquipCategory] = useState<'cameras' | 'lighting' | 'grip' | 'audio' | 'monitoring' | 'packages'>('cameras');
  const [equipLocationData, setEquipLocationData] = useState<ListingLocationData>({
    locationGeo: { type: 'Point', coordinates: [72.8277, 19.1363] },
    locationAddress: {
      formatted: 'GearHub Vault, Andheri West, Mumbai, Maharashtra - 400053',
      building: 'GearHub Vault 3',
      street: 'Veera Desai Industrial Estate',
      locality: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      country: 'India',
      accuracy: 'street',
      isExactAddressPublic: true,
      mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
    },
    mapUrl: 'https://maps.google.com/?q=19.1363,72.8277',
    location: 'Andheri West, Mumbai',
    pickupLocation: 'GearHub Vault 3, Veera Desai Industrial Estate, Andheri West, Mumbai',
    deliveryCoverageKm: 35,
  });
  const [equipDayRate, setEquipDayRate] = useState('1250');
  const [equipWeeklyRate, setEquipWeeklyRate] = useState('3750');
  const [equipReplacementValue, setEquipReplacementValue] = useState('78000');
  const [equipPowerReq, setEquipPowerReq] = useState('B-Mount 24V Native / AC Power Supply');
  const [equipMountType, setEquipMountType] = useState('LPL Mount with PL Adapter');
  const [equipKeySpecs, setEquipKeySpecs] = useState('4.6K Super 35 Sensor, 17 Stops Dynamic Range, REVEAL Color Science');
  const [equipIncludedAccessories, setEquipIncludedAccessories] = useState('Production Handle, EVF, 2x 2TB Codex Cards, Compact Bridge Plate');
  const [equipDesc, setEquipDesc] = useState('');
  const [equipImageUrl, setEquipImageUrl] = useState('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop');

  // Handle Form Submission
  const handleSubmitListing = async (isDraft: boolean) => {
    setErrorNotice(null);

    if (!user) {
      setErrorNotice('Please sign in or create an account to publish or save listings.');
      return;
    }

    setIsSubmitting(true);
    try {
      let payload: Record<string, unknown> = {};

      if (listingType === 'studio') {
        if (!studioName.trim() || studioName.length < 2) {
          throw new Error('Please enter a valid studio space name.');
        }
        if (!studioDesc.trim() || studioDesc.length < 10) {
          throw new Error('Please enter a description of at least 10 characters.');
        }

        payload = {
          name: studioName.trim(),
          category: studioCategory,
          categoryLabel: studioCategory === 'cyclorama' ? 'White Cyclorama & Soundstage' : studioCategory.charAt(0).toUpperCase() + studioCategory.slice(1),
          location: studioLocationData.location || studioLocationData.locationAddress?.formatted || '',
          submarket: studioLocationData.submarket || studioLocationData.locationAddress?.locality || '',
          locationGeo: studioLocationData.locationGeo,
          locationAddress: studioLocationData.locationAddress,
          mapUrl: studioLocationData.mapUrl || studioLocationData.locationAddress?.mapUrl || null,
          description: studioDesc.trim(),
          specs: {
            sqFt: Number(studioSqFt) || 3000,
            gridHeight: studioGridHeight.trim(),
            power: studioPower.trim(),
            access: studioAccess.trim(),
          },
          amenities: studioAmenities.split(',').map((s) => s.trim()).filter(Boolean),
          equipmentHighlight: studioEquipmentHighlight.trim(),
          hourlyRate: Number(studioHourlyRate) || 150,
          dayRate10h: Number(studioDayRate) || 1400,
          imageUrl: studioImageUrl.trim(),
          features: {
            camlockPower: studioCamlock,
            driveInAccess: studioDriveIn,
            stc60Certified: studioStc60,
            northDaylight: studioNorthDaylight,
            gripPackageIncluded: studioGripIncluded,
          },
          isDraft,
        };
      } else if (listingType === 'location') {
        if (!locName.trim() || locName.length < 2) {
          throw new Error('Please enter a valid location title.');
        }
        if (!locDesc.trim() || locDesc.length < 10) {
          throw new Error('Please enter a description of at least 10 characters.');
        }

        payload = {
          name: locName.trim(),
          category: locCategory,
          categoryLabel: locCategory.charAt(0).toUpperCase() + locCategory.slice(1) + ' Filming Location',
          location: locLocationData.location || locLocationData.locationAddress?.formatted || '',
          submarket: locLocationData.submarket || locLocationData.locationAddress?.locality || '',
          locationGeo: locLocationData.locationGeo,
          locationAddress: locLocationData.locationAddress,
          mapUrl: locLocationData.mapUrl || locLocationData.locationAddress?.mapUrl || null,
          description: locDesc.trim(),
          areaSqFt: Number(locAreaSqFt) || 5000,
          ceilingHeight: locCeilingHeight.trim(),
          powerSupply: locPowerSupply.trim(),
          vehicleAccess: locVehicleAccess.trim(),
          curfewRestrictions: locCurfew.trim(),
          permitsRequired: locPermits.trim(),
          amenities: locAmenities.split(',').map((s) => s.trim()).filter(Boolean),
          dayRate10h: Number(locDayRate) || 2000,
          hourlyRate: Number(locHourlyRate) || 250,
          imageUrl: locImageUrl.trim(),
          isDraft,
        };
      } else if (listingType === 'crew') {
        if (!crewName.trim() || crewName.length < 2) {
          throw new Error('Please enter your professional name.');
        }
        if (!crewBio.trim() || crewBio.length < 10) {
          throw new Error('Please provide a short professional bio of at least 10 characters.');
        }

        payload = {
          name: crewName.trim(),
          role: crewRole.trim(),
          category: crewCategory,
          location: crewLocationData.location || crewLocationData.locationAddress?.formatted || '',
          locationGeo: crewLocationData.locationGeo,
          locationAddress: crewLocationData.locationAddress,
          serviceRadiusKm: crewLocationData.serviceRadiusKm || 50,
          credits: crewCredits.trim(),
          bio: crewBio.trim(),
          skills: crewSkills.split(',').map((s) => s.trim()).filter(Boolean),
          workingKit: crewWorkingKit.trim(),
          dayRate10h: Number(crewDayRate) || 1200,
          nextAvailable: crewNextAvailable.trim(),
          imageUrl: crewImageUrl.trim(),
          unionAffiliation: crewUnion.trim(),
          standardKitIncluded: crewStandardKitIncluded,
          isDraft,
        };
      } else if (listingType === 'equipment') {
        if (!equipName.trim() || equipName.length < 2) {
          throw new Error('Please enter the equipment item or kit name.');
        }
        if (!equipDesc.trim() || equipDesc.length < 10) {
          throw new Error('Please provide an equipment summary of at least 10 characters.');
        }

        payload = {
          name: equipName.trim(),
          category: equipCategory,
          categoryLabel: equipCategory.toUpperCase(),
          brand: equipBrand.trim(),
          location: equipLocationData.location || equipLocationData.locationAddress?.formatted || '',
          pickupLocation: equipLocationData.pickupLocation || equipLocationData.location || '',
          deliveryCoverageKm: equipLocationData.deliveryCoverageKm ?? 30,
          locationGeo: equipLocationData.locationGeo,
          locationAddress: equipLocationData.locationAddress,
          mapUrl: equipLocationData.mapUrl || equipLocationData.locationAddress?.mapUrl || null,
          dayRate: Number(equipDayRate) || 500,
          weeklyRate: Number(equipWeeklyRate) || 1500,
          replacementValue: Number(equipReplacementValue) || 20000,
          description: equipDesc.trim(),
          keySpecs: equipKeySpecs.split(',').map((s) => s.trim()).filter(Boolean),
          includedAccessories: equipIncludedAccessories.split(',').map((s) => s.trim()).filter(Boolean),
          powerRequirement: equipPowerReq.trim(),
          mountType: equipMountType.trim(),
          imageUrl: equipImageUrl.trim(),
          isDraft,
        };
      }

      const res = await marketplaceApi.createListing(listingType, payload);

      if (res.success && res.data) {
        const d = res.data;
        const titleStr = typeof d.name === 'string' ? d.name : typeof d.brand === 'string' ? `${d.brand} ${String(d.name || '')}` : 'Listing';
        const pubStatusStr = String(d.publicationStatus || (isDraft ? 'draft' : 'published'));
        const statusStr = typeof d.reviewStatus === 'string' ? d.reviewStatus : isDraft ? 'DRAFT' : 'APPROVED';
        const idStr = String(d._id || d.id || '');
        const slugStr = typeof d.slug === 'string' ? d.slug : '';

        setSubmittedData({
          success: true,
          type: listingType,
          title: titleStr,
          reviewStatus: statusStr,
          publicationStatus: pubStatusStr,
          slug: slugStr,
          id: idStr,
        });

        // Ensure AuthContext is immediately synchronized with updated vendor roles
        try {
          await refreshUser();
        } catch {
          // Non-blocking
        }
      } else {
        throw new Error(res.message || 'Failed to submit listing. Please verify required fields.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during listing submission.';
      setErrorNotice(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 bg-[var(--bg-page)] min-h-[calc(100vh-140px)] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Host & Supplier Network', href: '/dashboard' },
            { label: 'Create New Listing' },
          ]}
          className="mb-6"
        />

        {/* Hero Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-mono">
              CURATED PRODUCTION MARKETPLACE
            </span>
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            List Your Production Assets &amp; Services
          </h1>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Submit your commercial soundstages, filming locations, cinema equipment packages, or professional crew profile for verified listing on BookMyStudio.
          </p>

          <div className="mt-4 flex items-center gap-3 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-semibold">
              <ShieldPolicyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>$2,000,000 Primary Production Liability Protection</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              <span>Automated ACH Direct Deposits</span>
            </span>
          </div>
        </div>

        {/* Customer Auto-Upgrade Notice */}
        {user && !isVendor && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="font-bold">Seamless Vendor Upgrade</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">
                  Publishing this listing will automatically grant you Stage Host / Supplier capabilities. All your existing bookings, customer profile, and saved shortlists remain preserved.
                </p>
              </div>
            </div>
            <Link
              href="/become-vendor"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold text-xs whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              Set Company Details &rarr;
            </Link>
          </div>
        )}

        {/* Listing Type Selector Tabs */}
        <div className="mt-10 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Select Listing Type
              </span>
              <div className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setListingType('studio');
                    setSubmittedData(null);
                  }}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
                    listingType === 'studio'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                      : 'bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <CycloramaCategoryIcon className="w-4 h-4" />
                  <span>Studio Space</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setListingType('location');
                    setSubmittedData(null);
                  }}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
                    listingType === 'location'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                      : 'bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <WarehouseIcon className="w-4 h-4" />
                  <span>Filming Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setListingType('crew');
                    setSubmittedData(null);
                  }}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
                    listingType === 'crew'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                      : 'bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <StarIcon className="w-4 h-4" />
                  <span>Crew &amp; Dept Heads</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setListingType('equipment');
                    setSubmittedData(null);
                  }}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
                    listingType === 'equipment'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                      : 'bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <GearCrateIcon className="w-4 h-4" />
                  <span>Cinema Equipment</span>
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Form vs Live Preview */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#121216] p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'form' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Specifications Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Live Catalog Preview
              </button>
            </div>
          </div>
        </div>

        {/* Phone Verification Notice Banner */}
        {user && !user.isPhoneVerified && !submittedData && (
          <div className="mt-6 p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                <strong>Phone Verification Required for Live Publishing:</strong> You can draft your listing at any time, but SMS phone verification is required before publishing live to the marketplace directory.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              Verify Phone Now
            </button>
          </div>
        )}

        {/* Global Error Notice */}
        {errorNotice && (
          <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <span>{errorNotice}</span>
            <div className="flex items-center gap-2">
              {(errorNotice.includes('phone') || errorNotice.includes('Phone')) && (
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] cursor-pointer"
                >
                  Verify Phone
                </button>
              )}
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="text-red-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Successful Submission Screen */}
        {submittedData ? (
          <div className="mt-8 max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircleIcon className="w-8 h-8" />
            </div>

            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase font-bold tracking-wider mb-2 ${
                submittedData.publicationStatus === 'draft'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                  : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
              }`}>
                Status: {submittedData.publicationStatus === 'draft' ? 'DRAFT' : 'PUBLISHED & LIVE'}
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {submittedData.publicationStatus === 'draft'
                  ? 'Listing Saved as Draft'
                  : 'Listing Published Immediately!'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your listing for <strong className="text-zinc-900 dark:text-white">{submittedData.title}</strong> has been saved to the database.
                {submittedData.publicationStatus === 'draft'
                  ? ' You can edit and publish this draft whenever you are ready.'
                  : ' It is now live and immediately discoverable in the BookMyStudio public directory.'}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
              {submittedData.publicationStatus !== 'draft' && submittedData.slug && (
                <Link
                  href={
                    submittedData.type === 'studio'
                      ? `/studios/${submittedData.slug}`
                      : submittedData.type === 'location'
                      ? `/locations/${submittedData.slug}`
                      : submittedData.type === 'crew'
                      ? `/crew/${submittedData.slug}`
                      : `/equipment/${submittedData.slug}`
                  }
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-extrabold transition-all shadow-md"
                >
                  View Live Listing →
                </Link>
              )}
              <Link
                href="/dashboard?tab=listings"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Track in My Listings →
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedData(null)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Create Another Listing
              </button>
            </div>
          </div>
        ) : activeTab === 'preview' ? (
          /* LIVE PREVIEW CONTAINER */
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  Card Preview in Public Directory
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80 font-mono">Instant Live Directory Preview</span>
              </div>

              {/* STUDIO CARD PREVIEW */}
              {listingType === 'studio' && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] overflow-hidden shadow-lg">
                  <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={studioImageUrl}
                      alt={studioName || 'Studio preview'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-400 border border-zinc-800 uppercase font-mono">
                      {studioCategory.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {studioName || 'Untitled Commercial Stage'}
                      </h3>
                      <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        ${studioDayRate} / 10h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <LocationPinIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{studioLocationData.location || 'Location Pending'}</span>
                      <span>·</span>
                      <span>{studioSqFt} sq ft</span>
                      <span>·</span>
                      <span>{studioGridHeight} Grid</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {studioDesc || 'Commercial cyclorama space equipped for major motion and still campaigns.'}
                    </p>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{studioPower}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Instant Hold Ready</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LOCATION CARD PREVIEW */}
              {listingType === 'location' && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] overflow-hidden shadow-lg">
                  <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={locImageUrl}
                      alt={locName || 'Location preview'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-400 border border-zinc-800 uppercase font-mono">
                      FILMING LOCATION
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {locName || 'Industrial Sound Stage & Location'}
                      </h3>
                      <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        ${locDayRate} / 10h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <LocationPinIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{locLocationData.location || 'Location Pending'}</span>
                      <span>·</span>
                      <span>{locAreaSqFt} sq ft</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {locDesc || 'Production-ready commercial location featuring natural architectural textures.'}
                    </p>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="text-[11px]">{locCurfew}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Permit Friendly</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CREW CARD PREVIEW */}
              {listingType === 'crew' && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                      <Image
                        src={crewImageUrl}
                        alt={crewName || 'Crew preview'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {crewUnion}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                        {crewName || 'Department Head'}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{crewRole} · {crewLocationData.location || 'Location Pending'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {crewBio || 'Experienced department lead with credits across national commercial campaigns.'}
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Recent Verified Credits</span>
                    <span className="text-zinc-800 dark:text-zinc-200">{crewCredits}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">${crewDayRate} / 10h Commercial</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">{crewNextAvailable}</span>
                  </div>
                </div>
              )}

              {/* EQUIPMENT CARD PREVIEW */}
              {listingType === 'equipment' && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181E] overflow-hidden shadow-lg">
                  <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={equipImageUrl}
                      alt={equipName || 'Gear preview'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-400 border border-zinc-800 uppercase font-mono">
                      {equipBrand} · {equipCategory.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {equipBrand} {equipName || 'Cinema Camera Package'}
                      </h3>
                      <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        ${equipDayRate} / day
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {equipDesc || 'Complete turnkey cinema kit with factory flight case and certified power accessories.'}
                    </p>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-mono text-[11px]">${equipWeeklyRate} / 3-Day Week</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">COI Value: ${Number(equipReplacementValue).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <LocationPinIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{equipLocationData.location || 'Location Pending'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-semibold"
                >
                  ← Return to Form to Continue Editing
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SPECIFICATIONS FORM CONTAINER */
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="p-6 sm:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] shadow-xl space-y-8">
              
              {/* Type Title Header */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                  {listingType === 'studio' && 'STUDIO SPECIFICATION PROFILE'}
                  {listingType === 'location' && 'FILMING LOCATION MANIFEST'}
                  {listingType === 'crew' && 'CREW CALLSHEET ROSTER PROFILE'}
                  {listingType === 'equipment' && 'CINEMA GEAR & RENTAL KIT MANIFEST'}
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {listingType === 'studio' && 'List Commercial Studio Space'}
                  {listingType === 'location' && 'Register Filming Location'}
                  {listingType === 'crew' && 'Create Crew & Department Head Profile'}
                  {listingType === 'equipment' && 'List Cinema Equipment Package'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  {listingType === 'studio' && 'Our facility team will inspect 3-phase camlock, acoustic ratings, and floor plans.'}
                  {listingType === 'location' && 'Detail logistics, ceiling clearance, vehicular loading docks, and permit guidelines.'}
                  {listingType === 'crew' && 'Highlight verified commercial credits, standard day rates, and camera/grip kit packages.'}
                  {listingType === 'equipment' && 'Provide replacement valuation, mount compatibility, and factory accessories.'}
                </p>
              </div>

              {/* --- TYPE 1: STUDIO FORM --- */}
              {listingType === 'studio' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Stage Name / Facility Title *
                      </label>
                      <input
                        type="text"
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        placeholder="e.g. Apex Stage C & Soundstage"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Primary Space Category *
                      </label>
                      <select
                        value={studioCategory}
                        onChange={(e) =>
                          setStudioCategory(
                            e.target.value as
                              | 'cyclorama'
                              | 'soundstage'
                              | 'daylight'
                              | 'podcast'
                              | 'kitchen'
                              | 'industrial'
                          )
                        }
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="cyclorama">White Cyclorama Stage</option>
                        <option value="soundstage">Acoustically Rated Soundstage</option>
                        <option value="daylight">Natural Daylight Loft</option>
                        <option value="podcast">Broadcast / Podcast Suite</option>
                        <option value="kitchen">Commercial Culinary Kitchen</option>
                        <option value="industrial">Raw Industrial Stage</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <ListingLocationFormSection
                        type="studio"
                        value={studioLocationData}
                        onChange={setStudioLocationData}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Total Square Footage (sq ft) *
                      </label>
                      <input
                        type="number"
                        value={studioSqFt}
                        onChange={(e) => setStudioSqFt(e.target.value)}
                        placeholder="3200"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Ceiling Clearance (Clear to Grid) *
                      </label>
                      <input
                        type="text"
                        value={studioGridHeight}
                        onChange={(e) => setStudioGridHeight(e.target.value)}
                        placeholder="18 ft"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Camlock Power Capacity *
                      </label>
                      <input
                        type="text"
                        value={studioPower}
                        onChange={(e) => setStudioPower(e.target.value)}
                        placeholder="600A 3-Phase Camlock"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Vehicular / Load-in Access *
                      </label>
                      <input
                        type="text"
                        value={studioAccess}
                        onChange={(e) => setStudioAccess(e.target.value)}
                        placeholder="Ground Floor 14ft Roll-up Gate"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        10-Hour Commercial Day Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={studioDayRate}
                        onChange={(e) => setStudioDayRate(e.target.value)}
                        placeholder="1400"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Overtime / Hourly Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={studioHourlyRate}
                        onChange={(e) => setStudioHourlyRate(e.target.value)}
                        placeholder="160"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Primary High-Resolution Image URL *
                      </label>
                      <input
                        type="url"
                        value={studioImageUrl}
                        onChange={(e) => setStudioImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Detailed Description &amp; Production Accommodations *
                      </label>
                      <textarea
                        rows={4}
                        value={studioDesc}
                        onChange={(e) => setStudioDesc(e.target.value)}
                        placeholder="Describe your studio space, acoustics, hair/makeup suites, power distros, and typical commercial workflows..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Amenities &amp; Facility Features (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={studioAmenities}
                        onChange={(e) => setStudioAmenities(e.target.value)}
                        placeholder="HMU Stations, High-Speed Fiber, Client Lounge, Kitchen"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Equipment &amp; Distro Highlight
                      </label>
                      <input
                        type="text"
                        value={studioEquipmentHighlight}
                        onChange={(e) => setStudioEquipmentHighlight(e.target.value)}
                        placeholder="e.g. Pre-rigged 400A Camlock distro with motorized truss grid"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-3">
                      Verified Technical Capabilities
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={studioCamlock}
                          onChange={(e) => setStudioCamlock(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>3-Phase Camlock Heavy Power Available</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={studioDriveIn}
                          onChange={(e) => setStudioDriveIn(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Drive-In Vehicle / Direct Roll-up Access</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={studioStc60}
                          onChange={(e) => setStudioStc60(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>STC 60+ Certified Soundproof Acoustic Stage</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={studioNorthDaylight}
                          onChange={(e) => setStudioNorthDaylight(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>North-Facing Natural Daylight Loft Exposure</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={studioGripIncluded}
                          onChange={(e) => setStudioGripIncluded(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Standard 5-Ton Grip Package Included in Rate</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TYPE 2: FILMING LOCATION FORM --- */}
              {listingType === 'location' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Location Name / Architectural Manifest *
                      </label>
                      <input
                        type="text"
                        value={locName}
                        onChange={(e) => setLocName(e.target.value)}
                        placeholder="e.g. The Greenpoint Industrial Brick Loft & Rooftop"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Location Style Category *
                      </label>
                      <select
                        value={locCategory}
                        onChange={(e) =>
                          setLocCategory(
                            e.target.value as
                              | 'industrial'
                              | 'loft'
                              | 'warehouse'
                              | 'rooftop'
                              | 'commercial'
                              | 'outdoor'
                          )
                        }
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="warehouse">Industrial Warehouse</option>
                        <option value="loft">Historic Commercial Loft</option>
                        <option value="industrial">Raw Industrial Yard</option>
                        <option value="rooftop">Panoramic Rooftop View</option>
                        <option value="commercial">Modern Commercial Office</option>
                        <option value="outdoor">Private Outdoor Lot</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <ListingLocationFormSection
                        type="location"
                        value={locLocationData}
                        onChange={setLocLocationData}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Usable Filming Area (sq ft) *
                      </label>
                      <input
                        type="number"
                        value={locAreaSqFt}
                        onChange={(e) => setLocAreaSqFt(e.target.value)}
                        placeholder="6500"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Ceiling Height *
                      </label>
                      <input
                        type="text"
                        value={locCeilingHeight}
                        onChange={(e) => setLocCeilingHeight(e.target.value)}
                        placeholder="22 ft"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        10-Hour Commercial Day Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={locDayRate}
                        onChange={(e) => setLocDayRate(e.target.value)}
                        placeholder="2200"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Hourly / Overtime Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={locHourlyRate}
                        onChange={(e) => setLocHourlyRate(e.target.value)}
                        placeholder="250"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Permit Requirements *
                      </label>
                      <input
                        type="text"
                        value={locPermits}
                        onChange={(e) => setLocPermits(e.target.value)}
                        placeholder="NYC MOFTB Standard Permit"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Curfew &amp; Overnight Sound Rules *
                      </label>
                      <input
                        type="text"
                        value={locCurfew}
                        onChange={(e) => setLocCurfew(e.target.value)}
                        placeholder="e.g. 24/7 Overnight Filming Permitted"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Power Capacity &amp; Distro *
                      </label>
                      <input
                        type="text"
                        value={locPowerSupply}
                        onChange={(e) => setLocPowerSupply(e.target.value)}
                        placeholder="e.g. 400A 3-Phase Camlock"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Vehicular / Loading Access *
                      </label>
                      <input
                        type="text"
                        value={locVehicleAccess}
                        onChange={(e) => setLocVehicleAccess(e.target.value)}
                        placeholder="e.g. Loading Dock with Freight Elevator"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Amenities &amp; Logistics (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={locAmenities}
                        onChange={(e) => setLocAmenities(e.target.value)}
                        placeholder="Basecamp Parking, Freight Elevator, 3-Phase Camlock, Restrooms"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Primary Hero Image URL *
                      </label>
                      <input
                        type="url"
                        value={locImageUrl}
                        onChange={(e) => setLocImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Location Overview &amp; Curfew Conditions *
                      </label>
                      <textarea
                        rows={4}
                        value={locDesc}
                        onChange={(e) => setLocDesc(e.target.value)}
                        placeholder="Describe the architectural visual character, natural light conditions, freight loading details, and sound environment..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- TYPE 3: CREW PROFILE FORM --- */}
              {listingType === 'crew' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Full Name / Professional Alias *
                      </label>
                      <input
                        type="text"
                        value={crewName}
                        onChange={(e) => setCrewName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Role / Designation *
                      </label>
                      <input
                        type="text"
                        value={crewRole}
                        onChange={(e) => setCrewRole(e.target.value)}
                        placeholder="e.g. Director of Photography"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Department Category *
                      </label>
                      <select
                        value={crewCategory}
                        onChange={(e) =>
                          setCrewCategory(
                            e.target.value as
                              | 'camera_lighting'
                              | 'grip_sound'
                              | 'styling_art'
                              | 'post_production'
                              | 'production'
                          )
                        }
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="camera_lighting">Camera &amp; Lighting</option>
                        <option value="grip_sound">Grip &amp; Production Sound</option>
                        <option value="styling_art">Art Direction &amp; Wardrobe</option>
                        <option value="post_production">Post-Production &amp; DIT</option>
                        <option value="production">Line Producing &amp; Logistics</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <ListingLocationFormSection
                        type="crew"
                        value={crewLocationData}
                        onChange={setCrewLocationData}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        10-Hour Commercial Day Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={crewDayRate}
                        onChange={(e) => setCrewDayRate(e.target.value)}
                        placeholder="1500"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Union Affiliation *
                      </label>
                      <input
                        type="text"
                        value={crewUnion}
                        onChange={(e) => setCrewUnion(e.target.value)}
                        placeholder="IATSE Local 600 / Non-Union"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Headshot / Portfolio Portrait Image URL *
                      </label>
                      <input
                        type="url"
                        value={crewImageUrl}
                        onChange={(e) => setCrewImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Verified Production Credits *
                      </label>
                      <input
                        type="text"
                        value={crewCredits}
                        onChange={(e) => setCrewCredits(e.target.value)}
                        placeholder="e.g. Nike Global Commercial, HBO Feature, Apple TV+"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Professional Biography &amp; Technical Discipline *
                      </label>
                      <textarea
                        rows={3}
                        value={crewBio}
                        onChange={(e) => setCrewBio(e.target.value)}
                        placeholder="Summarize your career, signature lighting aesthetic, camera system proficiencies, and commercial agency experience..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Working Kit Summary (Included with Hire)
                      </label>
                      <input
                        type="text"
                        value={crewWorkingKit}
                        onChange={(e) => setCrewWorkingKit(e.target.value)}
                        placeholder="SmallHD Cine 7 Monitor, Teradek Bolt 4K, Light Meter"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Core Technical Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={crewSkills}
                        onChange={(e) => setCrewSkills(e.target.value)}
                        placeholder="ARRI Alexa 35, Anamorphic Lensing, Motion Control, Gaffer Sync"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Next Availability Window
                      </label>
                      <input
                        type="text"
                        value={crewNextAvailable}
                        onChange={(e) => setCrewNextAvailable(e.target.value)}
                        placeholder="Immediate / Next Week"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={crewStandardKitIncluded}
                          onChange={(e) => setCrewStandardKitIncluded(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Standard Operator Monitor / Light Meter Kit Included</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TYPE 4: EQUIPMENT PACKAGE FORM --- */}
              {listingType === 'equipment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Brand / Manufacturer *
                      </label>
                      <input
                        type="text"
                        value={equipBrand}
                        onChange={(e) => setEquipBrand(e.target.value)}
                        placeholder="ARRI, RED, Sony, Cooke, Aputure"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Item Name / Package Title *
                      </label>
                      <input
                        type="text"
                        value={equipName}
                        onChange={(e) => setEquipName(e.target.value)}
                        placeholder="Alexa 35 Production Package"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Gear Category *
                      </label>
                      <select
                        value={equipCategory}
                        onChange={(e) =>
                          setEquipCategory(
                            e.target.value as
                              | 'cameras'
                              | 'lighting'
                              | 'grip'
                              | 'audio'
                              | 'monitoring'
                              | 'packages'
                          )
                        }
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="cameras">Cinema Camera Packages</option>
                        <option value="lighting">High-Output Cinema Lighting</option>
                        <option value="grip">Grip &amp; Rigging Hardware</option>
                        <option value="audio">Field &amp; Studio Audio</option>
                        <option value="monitoring">Wireless Video &amp; Client Monitors</option>
                        <option value="packages">Complete Turnkey Grip Trucks</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Lens Mount / Interface
                      </label>
                      <input
                        type="text"
                        value={equipMountType}
                        onChange={(e) => setEquipMountType(e.target.value)}
                        placeholder="LPL / PL Mount"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Daily Rental Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={equipDayRate}
                        onChange={(e) => setEquipDayRate(e.target.value)}
                        placeholder="1250"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Weekly Rental Rate ($) *
                      </label>
                      <input
                        type="number"
                        value={equipWeeklyRate}
                        onChange={(e) => setEquipWeeklyRate(e.target.value)}
                        placeholder="3750"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Insured Replacement Valuation ($) *
                      </label>
                      <input
                        type="number"
                        value={equipReplacementValue}
                        onChange={(e) => setEquipReplacementValue(e.target.value)}
                        placeholder="78000"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Power Requirement *
                      </label>
                      <input
                        type="text"
                        value={equipPowerReq}
                        onChange={(e) => setEquipPowerReq(e.target.value)}
                        placeholder="B-Mount 24V / AC Adapter"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ListingLocationFormSection
                        type="equipment"
                        value={equipLocationData}
                        onChange={setEquipLocationData}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Product Photo Image URL *
                      </label>
                      <input
                        type="url"
                        value={equipImageUrl}
                        onChange={(e) => setEquipImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Equipment Description &amp; Condition *
                      </label>
                      <textarea
                        rows={3}
                        value={equipDesc}
                        onChange={(e) => setEquipDesc(e.target.value)}
                        placeholder="Detail firmware version, flight casing, sensor test condition, and rental protocols..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Included Accessories in Pelican Flight Case
                      </label>
                      <input
                        type="text"
                        value={equipIncludedAccessories}
                        onChange={(e) => setEquipIncludedAccessories(e.target.value)}
                        placeholder="2x 2TB Codex Drives, EVF Cable, Baseplate, Power Cable"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Key Specifications (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={equipKeySpecs}
                        onChange={(e) => setEquipKeySpecs(e.target.value)}
                        placeholder="4.6K Super 35 Sensor, 17 Stops Dynamic Range, REVEAL Color Science"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: Save Draft vs Publish Immediately */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span>Listings publish </span>
                  <strong className="text-amber-600 dark:text-amber-400">immediately</strong>
                  <span> to the marketplace without administrator review delays.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitListing(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitListing(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Listing Immediately →'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          initialPhone={user?.phone || ''}
          onSuccess={() => {
            refreshUser();
            setErrorNotice(null);
          }}
        />
      </div>
    </div>
  );
}
