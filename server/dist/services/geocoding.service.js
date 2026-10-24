"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingService = void 0;
const https_1 = __importDefault(require("https"));
const env_1 = require("../config/env");
const indian_hubs_1 = require("../utils/indian-hubs");
function fetchJson(url, timeoutMs = 4000) {
    return new Promise((resolve, reject) => {
        const req = https_1.default.get(url, {
            headers: {
                'User-Agent': 'BookMyStudio-App/1.0 (creative-marketplace)',
                Accept: 'application/json',
            },
        }, (res) => {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.setTimeout(timeoutMs, () => {
            req.destroy();
            reject(new Error('Geocoding request timed out'));
        });
    });
}
function parseGoogleAddressComponents(components) {
    let building = '';
    let street = '';
    let locality = '';
    let city = '';
    let state = '';
    let pincode = '';
    let country = 'India';
    for (const c of components || []) {
        const types = c.types || [];
        if (types.includes('street_number') || types.includes('premise') || types.includes('subpremise')) {
            building = c.long_name;
        }
        else if (types.includes('route')) {
            street = c.long_name;
        }
        else if (types.includes('sublocality_level_1') ||
            types.includes('sublocality') ||
            types.includes('neighborhood')) {
            if (!locality)
                locality = c.long_name;
        }
        else if (types.includes('locality')) {
            city = c.long_name;
            if (!locality)
                locality = c.long_name;
        }
        else if (types.includes('administrative_area_level_2') && !city) {
            city = c.long_name;
        }
        else if (types.includes('administrative_area_level_1')) {
            state = c.long_name;
        }
        else if (types.includes('postal_code')) {
            pincode = c.long_name;
        }
        else if (types.includes('country')) {
            country = c.long_name;
        }
    }
    return { building, street, locality: locality || city, city: city || locality, state, pincode, country };
}
class GeocodingService {
    /**
     * Search for locations matching query.
     * If GOOGLE_MAPS_SERVER_API_KEY is available, queries Google Maps Geocoding API.
     * Otherwise falls back to curated Indian hubs + OSM Nominatim.
     */
    static async searchLocations(query) {
        if (!query || !query.trim()) {
            return (0, indian_hubs_1.searchLocalIndianHubs)('').map((h) => this.hubToGeocoded(h));
        }
        const trimmed = query.trim();
        const localMatches = (0, indian_hubs_1.searchLocalIndianHubs)(trimmed).map((h) => this.hubToGeocoded(h));
        // 1. Try Google Maps Geocoding API if server key is configured
        if (env_1.env.GOOGLE_MAPS_SERVER_API_KEY) {
            try {
                const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&components=country:IN&key=${env_1.env.GOOGLE_MAPS_SERVER_API_KEY}`;
                const gData = await fetchJson(googleUrl);
                if (gData && gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
                    return gData.results.map((item) => {
                        const parsed = parseGoogleAddressComponents(item.address_components);
                        const lat = item.geometry.location.lat;
                        const lng = item.geometry.location.lng;
                        let accuracy = 'approximate';
                        if (item.geometry.location_type === 'ROOFTOP')
                            accuracy = 'rooftop';
                        else if (item.geometry.location_type === 'RANGE_INTERPOLATED')
                            accuracy = 'street';
                        else if (item.geometry.location_type === 'GEOMETRIC_CENTER')
                            accuracy = 'locality';
                        else if (item.geometry.location_type === 'APPROXIMATE')
                            accuracy = 'city';
                        const nameParts = [parsed.building, parsed.street, parsed.locality, parsed.city].filter(Boolean);
                        const name = nameParts.length > 0 ? nameParts.slice(0, 3).join(', ') : item.formatted_address;
                        return {
                            id: item.place_id || `google-${Math.random().toString(36).substring(2, 9)}`,
                            name,
                            street: parsed.street,
                            building: parsed.building,
                            locality: parsed.locality,
                            city: parsed.city,
                            state: parsed.state,
                            pincode: parsed.pincode,
                            country: parsed.country,
                            coordinates: [lng, lat],
                            formatted: item.formatted_address,
                            accuracy,
                            isCustom: true,
                            placeId: item.place_id,
                        };
                    });
                }
            }
            catch (err) {
                console.warn('⚠️ Google Maps Geocoding API failed, falling back to local/OSM:', err.message);
            }
        }
        const isPin = /^\d{6}$/.test(trimmed);
        // If we have several strong local matches and it's not a specific 6-digit PIN code search, return them immediately
        if (localMatches.length >= 3 && !isPin) {
            return localMatches;
        }
        // 2. Fallback to online search for Indian addresses / PIN codes via Nominatim
        try {
            const url = isPin
                ? `https://nominatim.openstreetmap.org/search?format=json&postalcode=${trimmed}&countrycodes=in&addressdetails=1&limit=5`
                : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${trimmed}, India`)}&countrycodes=in&addressdetails=1&limit=5`;
            const data = await fetchJson(url);
            if (Array.isArray(data) && data.length > 0) {
                const onlineResults = data.map((item) => {
                    const addr = item.address || {};
                    const street = addr.road || addr.street || '';
                    const building = addr.house_number || addr.building || addr.amenity || '';
                    const locality = addr.suburb ||
                        addr.neighbourhood ||
                        addr.residential ||
                        addr.city_district ||
                        addr.village ||
                        '';
                    const city = addr.city ||
                        addr.town ||
                        addr.county ||
                        addr.state_district ||
                        '';
                    const state = addr.state || '';
                    const pincode = addr.postcode || '';
                    const country = addr.country || 'India';
                    const lat = parseFloat(item.lat);
                    const lon = parseFloat(item.lon);
                    const displayNameParts = [building, street, locality, city, state].filter(Boolean);
                    const name = displayNameParts.length > 0 ? displayNameParts.slice(0, 3).join(', ') : item.display_name.split(',').slice(0, 3).join(', ');
                    let accuracy = 'approximate';
                    if (building) {
                        accuracy = 'rooftop';
                    }
                    else if (street) {
                        accuracy = 'street';
                    }
                    else if (locality) {
                        accuracy = 'locality';
                    }
                    else if (city) {
                        accuracy = 'city';
                    }
                    return {
                        id: `osm-${item.place_id || Math.random().toString(36).substring(2, 9)}`,
                        name,
                        street,
                        building,
                        locality: locality || city,
                        city: city || locality,
                        state,
                        pincode,
                        country,
                        coordinates: [lon, lat],
                        formatted: item.display_name,
                        accuracy,
                        isCustom: true,
                        placeId: item.place_id ? String(item.place_id) : undefined,
                    };
                });
                // Merge local matches with online results, deduplicating by approximate coordinates
                const combined = [...localMatches];
                for (const res of onlineResults) {
                    const exists = combined.some((c) => Math.abs(c.coordinates[0] - res.coordinates[0]) < 0.01 &&
                        Math.abs(c.coordinates[1] - res.coordinates[1]) < 0.01);
                    if (!exists) {
                        combined.push(res);
                    }
                }
                return combined.slice(0, 10);
            }
        }
        catch {
            // Fallback silently to local matches
        }
        return localMatches;
    }
    /**
     * Reverse geocode coordinates (lat, lng) to an Indian location.
     */
    static async reverseGeocode(lat, lng) {
        // 1. Try Google Maps Reverse Geocoding if key configured
        if (env_1.env.GOOGLE_MAPS_SERVER_API_KEY) {
            try {
                const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${env_1.env.GOOGLE_MAPS_SERVER_API_KEY}`;
                const gData = await fetchJson(googleUrl);
                if (gData && gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
                    const top = gData.results[0];
                    const parsed = parseGoogleAddressComponents(top.address_components);
                    let accuracy = 'approximate';
                    if (top.geometry.location_type === 'ROOFTOP')
                        accuracy = 'rooftop';
                    else if (top.geometry.location_type === 'RANGE_INTERPOLATED')
                        accuracy = 'street';
                    else if (top.geometry.location_type === 'GEOMETRIC_CENTER')
                        accuracy = 'locality';
                    else if (top.geometry.location_type === 'APPROXIMATE')
                        accuracy = 'city';
                    const nameParts = [parsed.building, parsed.street, parsed.locality, parsed.city].filter(Boolean);
                    const name = nameParts.length > 0 ? nameParts.slice(0, 3).join(', ') : top.formatted_address;
                    return {
                        id: top.place_id || `google-rev-${Date.now()}`,
                        name,
                        street: parsed.street,
                        building: parsed.building,
                        locality: parsed.locality,
                        city: parsed.city,
                        state: parsed.state,
                        pincode: parsed.pincode,
                        country: parsed.country,
                        coordinates: [lng, lat],
                        formatted: top.formatted_address,
                        accuracy,
                        isCustom: true,
                        placeId: top.place_id,
                    };
                }
            }
            catch (err) {
                console.warn('⚠️ Google Maps Reverse Geocode failed, falling back to local/OSM:', err.message);
            }
        }
        // 2. Attempt online reverse geocode via OSM Nominatim
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
            const data = await fetchJson(url);
            if (data && data.address) {
                const addr = data.address;
                const street = addr.road || addr.street || '';
                const building = addr.house_number || addr.building || addr.amenity || '';
                const locality = addr.suburb ||
                    addr.neighbourhood ||
                    addr.residential ||
                    addr.city_district ||
                    addr.village ||
                    '';
                const city = addr.city ||
                    addr.town ||
                    addr.county ||
                    addr.state_district ||
                    '';
                const state = addr.state || '';
                const pincode = addr.postcode || '';
                const country = addr.country || 'India';
                const nameParts = [building, street, locality, city, state].filter(Boolean);
                const name = nameParts.length > 0 ? nameParts.slice(0, 3).join(', ') : `${city || locality || 'Current Location'}, ${state}`;
                let accuracy = 'approximate';
                if (building) {
                    accuracy = 'rooftop';
                }
                else if (street) {
                    accuracy = 'street';
                }
                else if (locality) {
                    accuracy = 'locality';
                }
                else if (city) {
                    accuracy = 'city';
                }
                return {
                    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    name,
                    street,
                    building,
                    locality: locality || city,
                    city: city || locality,
                    state,
                    pincode,
                    country,
                    coordinates: [lng, lat],
                    formatted: data.display_name || `${name}, ${state}, ${country}`,
                    accuracy,
                    isCustom: true,
                    placeId: data.place_id ? String(data.place_id) : undefined,
                };
            }
        }
        catch {
            // Fall back to nearest known Indian production hub
        }
        // 3. Fallback: match to nearest known Indian hub
        const nearest = (0, indian_hubs_1.findNearestIndianHub)(lng, lat);
        return {
            ...this.hubToGeocoded(nearest.hub),
            coordinates: [lng, lat],
            accuracy: 'approximate',
            isCustom: true,
        };
    }
    static hubToGeocoded(hub) {
        const formatted = hub.locality
            ? `${hub.locality}, ${hub.city}, ${hub.state}${hub.pincode ? ` - ${hub.pincode}` : ''}`
            : `${hub.city}, ${hub.state}`;
        return {
            id: hub.id,
            name: hub.name,
            street: '',
            building: '',
            locality: hub.locality,
            city: hub.city,
            state: hub.state,
            pincode: hub.pincode,
            country: 'India',
            coordinates: hub.coordinates,
            formatted,
            accuracy: 'city',
            isCustom: false,
        };
    }
}
exports.GeocodingService = GeocodingService;
//# sourceMappingURL=geocoding.service.js.map