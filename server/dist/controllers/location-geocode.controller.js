"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationGeocodeController = void 0;
const geocoding_service_1 = require("../services/geocoding.service");
const indian_hubs_1 = require("../utils/indian-hubs");
class LocationGeocodeController {
    static async search(req, res) {
        try {
            const q = typeof req.query.q === 'string' ? req.query.q : '';
            const results = await geocoding_service_1.GeocodingService.searchLocations(q);
            res.json({ success: true, data: results });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Location search failed' });
        }
    }
    static async reverse(req, res) {
        try {
            const lat = parseFloat(req.query.lat);
            const lng = parseFloat(req.query.lng);
            if (isNaN(lat) || isNaN(lng)) {
                return res.status(400).json({ success: false, message: 'Valid lat and lng are required' });
            }
            const result = await geocoding_service_1.GeocodingService.reverseGeocode(lat, lng);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Reverse geocoding failed' });
        }
    }
    static async getHubs(_req, res) {
        try {
            res.json({
                success: true,
                data: {
                    allIndia: indian_hubs_1.NEUTRAL_ALL_INDIA_HUB,
                    defaultLocation: indian_hubs_1.DEFAULT_LOCATION,
                    popularHubs: indian_hubs_1.INDIAN_PRODUCTION_HUBS.filter((h) => h.isPopularHub),
                    allHubs: indian_hubs_1.INDIAN_PRODUCTION_HUBS,
                },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch hubs' });
        }
    }
}
exports.LocationGeocodeController = LocationGeocodeController;
//# sourceMappingURL=location-geocode.controller.js.map