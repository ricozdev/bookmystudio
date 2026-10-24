'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserLocationState } from '@/lib/types';
import { locationApi, GeocodedLocationItem } from '@/lib/api/marketplace';

const STORAGE_KEY = 'bms_user_location';

export const NEUTRAL_USER_LOCATION: UserLocationState = {
  id: 'all-india',
  name: 'All India',
  locality: '',
  city: 'All India',
  state: 'India',
  pincode: '',
  coordinates: [78.9629, 20.5937], // Geographic center of India
  radiusKm: 'all',
  isGps: false,
};

export const DEFAULT_USER_LOCATION: UserLocationState = NEUTRAL_USER_LOCATION;

interface LocationContextType {
  location: UserLocationState;
  isLocating: boolean;
  locationError: string | null;
  isSelectorOpen: boolean;
  isHydrated: boolean;
  isNeutral: boolean;
  setLocation: (newLocation: Partial<UserLocationState>) => void;
  setRadius: (radius: number | 'all') => void;
  selectHub: (hub: GeocodedLocationItem) => void;
  resetToAllIndia: () => void;
  useCurrentGpsLocation: () => Promise<boolean>;
  openSelector: () => void;
  closeSelector: () => void;
  clearError: () => void;
  locationDisplayLabel: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  // Deterministic initial state: identical on server and client initial render
  const [location, setLocationState] = useState<UserLocationState>(DEFAULT_USER_LOCATION);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  // Safely hydrate saved location from localStorage post-mount
  useEffect(() => {
    let isMounted = true;

    const hydrateFromStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            Array.isArray(parsed.coordinates) &&
            parsed.coordinates.length === 2 &&
            !isNaN(parsed.coordinates[0]) &&
            !isNaN(parsed.coordinates[1])
          ) {
            setLocationState((prev) => ({
              ...prev,
              ...parsed,
              radiusKm: parsed.radiusKm ?? (parsed.id === 'all-india' ? 'all' : 25),
            }));
          }
        }
      } catch {
        // Fallback remains DEFAULT_USER_LOCATION
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    queueMicrotask(hydrateFromStorage);

    return () => {
      isMounted = false;
    };
  }, []);

  const saveLocation = useCallback((newLoc: UserLocationState) => {
    setLocationState(newLoc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));
    } catch {
      // Ignore localStorage write failures
    }
  }, []);

  const setLocation = useCallback((partial: Partial<UserLocationState>) => {
    setLocationState((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const setRadius = useCallback((radius: number | 'all') => {
    setLocationState((prev) => {
      const updated = { ...prev, radiusKm: radius };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const resetToAllIndia = useCallback(() => {
    setLocationState(NEUTRAL_USER_LOCATION);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(NEUTRAL_USER_LOCATION));
    } catch {}
    setIsSelectorOpen(false);
    setLocationError(null);
  }, []);

  const selectHub = useCallback((hub: GeocodedLocationItem) => {
    setLocationState((prev) => {
      const isAllIndia = hub.id === 'all-india';
      const updated: UserLocationState = {
        id: hub.id,
        name: hub.name,
        locality: hub.locality,
        city: hub.city,
        state: hub.state,
        pincode: hub.pincode,
        coordinates: hub.coordinates,
        radiusKm: isAllIndia ? 'all' : (prev.radiusKm === 'all' ? 25 : prev.radiusKm),
        isGps: false,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsSelectorOpen(false);
    setLocationError(null);
  }, []);

  const useCurrentGpsLocation = useCallback(async (): Promise<boolean> => {
    setLocationError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please search or pick a hub.');
      return false;
    }

    setIsLocating(true);

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocode via our server endpoint
            const res = await locationApi.reverse(latitude, longitude);

            if (res.success && res.data) {
              const geo = res.data;
              const updated: UserLocationState = {
                id: geo.id,
                name: geo.name || `${geo.locality || 'Current Area'}, ${geo.city}`,
                locality: geo.locality,
                city: geo.city,
                state: geo.state,
                pincode: geo.pincode,
                coordinates: [longitude, latitude],
                radiusKm: location.radiusKm === 'all' ? 25 : location.radiusKm,
                isGps: true,
              };
              saveLocation(updated);
              setIsLocating(false);
              setIsSelectorOpen(false);
              resolve(true);
            } else {
              throw new Error('Could not resolve address from coordinates');
            }
          } catch {
            // Geocode reverse failed, use nearest hub as fallback with GPS coordinates
            const updated: UserLocationState = {
              name: 'My GPS Location',
              locality: 'Nearby',
              city: 'Detected City',
              state: 'India',
              pincode: '',
              coordinates: [position.coords.longitude, position.coords.latitude],
              radiusKm: location.radiusKm === 'all' ? 25 : location.radiusKm,
              isGps: true,
            };
            saveLocation(updated);
            setIsLocating(false);
            setIsSelectorOpen(false);
            resolve(true);
          }
        },
        (error) => {
          setIsLocating(false);
          let message = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access was denied. You can select your city or area manually from the list below.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable. Please select your area manually.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location detection timed out. Please try again or select your hub manually.';
          }
          setLocationError(message);
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    });
  }, [location.radiusKm, saveLocation]);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);
  const closeSelector = useCallback(() => setIsSelectorOpen(false), []);
  const clearError = useCallback(() => setLocationError(null), []);

  const isNeutral = location.id === 'all-india' || location.city === 'All India';

  const locationDisplayLabel = isNeutral
    ? 'CURRENT LOCATION: ALL INDIA (NATIONWIDE)'
    : `CURRENT LOCATION: ${location.locality ? `${location.locality}, ` : ''}${location.city}${location.state ? `, ${location.state}` : ''}`;

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocating,
        locationError,
        isSelectorOpen,
        isHydrated,
        isNeutral,
        setLocation,
        setRadius,
        selectHub,
        resetToAllIndia,
        useCurrentGpsLocation,
        openSelector,
        closeSelector,
        clearError,
        locationDisplayLabel,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
