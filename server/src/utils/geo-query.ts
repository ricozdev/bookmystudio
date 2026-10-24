import { calculateHaversineDistanceKm } from './indian-hubs';

export interface GeoParams {
  coords: [number, number] | null; // [lng, lat]
  radiusKm: number | 'all';
}

export function parseGeoQueryParams(query: any): GeoParams {
  const lat = parseFloat(query.lat);
  const lng = parseFloat(query.lng);
  const radiusParam = query.radiusKm;

  let coords: [number, number] | null = null;
  if (!isNaN(lat) && !isNaN(lng)) {
    coords = [lng, lat];
  }

  let radiusKm: number | 'all' = 'all';
  if (radiusParam !== undefined && radiusParam !== null && radiusParam !== '') {
    if (radiusParam === 'all' || radiusParam === 'ALL') {
      radiusKm = 'all';
    } else {
      const parsed = parseFloat(radiusParam);
      if (!isNaN(parsed) && parsed > 0) {
        radiusKm = parsed;
      }
    }
  }

  return { coords, radiusKm };
}

export function buildGeoFilter(coords: [number, number] | null, radiusKm: number | 'all'): any {
  if (!coords || radiusKm === 'all' || radiusKm <= 0) {
    return {};
  }

  // MongoDB $centerSphere takes [longitude, latitude] and radius in radians (radius / earth_radius_km)
  const radiusInRadians = radiusKm / 6378.1;
  return {
    locationGeo: {
      $geoWithin: {
        $centerSphere: [coords, radiusInRadians],
      },
    },
  };
}

export function attachDistanceAndSort<T extends Record<string, any>>(
  items: T[],
  coords: [number, number] | null,
  sort?: string
): T[] {
  if (!coords) {
    return items;
  }

  const enriched = items.map((item) => {
    let distanceKm: number | null = null;
    const itemCoords = item.locationGeo?.coordinates;
    if (Array.isArray(itemCoords) && itemCoords.length === 2 && !isNaN(itemCoords[0]) && !isNaN(itemCoords[1])) {
      distanceKm = calculateHaversineDistanceKm(coords, [itemCoords[0], itemCoords[1]]);
    }
    return {
      ...item,
      distanceKm,
    };
  });

  if (sort === 'nearest' || (!sort || sort === 'recommended')) {
    enriched.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });
  }

  return enriched;
}

