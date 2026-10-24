"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGeoQueryParams = parseGeoQueryParams;
exports.buildGeoFilter = buildGeoFilter;
exports.attachDistanceAndSort = attachDistanceAndSort;
const indian_hubs_1 = require("./indian-hubs");
function parseGeoQueryParams(query) {
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    const radiusParam = query.radiusKm;
    let coords = null;
    if (!isNaN(lat) && !isNaN(lng)) {
        coords = [lng, lat];
    }
    let radiusKm = 'all';
    if (radiusParam !== undefined && radiusParam !== null && radiusParam !== '') {
        if (radiusParam === 'all' || radiusParam === 'ALL') {
            radiusKm = 'all';
        }
        else {
            const parsed = parseFloat(radiusParam);
            if (!isNaN(parsed) && parsed > 0) {
                radiusKm = parsed;
            }
        }
    }
    return { coords, radiusKm };
}
function buildGeoFilter(coords, radiusKm) {
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
function attachDistanceAndSort(items, coords, sort) {
    if (!coords) {
        return items;
    }
    const enriched = items.map((item) => {
        let distanceKm = null;
        const itemCoords = item.locationGeo?.coordinates;
        if (Array.isArray(itemCoords) && itemCoords.length === 2 && !isNaN(itemCoords[0]) && !isNaN(itemCoords[1])) {
            distanceKm = (0, indian_hubs_1.calculateHaversineDistanceKm)(coords, [itemCoords[0], itemCoords[1]]);
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
            if (a.distanceKm !== null)
                return -1;
            if (b.distanceKm !== null)
                return 1;
            return 0;
        });
    }
    return enriched;
}
//# sourceMappingURL=geo-query.js.map