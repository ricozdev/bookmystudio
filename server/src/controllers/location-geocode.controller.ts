import { Request, Response } from 'express';
import { GeocodingService } from '../services/geocoding.service';
import { DEFAULT_LOCATION, NEUTRAL_ALL_INDIA_HUB, INDIAN_PRODUCTION_HUBS } from '../utils/indian-hubs';

export class LocationGeocodeController {
  static async search(req: Request, res: Response) {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const results = await GeocodingService.searchLocations(q);
      res.json({ success: true, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Location search failed' });
    }
  }

  static async reverse(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ success: false, message: 'Valid lat and lng are required' });
      }

      const result = await GeocodingService.reverseGeocode(lat, lng);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Reverse geocoding failed' });
    }
  }

  static async getHubs(_req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          allIndia: NEUTRAL_ALL_INDIA_HUB,
          defaultLocation: DEFAULT_LOCATION,
          popularHubs: INDIAN_PRODUCTION_HUBS.filter((h) => h.isPopularHub),
          allHubs: INDIAN_PRODUCTION_HUBS,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch hubs' });
    }
  }
}

