import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { FilmingLocationModel } from '../models/location.model';
import { generateSlug } from '../utils/slug';
import { parseGeoQueryParams, buildGeoFilter, attachDistanceAndSort } from '../utils/geo-query';
import { GeocodingService } from '../services/geocoding.service';
import { validateListingLocation, isValidGoogleMapsUrl, extractCoordinatesFromGoogleMapsUrl } from '../utils/location-validation';

export async function getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = 'recommended',
    } = req.query as any;

    const query: any = {
      $and: [
        { publicationStatus: 'published' },
        { reviewStatus: { $nin: ['SUSPENDED', 'REJECTED'] } },
      ],
    };

    const { coords, radiusKm } = parseGeoQueryParams(req.query);
    const geoFilter = buildGeoFilter(coords, radiusKm);
    if (geoFilter.locationGeo) {
      query.locationGeo = geoFilter.locationGeo;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (location && location !== 'all') {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { submarket: { $regex: location, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.dayRate10h = {};
      if (minPrice) query.dayRate10h.$gte = Number(minPrice);
      if (maxPrice) query.dayRate10h.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$and.push({
        $or: [
          { name: regex },
          { description: regex },
          { location: regex },
          { submarket: regex },
        ],
      });
    }

    const sortOption: any = {};
    if (sort === 'price_asc') sortOption.dayRate10h = 1;
    else if (sort === 'price_desc') sortOption.dayRate10h = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [locations, total] = await Promise.all([
      FilmingLocationModel.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
      FilmingLocationModel.countDocuments(query),
    ]);

    const serialized = locations.map((l) => l.toJSON());
    const enriched = attachDistanceAndSort(serialized, coords, sort);

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      locationMeta: {
        hasCoords: Boolean(coords),
        radiusKm,
        center: coords ? { lng: coords[0], lat: coords[1] } : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLocationBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slugOrId } = req.params;
    const cleanId = decodeURIComponent(slugOrId).trim();

    let location = null;
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      location = await FilmingLocationModel.findById(cleanId);
    }
    if (!location) {
      location = await FilmingLocationModel.findOne({ slug: cleanId.toLowerCase() });
    }

    if (!location) {
      res.status(404).json({
        success: false,
        error: `Filming location '${cleanId}' not found.`,
        code: 'LOCATION_NOT_FOUND',
      });
      return;
    }

    const isPublished =
      (location.publicationStatus === 'published' || !location.publicationStatus) &&
      !['SUSPENDED', 'REJECTED'].includes(location.reviewStatus);

    if (!isPublished) {
      const isOwner =
        req.user &&
        location.owner &&
        (req.user._id.toString() === location.owner.toString() ||
          req.user._id.toString() === ((location.owner as any)._id?.toString() || ''));
      const isAdmin = req.user && req.user.roles.includes('ADMIN');

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'This filming location is currently unpublished or pending verification.',
          code: 'LISTING_UNPUBLISHED',
          publicationStatus: location.publicationStatus,
          reviewStatus: location.reviewStatus,
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: location.toJSON(),
      isDraftPreview: !isPublished,
    });
  } catch (error) {
    next(error);
  }
}

export async function createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    let slug = req.body.slug ? generateSlug(req.body.slug) : generateSlug(req.body.name);
    const existing = await FilmingLocationModel.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const isDraft = Boolean(req.body.isDraft);

    let locationGeo = req.body.locationGeo;
    let locationAddress = req.body.locationAddress;
    const hasValidCoords =
      locationGeo &&
      Array.isArray(locationGeo.coordinates) &&
      locationGeo.coordinates.length === 2 &&
      !isNaN(locationGeo.coordinates[0]) &&
      !isNaN(locationGeo.coordinates[1]);

    if (!hasValidCoords) {
      // Attempt geocoding of user's entered location string without silent fallbacks
      const locationQuery = req.body.location || '';
      let match = null;
      if (locationQuery.trim()) {
        try {
          const matches = await GeocodingService.searchLocations(locationQuery);
          if (matches.length > 0 && matches[0].coordinates) {
            match = matches[0];
          }
        } catch {
          // Geocoding failure - leave match as null
        }
      }

      if (match) {
        locationGeo = {
          type: 'Point',
          coordinates: match.coordinates,
        };
        if (!locationAddress || !locationAddress.city) {
          locationAddress = {
            formatted: match.formatted || match.name,
            locality: match.locality,
            city: match.city,
            state: match.state,
            pincode: match.pincode,
          };
        }
      } else {
        locationGeo = undefined;
        if (!locationAddress) {
          locationAddress = {
            formatted: req.body.location || '',
            locality: req.body.submarket || '',
            city: req.body.location || '',
            state: '',
            pincode: '',
          };
        }
      }
    }

    const rawMapUrl = (req.body.mapUrl || req.body.locationAddress?.mapUrl || '').trim();
    if (rawMapUrl && !isValidGoogleMapsUrl(rawMapUrl)) {
      res.status(400).json({
        success: false,
        error: 'The provided Google Maps location link is invalid. Please paste a valid Google Maps URL.',
        code: 'INVALID_MAPS_URL',
      });
      return;
    }

    if (rawMapUrl && (!locationGeo || !locationGeo.coordinates)) {
      const extractedCoords = extractCoordinatesFromGoogleMapsUrl(rawMapUrl);
      if (extractedCoords) {
        locationGeo = {
          type: 'Point',
          coordinates: extractedCoords,
        };
      }
    }

    if (locationAddress) {
      locationAddress.mapUrl = rawMapUrl || null;
    }

    if (!isDraft) {
      const validation = validateListingLocation('location', locationGeo, locationAddress, {
        location: req.body.location,
        submarket: req.body.submarket,
        mapUrl: rawMapUrl,
      });
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Cannot publish filming location listing: complete location details are required before publication.',
          missingFields: validation.missingFields,
          details: validation.errors,
        });
        return;
      }
    }

    const locationData = {
      ...req.body,
      slug,
      owner: req.user._id,
      categoryLabel: req.body.categoryLabel || req.body.category.toUpperCase(),
      locationGeo,
      locationAddress: locationAddress ? { ...locationAddress, mapUrl: rawMapUrl || null } : { mapUrl: rawMapUrl || null },
      mapUrl: rawMapUrl || null,
      publicationStatus: isDraft ? 'draft' : 'published',
      reviewStatus: isDraft ? 'DRAFT' : 'APPROVED',
      submittedAt: isDraft ? null : new Date(),
      reviewFeedback: null,
    };

    const location = new FilmingLocationModel(locationData);
    await location.save();

    // Ensure host role
    if (!req.user.roles.includes('STUDIO_OWNER') && !req.user.roles.includes('ADMIN')) {
      req.user.roles.push('STUDIO_OWNER');
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: isDraft
        ? 'Location listing saved as draft.'
        : 'Location listing published successfully and is now live in the directory.',
      data: location.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { slugOrId } = req.params;

    let location = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      location = await FilmingLocationModel.findById(slugOrId);
    }
    if (!location) {
      location = await FilmingLocationModel.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!location) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    // Ownership or Admin
    const isOwner = location.owner && location.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this location listing.',
        code: 'UNAUTHORIZED_ACCESS',
      });
      return;
    }

    const updates = { ...req.body };
    delete updates.owner;
    delete updates._id;

    const updateMapUrl = updates.mapUrl !== undefined ? updates.mapUrl : updates.locationAddress?.mapUrl;
    if (updateMapUrl !== undefined && updateMapUrl !== null) {
      const trimmedMapUrl = String(updateMapUrl).trim();
      if (trimmedMapUrl && !isValidGoogleMapsUrl(trimmedMapUrl)) {
        res.status(400).json({
          success: false,
          error: 'The provided Google Maps location link is invalid. Please paste a valid Google Maps URL.',
          code: 'INVALID_MAPS_URL',
        });
        return;
      }
      updates.mapUrl = trimmedMapUrl || null;
      if (updates.locationAddress) {
        updates.locationAddress.mapUrl = trimmedMapUrl || null;
      }
    }

    const checkMapUrl = updates.mapUrl !== undefined ? updates.mapUrl : (location.mapUrl || location.locationAddress?.mapUrl);

    if (req.body.isDraft !== undefined) {
      const isDraft = Boolean(req.body.isDraft);
      updates.publicationStatus = isDraft ? 'draft' : 'published';
      updates.reviewStatus = isDraft ? 'DRAFT' : 'APPROVED';
      if (!isDraft) {
        const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : location.locationGeo;
        const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : location.locationAddress;
        const validation = validateListingLocation('location', checkGeo, checkAddr, {
          location: updates.location || location.location,
          submarket: updates.submarket || location.submarket,
          mapUrl: checkMapUrl,
        });
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Cannot publish filming location listing: complete location details are required before publication.',
            missingFields: validation.missingFields,
            details: validation.errors,
          });
          return;
        }
        updates.submittedAt = updates.submittedAt || new Date();
        updates.reviewFeedback = null;
      }
    } else if (req.body.publicationStatus) {
      updates.publicationStatus = req.body.publicationStatus;
      if (req.body.publicationStatus === 'published') {
        const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : location.locationGeo;
        const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : location.locationAddress;
        const validation = validateListingLocation('location', checkGeo, checkAddr, {
          location: updates.location || location.location,
          submarket: updates.submarket || location.submarket,
          mapUrl: checkMapUrl,
        });
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Cannot publish filming location listing: complete location details are required before publication.',
            missingFields: validation.missingFields,
            details: validation.errors,
          });
          return;
        }
        updates.reviewStatus = 'APPROVED';
        updates.submittedAt = updates.submittedAt || new Date();
        updates.reviewFeedback = null;
      } else if (req.body.publicationStatus === 'draft') {
        updates.reviewStatus = 'DRAFT';
      }
    }

    Object.assign(location, updates);
    await location.save();

    res.status(200).json({
      success: true,
      message: 'Location listing updated successfully.',
      data: location.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { slugOrId } = req.params;

    let location = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      location = await FilmingLocationModel.findById(slugOrId);
    }
    if (!location) {
      location = await FilmingLocationModel.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!location) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    const isOwner = location.owner && location.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this location listing.',
        code: 'UNAUTHORIZED_ACCESS',
      });
      return;
    }

    await location.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Location listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
