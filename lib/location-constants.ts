export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export function isValidIndianPinCode(pincode?: string | null): boolean {
  if (!pincode) return false;
  return /^\d{6}$/.test(pincode.trim());
}

export function isValidCoordinates(coords?: unknown): boolean {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lng, lat] = coords as unknown[];
  if (typeof lng !== 'number' || typeof lat !== 'number') return false;
  if (isNaN(lng) || isNaN(lat)) return false;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

export function isLikelyIndianCoordinates(coords: [number, number]): boolean {
  const [lng, lat] = coords;
  return lng >= 68.0 && lng <= 98.5 && lat >= 6.5 && lat <= 38.5;
}

function isGoogleDomain(host: string): boolean {
  if (host === 'google.com' || host === 'www.google.com') return true;
  if (host === 'maps.google.com') return true;
  const match = host.match(/^(?:(?:www|maps)\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)$/);
  if (!match) return false;
  const tld = match[1];
  return /^[a-z]{2,3}(\.[a-z]{2})?$/.test(tld);
}

/**
 * Validates that a string is a legitimate Google Maps URL.
 * Supports:
 * - Share links: maps.app.goo.gl/*, goo.gl/maps/*
 * - Standard links: maps.google.com, www.google.com/maps/*, google.com/maps/*
 * - International domains: maps.google.co.in, www.google.co.in/maps/*, etc.
 * Rejects non-Google domains, malformed URLs, and non-HTTP/HTTPS protocols.
 */
export function isValidGoogleMapsUrl(urlStr?: string | null): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (host === 'maps.app.goo.gl') return pathname.length > 1;
    if (host === 'goo.gl') return pathname.startsWith('/maps');

    if (isGoogleDomain(host)) {
      if (host.startsWith('maps.google.')) return true;
      return pathname.startsWith('/maps');
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Safely extracts coordinates from standard Google Maps URLs if present in the URL string
 * (e.g. from @lat,lng or q=lat,lng).
 * Note: Share links (maps.app.goo.gl) are not fetched to avoid SSRF.
 */
export function extractCoordinatesFromGoogleMapsUrl(urlStr?: string | null): [number, number] | null {
  if (!urlStr || typeof urlStr !== 'string') return null;
  const atMatch = urlStr.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lng, lat]; // GeoJSON format: [longitude, latitude]
    }
  }
  const paramMatch = urlStr.match(/[?&](?:q|ll|query|destination)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (paramMatch) {
    const lat = parseFloat(paramMatch[1]);
    const lng = parseFloat(paramMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lng, lat]; // GeoJSON format: [longitude, latitude]
    }
  }
  return null;
}
