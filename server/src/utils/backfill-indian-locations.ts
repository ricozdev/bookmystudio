import mongoose from 'mongoose';
import { Studio } from '../models/studio.model';
import { FilmingLocationModel } from '../models/location.model';
import { ProfessionalProfile } from '../models/professional.model';
import { Equipment } from '../models/equipment.model';
import { GeocodingService } from '../services/geocoding.service';

/**
 * Sanitized location backfill:
 * Only updates coordinates if a legitimate geocoding match is discovered
 * from the listing's existing location text or address fields.
 * Never fabricates or invents arbitrary coordinates.
 */
export async function backfillIndianLocations() {
  console.log('Starting sanitized location backfill...');

  // 1. Backfill Studios missing locationGeo
  const studios = await Studio.find({
    $or: [
      { locationGeo: { $exists: false } },
      { 'locationGeo.coordinates': { $exists: false } },
      { 'locationGeo.coordinates': { $size: 0 } },
    ],
  });

  console.log(`Checking ${studios.length} studios for address geocoding...`);
  for (const s of studios) {
    const query = s.locationAddress?.formatted || s.location || s.submarket || '';
    if (query.trim()) {
      try {
        const matches = await GeocodingService.searchLocations(query);
        if (matches.length > 0 && matches[0].coordinates) {
          const match = matches[0];
          s.locationGeo = {
            type: 'Point',
            coordinates: match.coordinates,
          };
          if (!s.locationAddress || !s.locationAddress.city) {
            s.locationAddress = {
              formatted: match.formatted || match.name,
              locality: match.locality || s.submarket || '',
              city: match.city || s.location || '',
              state: match.state || '',
              pincode: match.pincode || '',
              accuracy: match.accuracy,
            };
          }
          await s.save();
          console.log(`Geocoded studio "${s.name}" -> [${match.coordinates}] (${match.formatted})`);
        }
      } catch (err) {
        console.warn(`Could not geocode studio "${s.name}":`, err);
      }
    }
  }

  // 2. Backfill Filming Locations missing locationGeo
  const locations = await FilmingLocationModel.find({
    $or: [
      { locationGeo: { $exists: false } },
      { 'locationGeo.coordinates': { $exists: false } },
      { 'locationGeo.coordinates': { $size: 0 } },
    ],
  });

  console.log(`Checking ${locations.length} filming locations for address geocoding...`);
  for (const l of locations) {
    const query = l.locationAddress?.formatted || l.location || l.submarket || '';
    if (query.trim()) {
      try {
        const matches = await GeocodingService.searchLocations(query);
        if (matches.length > 0 && matches[0].coordinates) {
          const match = matches[0];
          l.locationGeo = {
            type: 'Point',
            coordinates: match.coordinates,
          };
          if (!l.locationAddress || !l.locationAddress.city) {
            l.locationAddress = {
              formatted: match.formatted || match.name,
              locality: match.locality || l.submarket || '',
              city: match.city || l.location || '',
              state: match.state || '',
              pincode: match.pincode || '',
              accuracy: match.accuracy,
            };
          }
          await l.save();
          console.log(`Geocoded filming location "${l.name}" -> [${match.coordinates}] (${match.formatted})`);
        }
      } catch (err) {
        console.warn(`Could not geocode filming location "${l.name}":`, err);
      }
    }
  }

  // 3. Backfill Crew missing locationGeo
  const crew = await ProfessionalProfile.find({
    $or: [
      { locationGeo: { $exists: false } },
      { 'locationGeo.coordinates': { $exists: false } },
      { 'locationGeo.coordinates': { $size: 0 } },
    ],
  });

  console.log(`Checking ${crew.length} crew profiles for address geocoding...`);
  for (const c of crew) {
    const query = c.locationAddress?.formatted || c.location || '';
    if (query.trim()) {
      try {
        const matches = await GeocodingService.searchLocations(query);
        if (matches.length > 0 && matches[0].coordinates) {
          const match = matches[0];
          c.locationGeo = {
            type: 'Point',
            coordinates: match.coordinates,
          };
          if (!c.locationAddress || !c.locationAddress.city) {
            c.locationAddress = {
              formatted: match.formatted || match.name,
              locality: match.locality || '',
              city: match.city || c.location || '',
              state: match.state || '',
              pincode: match.pincode || '',
              accuracy: match.accuracy,
            };
          }
          await c.save();
          console.log(`Geocoded crew "${c.name}" -> [${match.coordinates}] (${match.formatted})`);
        }
      } catch (err) {
        console.warn(`Could not geocode crew "${c.name}":`, err);
      }
    }
  }

  // 4. Backfill Equipment missing locationGeo
  const equipment = await Equipment.find({
    $or: [
      { locationGeo: { $exists: false } },
      { 'locationGeo.coordinates': { $exists: false } },
      { 'locationGeo.coordinates': { $size: 0 } },
    ],
  });

  console.log(`Checking ${equipment.length} equipment items for address geocoding...`);
  for (const e of equipment) {
    const query = e.locationAddress?.formatted || e.pickupLocation || e.location || '';
    if (query.trim()) {
      try {
        const matches = await GeocodingService.searchLocations(query);
        if (matches.length > 0 && matches[0].coordinates) {
          const match = matches[0];
          e.locationGeo = {
            type: 'Point',
            coordinates: match.coordinates,
          };
          if (!e.locationAddress || !e.locationAddress.city) {
            e.locationAddress = {
              formatted: match.formatted || match.name,
              locality: match.locality || '',
              city: match.city || e.location || '',
              state: match.state || '',
              pincode: match.pincode || '',
              accuracy: match.accuracy,
            };
          }
          await e.save();
          console.log(`Geocoded equipment "${e.name}" -> [${match.coordinates}] (${match.formatted})`);
        }
      } catch (err) {
        console.warn(`Could not geocode equipment "${e.name}":`, err);
      }
    }
  }

  console.log('Sanitized location backfill check complete.');
}

if (require.main === module) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookmystudio';
  mongoose
    .connect(uri)
    .then(async () => {
      console.log('Connected to MongoDB. Running backfill...');
      await backfillIndianLocations();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Backfill error:', err);
      process.exit(1);
    });
}

