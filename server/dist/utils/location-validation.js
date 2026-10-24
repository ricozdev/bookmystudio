"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDIAN_STATES = void 0;
exports.isValidIndianPinCode = isValidIndianPinCode;
exports.isValidCoordinates = isValidCoordinates;
exports.isLikelyIndianCoordinates = isLikelyIndianCoordinates;
exports.isValidGoogleMapsUrl = isValidGoogleMapsUrl;
exports.extractCoordinatesFromGoogleMapsUrl = extractCoordinatesFromGoogleMapsUrl;
exports.validateListingLocation = validateListingLocation;
exports.INDIAN_STATES = [
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
function isValidIndianPinCode(pincode) {
    if (!pincode)
        return false;
    return /^\d{6}$/.test(pincode.trim());
}
function isValidCoordinates(coords) {
    if (!Array.isArray(coords) || coords.length !== 2)
        return false;
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number')
        return false;
    if (isNaN(lng) || isNaN(lat))
        return false;
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
function isLikelyIndianCoordinates(coords) {
    const [lng, lat] = coords;
    // Bounding box roughly covering India and territorial waters
    return lng >= 68.0 && lng <= 98.5 && lat >= 6.5 && lat <= 38.5;
}
function isGoogleDomain(host) {
    if (host === 'google.com' || host === 'www.google.com')
        return true;
    if (host === 'maps.google.com')
        return true;
    const match = host.match(/^(?:(?:www|maps)\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)$/);
    if (!match)
        return false;
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
function isValidGoogleMapsUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string')
        return false;
    const trimmed = urlStr.trim();
    if (!trimmed)
        return false;
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
            return false;
        const host = parsed.hostname.toLowerCase();
        const pathname = parsed.pathname;
        if (host === 'maps.app.goo.gl')
            return pathname.length > 1;
        if (host === 'goo.gl')
            return pathname.startsWith('/maps');
        if (isGoogleDomain(host)) {
            if (host.startsWith('maps.google.'))
                return true;
            return pathname.startsWith('/maps');
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Safely extracts coordinates from standard Google Maps URLs if present in the URL string
 * (e.g. from @lat,lng or q=lat,lng).
 * Note: Share links (maps.app.goo.gl) are not fetched to avoid SSRF.
 */
function extractCoordinatesFromGoogleMapsUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string')
        return null;
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
/**
 * Validates category-specific location rules for publishing a listing.
 *
 * Rules:
 * - Studio: Requires usable physical address (City, State, 6-digit PIN, Locality, Street/Building, GeoJSON coordinates)
 * - Location: Requires usable property coordinates (City, State, 6-digit PIN, Locality, GeoJSON coordinates)
 * - Crew: Requires working market (City, State, GeoJSON base coordinates, service radius >= 1). Home address NOT required.
 * - Equipment: Requires pickup location (City, State, Pickup Location/Facility, GeoJSON coordinates, delivery coverage >= 1)
 */
function validateListingLocation(type, locationGeo, locationAddress, options) {
    const missingFields = [];
    const errors = [];
    const warnings = [];
    const addr = locationAddress || {};
    const city = (addr.city || '').trim();
    const state = (addr.state || '').trim();
    const locality = (addr.locality || options?.submarket || '').trim();
    const pincode = (addr.pincode || '').trim();
    const street = (addr.street || '').trim();
    const building = (addr.building || '').trim();
    const formatted = (addr.formatted || options?.location || '').trim();
    const mapUrl = (addr.mapUrl || options?.mapUrl || '').trim();
    // 1. Coordinates check
    const coords = locationGeo?.coordinates;
    const hasCoords = isValidCoordinates(coords);
    if (!hasCoords) {
        missingFields.push('geographic coordinates (latitude & longitude)');
        errors.push('Listing must have confirmed geographic coordinates for nearby discovery.');
    }
    else if (!isLikelyIndianCoordinates(coords)) {
        warnings.push('Coordinates appear to be outside standard Indian territory bounds.');
    }
    // 2. City & State check (All categories)
    if (!city) {
        missingFields.push('city');
        errors.push('City is required.');
    }
    if (!state) {
        missingFields.push('state');
        errors.push('State or Union Territory is required.');
    }
    // 3. Google Maps Location Link check
    if (type === 'studio' || type === 'location') {
        if (!mapUrl) {
            missingFields.push('Google Maps location link');
            errors.push(type === 'studio'
                ? 'A valid Google Maps location link is required before publishing a studio listing.'
                : 'A valid Google Maps location link is required before publishing a filming location.');
        }
        else if (!isValidGoogleMapsUrl(mapUrl)) {
            errors.push('The provided Google Maps location link is invalid. Please paste a valid Google Maps URL.');
        }
    }
    else if (mapUrl && !isValidGoogleMapsUrl(mapUrl)) {
        errors.push('The provided Google Maps location link is invalid. Please paste a valid Google Maps URL.');
    }
    // 3. Category-specific requirements
    switch (type) {
        case 'studio': {
            if (!locality && !options?.submarket) {
                missingFields.push('locality / neighborhood');
                errors.push('Locality or studio submarket is required (e.g. Jubilee Hills, Andheri West).');
            }
            if (!pincode) {
                missingFields.push('6-digit PIN code');
                errors.push('A valid 6-digit postal PIN code is required for studio properties.');
            }
            else if (!isValidIndianPinCode(pincode)) {
                errors.push(`PIN code "${pincode}" is invalid. Must be exactly 6 digits.`);
            }
            if (!street && !building && !formatted) {
                missingFields.push('street address or building name');
                errors.push('Studio stages require a street address or building identity for production logistics.');
            }
            break;
        }
        case 'location': {
            if (!locality && !options?.submarket) {
                missingFields.push('locality / area');
                errors.push('Locality or filming area is required (e.g. Film City, Goregaon East).');
            }
            if (!pincode) {
                missingFields.push('6-digit PIN code');
                errors.push('A valid 6-digit postal PIN code is required for filming locations.');
            }
            else if (!isValidIndianPinCode(pincode)) {
                errors.push(`PIN code "${pincode}" is invalid. Must be exactly 6 digits.`);
            }
            break;
        }
        case 'crew': {
            // Crew do NOT require a home street address or PIN code, protecting privacy
            const radius = options?.serviceRadiusKm;
            if (radius !== undefined && (typeof radius !== 'number' || radius < 1)) {
                errors.push('Crew service radius must be at least 1 km.');
            }
            break;
        }
        case 'equipment': {
            const pickup = (options?.pickupLocation || options?.location || addr.street || addr.locality || '').trim();
            if (!pickup) {
                missingFields.push('pickup / warehouse location');
                errors.push('Equipment requires a designated pickup or warehouse location.');
            }
            const coverage = options?.deliveryCoverageKm;
            if (coverage !== undefined && (typeof coverage !== 'number' || coverage < 0)) {
                errors.push('Delivery coverage must be a non-negative number of kilometers.');
            }
            break;
        }
    }
    const accuracy = addr.accuracy || (building ? 'rooftop' : street ? 'street' : locality ? 'locality' : 'approximate');
    return {
        isValid: errors.length === 0,
        missingFields,
        errors,
        warnings,
        accuracy,
    };
}
//# sourceMappingURL=location-validation.js.map