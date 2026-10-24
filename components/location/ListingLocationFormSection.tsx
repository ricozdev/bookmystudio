'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LocationGeoPoint, LocationAddressDetails } from '@/lib/types';
import { locationApi, GeocodedLocationItem, ListingType } from '@/lib/api/marketplace';
import {
  INDIAN_STATES,
  isValidIndianPinCode,
  isValidCoordinates,
  isValidGoogleMapsUrl,
  extractCoordinatesFromGoogleMapsUrl,
} from '@/lib/location-constants';

export interface ListingLocationData {
  locationGeo?: LocationGeoPoint;
  locationAddress?: LocationAddressDetails;
  location?: string;
  submarket?: string;
  pickupLocation?: string;
  serviceRadiusKm?: number;
  deliveryCoverageKm?: number;
  mapUrl?: string | null;
}

interface ListingLocationFormSectionProps {
  type: ListingType;
  value: ListingLocationData;
  onChange: (updated: ListingLocationData) => void;
  disabled?: boolean;
  showValidationErrors?: boolean;
}

export function ListingLocationFormSection({
  type,
  value,
  onChange,
  disabled = false,
  showValidationErrors = false,
}: ListingLocationFormSectionProps) {
  // Method tab: 'search' | 'gps' | 'manual'
  const [activeMethod, setActiveMethod] = useState<'search' | 'gps' | 'manual'>('search');

  // Address search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // GPS detection state
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedGpsCandidate, setDetectedGpsCandidate] = useState<GeocodedLocationItem | null>(null);

  // Manual geocoding state
  const [isGeocodingManual, setIsGeocodingManual] = useState(false);
  const [manualGeocodeNotice, setManualGeocodeNotice] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim() || activeMethod !== 'search') {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await locationApi.search(searchQuery.trim());
        if (res.success && res.data) {
          setSearchResults(res.data);
          setSearchDropdownOpen(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeMethod]);

  // Derived current fields
  const address = value.locationAddress || {};
  const coords = value.locationGeo?.coordinates;
  const hasValidCoords = isValidCoordinates(coords);
  const accuracy = address.accuracy || (hasValidCoords ? 'locality' : undefined);

  // Current Google Maps Location Link
  const currentMapUrl = (value.mapUrl !== undefined ? value.mapUrl : address.mapUrl) || '';
  const isMapUrlEntered = Boolean(currentMapUrl.trim());
  const isMapUrlValid = isMapUrlEntered && isValidGoogleMapsUrl(currentMapUrl);
  const mapUrlError =
    isMapUrlEntered && !isMapUrlValid
      ? 'Please enter a supported Google Maps URL (e.g. https://maps.app.goo.gl/... or https://maps.google.com/...)'
      : null;

  // Privacy setting defaults based on category
  const isExactAddressPublic =
    address.isExactAddressPublic !== undefined
      ? address.isExactAddressPublic
      : type !== 'crew';

  // Apply location item selected from search or GPS confirmation
  const applyGeocodedLocation = (
    item: GeocodedLocationItem,
    methodAccuracy?: 'rooftop' | 'street' | 'locality' | 'city' | 'approximate' | 'manual'
  ) => {
    const updatedAddress: LocationAddressDetails = {
      ...address,
      formatted: item.formatted || item.name,
      locality: item.locality || address.locality || '',
      city: item.city || address.city || '',
      state: item.state || address.state || '',
      pincode: item.pincode || address.pincode || '',
      country: item.country || 'India',
      street: item.street || address.street || '',
      building: item.building || address.building || '',
      accuracy: methodAccuracy || item.accuracy || 'locality',
      isExactAddressPublic,
      mapUrl: currentMapUrl || address.mapUrl,
    };

    const updatedGeo: LocationGeoPoint = {
      type: 'Point',
      coordinates: item.coordinates,
    };

    const displayLocation = item.locality
      ? `${item.locality}, ${item.city}`
      : `${item.city}, ${item.state}`;

    onChange({
      ...value,
      locationGeo: updatedGeo,
      locationAddress: updatedAddress,
      mapUrl: currentMapUrl || address.mapUrl,
      location: displayLocation,
      submarket: item.locality || value.submarket || '',
      pickupLocation: type === 'equipment' ? (item.street || item.locality || displayLocation) : value.pickupLocation,
    });

    setSearchDropdownOpen(false);
    setSearchQuery('');
  };

  // Handle Google Maps Location Link field change
  const handleMapUrlChange = (newUrl: string) => {
    const trimmed = newUrl.trim();
    const updatedAddress: LocationAddressDetails = {
      ...address,
      mapUrl: trimmed || null,
    };

    let updatedGeo = value.locationGeo;
    // Attempt SSRF-safe client-side coordinate extraction if standard maps link with lat/lng
    if (trimmed && isValidGoogleMapsUrl(trimmed)) {
      const extractedCoords = extractCoordinatesFromGoogleMapsUrl(trimmed);
      if (extractedCoords && (!updatedGeo || !updatedGeo.coordinates)) {
        updatedGeo = {
          type: 'Point',
          coordinates: extractedCoords,
        };
      }
    }

    onChange({
      ...value,
      locationAddress: updatedAddress,
      mapUrl: trimmed || null,
      locationGeo: updatedGeo,
    });
  };

  // Trigger GPS detection
  const handleDetectGps = () => {
    setGpsError(null);
    setDetectedGpsCandidate(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await locationApi.reverse(lat, lng);
          if (res.success && res.data) {
            setDetectedGpsCandidate(res.data);
          } else {
            setGpsError('Unable to identify postal address for detected coordinates.');
          }
        } catch {
          setGpsError('Reverse geocoding failed. Please try address search or manual entry.');
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location access was denied. Please allow browser location access or use address search.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Location request timed out. Please try again.');
        } else {
          setGpsError('Unable to retrieve your current location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Manual geocode trigger
  const handleVerifyManualCoordinates = async () => {
    const parts = [
      address.building,
      address.street,
      address.locality || value.submarket,
      address.city,
      address.state,
      address.pincode,
      'India',
    ].filter(Boolean);

    const query = parts.join(', ');
    if (!address.city && !address.pincode) {
      setManualGeocodeNotice('Please provide at least a City and State or PIN Code before verifying coordinates.');
      return;
    }

    setIsGeocodingManual(true);
    setManualGeocodeNotice(null);

    try {
      const res = await locationApi.search(query || `${address.city}, ${address.state}`);
      if (res.success && res.data && res.data.length > 0) {
        const best = res.data[0];
        const determinedAccuracy = address.building ? 'rooftop' : address.street ? 'street' : address.pincode ? 'locality' : 'city';
        applyGeocodedLocation(best, determinedAccuracy);
        setManualGeocodeNotice(`Coordinates verified successfully: [${best.coordinates[1].toFixed(5)}, ${best.coordinates[0].toFixed(5)}]`);
      } else {
        setManualGeocodeNotice('Could not pinpoint coordinates automatically. Please double check the locality, city, and PIN code.');
      }
    } catch {
      setManualGeocodeNotice('Geocoding service unavailable right now. Coordinates could not be resolved.');
    } finally {
      setIsGeocodingManual(false);
    }
  };

  // Manual address field updater
  const handleAddressFieldChange = (field: keyof LocationAddressDetails, val: string | boolean) => {
    const updatedAddress: LocationAddressDetails = {
      ...address,
      [field]: val,
    };

    let updatedLocation = value.location;
    let updatedSubmarket = value.submarket;

    if (field === 'locality') {
      updatedSubmarket = String(val);
      if (address.city) {
        updatedLocation = `${val}, ${address.city}`;
      }
    } else if (field === 'city') {
      if (address.locality) {
        updatedLocation = `${address.locality}, ${val}`;
      } else {
        updatedLocation = String(val);
      }
    }

    onChange({
      ...value,
      locationAddress: updatedAddress,
      location: updatedLocation,
      submarket: updatedSubmarket,
    });
  };

  // Completeness check for publication
  const missingItems: string[] = [];
  if (!address.city?.trim()) missingItems.push('City');
  if (!address.state?.trim()) missingItems.push('State');
  if (!hasValidCoords) missingItems.push('Verified GPS / Coordinates');

  // Mandatory Google Maps Location Link for studio and location
  if (type === 'studio' || type === 'location') {
    if (!currentMapUrl.trim()) {
      missingItems.push('Google Maps location link');
    } else if (!isMapUrlValid) {
      missingItems.push('Valid Google Maps location link');
    }
  } else if (isMapUrlEntered && !isMapUrlValid) {
    missingItems.push('Valid Google Maps location link');
  }

  if (type === 'studio') {
    if (!address.locality?.trim() && !value.submarket?.trim()) missingItems.push('Locality / Submarket');
    if (!isValidIndianPinCode(address.pincode)) missingItems.push('Valid 6-digit PIN code');
    if (!address.street?.trim() && !address.building?.trim() && !address.formatted?.trim()) {
      missingItems.push('Street address or building name');
    }
  } else if (type === 'location') {
    if (!address.locality?.trim() && !value.submarket?.trim()) missingItems.push('Locality / Filming area');
    if (!isValidIndianPinCode(address.pincode)) missingItems.push('Valid 6-digit PIN code');
  } else if (type === 'crew') {
    if (!value.serviceRadiusKm || value.serviceRadiusKm < 1) missingItems.push('Service radius (min 1 km)');
  } else if (type === 'equipment') {
    if (!value.pickupLocation?.trim() && !address.street?.trim() && !address.locality?.trim()) {
      missingItems.push('Pickup warehouse / facility address');
    }
  }

  const isLocationComplete = missingItems.length === 0;

  // Accuracy badge rendering
  const renderAccuracyBadge = () => {
    if (!hasValidCoords) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/40 text-red-400 border border-red-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          No Coordinates Confirmed
        </span>
      );
    }

    switch (accuracy) {
      case 'rooftop':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Verified Rooftop Precision
          </span>
        );
      case 'street':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950/40 text-teal-300 border border-teal-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Street-level Precision
          </span>
        );
      case 'locality':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Locality Centroid
          </span>
        );
      case 'city':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            City Centroid
          </span>
        );
      case 'manual':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/40 text-blue-300 border border-blue-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Manually Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Approximate Area
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 rounded-xl bg-white dark:bg-[#141418] border border-zinc-200 dark:border-[#27272A] p-5 sm:p-6 text-zinc-900 dark:text-zinc-200 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {type === 'studio' && 'Studio Location & Physical Address'}
                {type === 'location' && 'Filming Location & Geographic Position'}
                {type === 'crew' && 'Professional Working Base & Service Radius'}
                {type === 'equipment' && 'Equipment Depot & Pickup Location'}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {type === 'crew'
                  ? 'Specify your primary production hub city and travel radius. Your personal home address is never required.'
                  : 'Coordinates power India-wide discovery and accurate nearby calculations for production teams.'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Accuracy Badge */}
        <div className="self-start sm:self-center">{renderAccuracyBadge()}</div>
      </div>

      {/* GOOGLE MAPS LOCATION LINK FIELD */}
      <div className="space-y-2 p-4 rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-200 dark:border-zinc-800/90">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Google Maps Location Link
            {(type === 'studio' || type === 'location') && (
              <span className="text-amber-500 dark:text-amber-400 ml-1" title="Required for live publication">*</span>
            )}
          </label>
          {isMapUrlValid && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Valid Google Maps Link
            </span>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="url"
            disabled={disabled}
            value={currentMapUrl}
            onChange={(e) => handleMapUrlChange(e.target.value)}
            placeholder="Paste your Google Maps link here"
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-white dark:bg-[#121216] border text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition ${
              mapUrlError
                ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                : isMapUrlValid
                ? 'border-emerald-500/70 dark:border-emerald-700/70 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                : 'border-zinc-300 dark:border-[#27272A] focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
            }`}
          />
          {currentMapUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleMapUrlChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
              title="Clear Google Maps link"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Open Google Maps, find your location, select Share, and copy the link.
        </p>

        {mapUrlError && (
          <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1 pt-0.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {mapUrlError}
          </p>
        )}
      </div>

      {/* Address Entry Method Tabs */}
      <div className="flex p-1 rounded-lg bg-zinc-100 dark:bg-[#1A1A20] border border-zinc-200 dark:border-[#27272A] w-full max-w-md">
        <button
          type="button"
          onClick={() => setActiveMethod('search')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition flex items-center justify-center gap-1.5 ${
            activeMethod === 'search'
              ? 'bg-amber-500 text-black shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Address
        </button>

        <button
          type="button"
          onClick={() => setActiveMethod('gps')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition flex items-center justify-center gap-1.5 ${
            activeMethod === 'gps'
              ? 'bg-amber-500 text-black shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 100-16 8 8 0 000 16zm0-11a3 3 0 100 6 3 3 0 000-6z"
            />
          </svg>
          GPS Detection
        </button>

        <button
          type="button"
          onClick={() => setActiveMethod('manual')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition flex items-center justify-center gap-1.5 ${
            activeMethod === 'manual'
              ? 'bg-amber-500 text-black shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Manual Details
        </button>
      </div>

      {/* METHOD A: ADDRESS SEARCH & AUTOCOMPLETE */}
      {activeMethod === 'search' && (
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Search Indian City, Locality, Landmark, or 6-digit PIN Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              disabled={disabled}
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (!val.trim()) {
                  setSearchResults([]);
                  setIsSearching(false);
                }
              }}
              placeholder="e.g. Jubilee Hills, Hyderabad or 500033 or Goregaon East, Mumbai"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <svg className="animate-spin w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-30 mt-1.5 w-full rounded-xl bg-white dark:bg-[#18181D] border border-zinc-200 dark:border-[#2E2E38] shadow-2xl max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-[#27272A]">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyGeocodedLocation(item)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition flex items-start gap-3"
                >
                  <div className="mt-0.5 text-amber-500 dark:text-amber-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{item.name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{item.formatted}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                        {item.state} {item.pincode ? `• ${item.pincode}` : ''}
                      </span>
                      {item.accuracy && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.accuracy}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* METHOD B: GPS CURRENT LOCATION DETECTION */}
      {activeMethod === 'gps' && (
        <div className="rounded-lg bg-zinc-50 dark:bg-[#18181D] border border-zinc-200 dark:border-[#27272A] p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 100-16 8 8 0 000 16zm0-11a3 3 0 100 6 3 3 0 000-6z"
                  />
                </svg>
                Detect Location using Device GPS
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Ensure you are physically on site at the studio or filming property for rooftop precision.
              </p>
            </div>

            <button
              type="button"
              disabled={disabled || isDetectingGps}
              onClick={handleDetectGps}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isDetectingGps ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Detecting GPS...
                </>
              ) : (
                'Detect My Location'
              )}
            </button>
          </div>

          {gpsError && (
            <div className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg p-3">
              {gpsError}
            </div>
          )}

          {detectedGpsCandidate && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    Detected Coordinates &amp; Address
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                    {detectedGpsCandidate.formatted || detectedGpsCandidate.name}
                  </div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                    Latitude: {detectedGpsCandidate.coordinates[1].toFixed(5)}, Longitude: {detectedGpsCandidate.coordinates[0].toFixed(5)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-500/20">
                <button
                  type="button"
                  onClick={() => applyGeocodedLocation(detectedGpsCandidate, 'rooftop')}
                  className="px-3.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
                >
                  Confirm &amp; Use This GPS Address
                </button>
                <button
                  type="button"
                  onClick={() => setDetectedGpsCandidate(null)}
                  className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* METHOD C & DETAILED MANUAL FORM FIELDS */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Structured Address Breakdown
        </div>

        {/* Studio / Property specific fields */}
        {type !== 'crew' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Building / Suite / Studio Stage No.
                {type === 'studio' && <span className="text-amber-500 dark:text-amber-400 ml-1">*</span>}
              </label>
              <input
                type="text"
                disabled={disabled}
                value={address.building || ''}
                onChange={(e) => handleAddressFieldChange('building', e.target.value)}
                placeholder="e.g. Stage B, Plot 42 or Prism Tower"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Street Address / Road Name
                {type === 'studio' && <span className="text-amber-500 dark:text-amber-400 ml-1">*</span>}
              </label>
              <input
                type="text"
                disabled={disabled}
                value={address.street || ''}
                onChange={(e) => handleAddressFieldChange('street', e.target.value)}
                placeholder="e.g. Road No. 36 or Film City Boulevard"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
              />
            </div>
          </div>
        )}

        {/* Landmark & Arrival Instructions */}
        {type !== 'crew' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Prominent Landmark
              </label>
              <input
                type="text"
                disabled={disabled}
                value={address.landmark || ''}
                onChange={(e) => handleAddressFieldChange('landmark', e.target.value)}
                placeholder="e.g. Opposite Film City Main Gate, Near Studio 4"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Arrival / Loading Bay Instructions
              </label>
              <input
                type="text"
                disabled={disabled}
                value={address.arrivalInstructions || ''}
                onChange={(e) => handleAddressFieldChange('arrivalInstructions', e.target.value)}
                placeholder="e.g. Enter through Gate 2, Loading dock clearance 14ft"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
              />
            </div>
          </div>
        )}

        {/* Locality & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Locality / Neighborhood / Submarket
              {type !== 'crew' && <span className="text-amber-500 dark:text-amber-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              disabled={disabled}
              value={address.locality || value.submarket || ''}
              onChange={(e) => handleAddressFieldChange('locality', e.target.value)}
              placeholder="e.g. Jubilee Hills, Andheri West, or Whitefield"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              City <span className="text-amber-500 dark:text-amber-400">*</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={address.city || ''}
              onChange={(e) => handleAddressFieldChange('city', e.target.value)}
              placeholder="e.g. Hyderabad, Mumbai, Bengaluru, Delhi"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>
        </div>

        {/* State, PIN, Country */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              State / Union Territory <span className="text-amber-500 dark:text-amber-400">*</span>
            </label>
            <select
              disabled={disabled}
              value={address.state || ''}
              onChange={(e) => handleAddressFieldChange('state', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white"
            >
              <option value="">Select Indian State...</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Postal PIN Code
              {type !== 'crew' && <span className="text-amber-500 dark:text-amber-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              maxLength={6}
              disabled={disabled}
              value={address.pincode || ''}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '').slice(0, 6);
                handleAddressFieldChange('pincode', numeric);
              }}
              placeholder="6-digit PIN (e.g. 500033)"
              className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 ${
                address.pincode && !isValidIndianPinCode(address.pincode)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-zinc-300 dark:border-[#27272A] focus:border-amber-500'
              }`}
            />
            {address.pincode && !isValidIndianPinCode(address.pincode) && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">Must be exactly 6 digits</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Country</label>
            <input
              type="text"
              disabled
              value={address.country || 'India'}
              className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-[#18181D]/60 border border-zinc-200 dark:border-[#27272A] text-base sm:text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Equipment specific: Pickup Location */}
        {type === 'equipment' && (
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Pickup Warehouse / Facility Instructions <span className="text-amber-500 dark:text-amber-400">*</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={value.pickupLocation || ''}
              onChange={(e) => onChange({ ...value, pickupLocation: e.target.value })}
              placeholder="e.g. GearHub Depo, Gate 2, Andheri West or Studio Vault Counter"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#18181D] border border-zinc-300 dark:border-[#27272A] focus:border-amber-500 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>
        )}

        {/* Radius Controls: Crew Service Radius or Equipment Delivery Coverage */}
        {type === 'crew' && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Service Radius: <span className="text-amber-600 dark:text-amber-400 font-semibold">{value.serviceRadiusKm || 50} km</span> from base
              </label>
              <span className="text-xs text-zinc-500">Local travel zone</span>
            </div>
            <input
              type="range"
              min={5}
              max={250}
              step={5}
              disabled={disabled}
              value={value.serviceRadiusKm || 50}
              onChange={(e) => onChange({ ...value, serviceRadiusKm: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>5 km (Local Only)</span>
              <span>50 km (Metropolitan)</span>
              <span>150 km (Regional)</span>
              <span>250 km (Extended State)</span>
            </div>
          </div>
        )}

        {type === 'equipment' && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Delivery Coverage: <span className="text-amber-600 dark:text-amber-400 font-semibold">{value.deliveryCoverageKm ?? 30} km</span> (0 for pickup-only)
              </label>
              <span className="text-xs text-zinc-500">Van &amp; crew courier range</span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              disabled={disabled}
              value={value.deliveryCoverageKm ?? 30}
              onChange={(e) => onChange({ ...value, deliveryCoverageKm: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>0 km (Customer Pickup Only)</span>
              <span>30 km (City Metro)</span>
              <span>75 km (Greater Region)</span>
              <span>150 km (State-wide Delivery)</span>
            </div>
          </div>
        )}

        {/* Verify Coordinates Trigger Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {hasValidCoords ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Coordinates confirmed: [{coords![1].toFixed(5)}, {coords![0].toFixed(5)}]
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400/90 font-medium">
                Tip: Click verify below to resolve exact coordinates from your address.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={disabled || isGeocodingManual}
            onClick={handleVerifyManualCoordinates}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#22222A] dark:hover:bg-[#2A2A34] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-[#383844] text-xs font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGeocodingManual ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying with Geocoder...
              </>
            ) : (
              'Verify & Refresh Coordinates'
            )}
          </button>
        </div>

        {manualGeocodeNotice && (
          <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-lg p-3">
            {manualGeocodeNotice}
          </div>
        )}

        {/* Talent & Listing Privacy Visibility Toggle */}
        <div className="pt-4 border-t border-zinc-200 dark:border-[#27272A]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              disabled={disabled}
              checked={isExactAddressPublic}
              onChange={(e) => handleAddressFieldChange('isExactAddressPublic', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-[#383844] bg-white dark:bg-[#18181D] text-amber-500 focus:ring-amber-500 accent-amber-500"
            />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                {type === 'crew'
                  ? 'Display approximate base publicly (Talent privacy protection)'
                  : 'Display full street address publicly on listing page'}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {type === 'crew'
                  ? 'Recommended OFF. When unchecked, clients only see your base locality and city. Your personal street address remains private and is never disclosed.'
                  : 'When checked, verified production clients can see the complete street and building address for navigation and logistics.'}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Completeness / Gating Notice */}
      <div className={`rounded-lg p-3.5 border text-xs ${
        isLocationComplete
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
      }`}>
        <div className="flex items-center gap-2 font-semibold">
          {isLocationComplete ? (
            <>
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Location details complete &amp; verified for live marketplace publication.
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Location details incomplete for live publication (allowed in draft):
            </>
          )}
        </div>

        {!isLocationComplete && (
          <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-zinc-600 dark:text-zinc-400 pl-1">
            {missingItems.map((item, idx) => (
              <li key={idx} className="text-amber-800 dark:text-amber-300/90 font-medium">
                Missing {item}
              </li>
            ))}
          </ul>
        )}

        {showValidationErrors && !isLocationComplete && (
          <p className="text-red-600 dark:text-red-400 font-semibold mt-2">
            Please resolve the missing location fields above before publishing this listing live.
          </p>
        )}
      </div>
    </div>
  );
}
