import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ProfessionalProfile } from '../models/professional.model';
import { generateSlug } from '../utils/slug';
import { parseGeoQueryParams, buildGeoFilter, attachDistanceAndSort } from '../utils/geo-query';
import { GeocodingService } from '../services/geocoding.service';
import { validateListingLocation, isValidGoogleMapsUrl, extractCoordinatesFromGoogleMapsUrl } from '../utils/location-validation';

export async function getProfessionals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      category,
      location,
      page = 1,
      limit = 20,
      sort = 'recommended',
    } = req.query as any;

    const { coords, radiusKm } = parseGeoQueryParams(req.query);

    const query: any = {
      $and: [
        { publicationStatus: 'published' },
        { reviewStatus: { $nin: ['SUSPENDED', 'REJECTED'] } },
      ],
    };

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
        { 'locationAddress.city': { $regex: location, $options: 'i' } },
        { 'locationAddress.locality': { $regex: location, $options: 'i' } },
      ];
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$and.push({
        $or: [
          { name: regex },
          { role: regex },
          { bio: regex },
          { skills: regex },
          { workingKit: regex },
        ],
      });
    }

    const sortOption: any = {};
    if (sort === 'price_asc') sortOption.dayRate10h = 1;
    else if (sort === 'price_desc') sortOption.dayRate10h = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [crew, total] = await Promise.all([
      ProfessionalProfile.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
      ProfessionalProfile.countDocuments(query),
    ]);

    const serialized = crew.map((c) => c.toJSON());
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

export async function getProfessionalBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slugOrId } = req.params;
    const cleanId = decodeURIComponent(slugOrId).trim();

    let crew = null;
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      crew = await ProfessionalProfile.findById(cleanId);
    }
    if (!crew) {
      crew = await ProfessionalProfile.findOne({ slug: cleanId.toLowerCase() });
    }

    if (!crew) {
      res.status(404).json({
        success: false,
        error: `Crew profile '${cleanId}' not found.`,
        code: 'CREW_NOT_FOUND',
      });
      return;
    }

    const isPublished =
      (crew.publicationStatus === 'published' || !crew.publicationStatus) &&
      !['SUSPENDED', 'REJECTED'].includes(crew.reviewStatus);

    if (!isPublished) {
      const isOwner =
        req.user &&
        crew.user &&
        (req.user._id.toString() === crew.user.toString() ||
          req.user._id.toString() === ((crew.user as any)._id?.toString() || ''));
      const isAdmin = req.user && req.user.roles.includes('ADMIN');

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'This crew profile is currently unpublished or pending verification.',
          code: 'LISTING_UNPUBLISHED',
          publicationStatus: crew.publicationStatus,
          reviewStatus: crew.reviewStatus,
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: crew.toJSON(),
      isDraftPreview: !isPublished,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    let slug = req.body.slug ? generateSlug(req.body.slug) : generateSlug(`${req.body.name}-${req.body.role}`);
    const existing = await ProfessionalProfile.findOne({ slug });
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
            formatted: match.formatted || `${match.locality}, ${match.city}`,
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
            locality: '',
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
      const validation = validateListingLocation('crew', locationGeo, locationAddress, {
        location: req.body.location,
        serviceRadiusKm: req.body.serviceRadiusKm,
        mapUrl: rawMapUrl,
      });
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Cannot publish professional profile: complete location details are required before publication.',
          missingFields: validation.missingFields,
          details: validation.errors,
        });
        return;
      }
    }

    const crewData = {
      ...req.body,
      slug,
      user: req.user._id,
      locationGeo,
      locationAddress: locationAddress ? { ...locationAddress, mapUrl: rawMapUrl || null } : { mapUrl: rawMapUrl || null },
      mapUrl: rawMapUrl || null,
      serviceRadiusKm: req.body.serviceRadiusKm || 50,
      publicationStatus: isDraft ? 'draft' : 'published',
      reviewStatus: isDraft ? 'DRAFT' : 'APPROVED',
      submittedAt: isDraft ? null : new Date(),
      reviewFeedback: null,
    };

    const crew = new ProfessionalProfile(crewData);
    await crew.save();

    // Ensure professional role
    if (!req.user.roles.includes('PROFESSIONAL') && !req.user.roles.includes('ADMIN')) {
      req.user.roles.push('PROFESSIONAL');
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: isDraft
        ? 'Professional profile saved as draft.'
        : 'Professional profile published successfully and is now live in the directory.',
      data: crew.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { slugOrId } = req.params;

    let crew = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      crew = await ProfessionalProfile.findById(slugOrId);
    }
    if (!crew) {
      crew = await ProfessionalProfile.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!crew) {
      res.status(404).json({ success: false, error: 'Crew profile not found' });
      return;
    }

    const isOwner = crew.user && crew.user.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this professional profile.',
        code: 'UNAUTHORIZED_ACCESS',
      });
      return;
    }

    const updates = { ...req.body };
    delete updates.user;
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

    const checkMapUrl = updates.mapUrl !== undefined ? updates.mapUrl : (crew.mapUrl || crew.locationAddress?.mapUrl);

    if (req.body.isDraft !== undefined) {
      const isDraft = Boolean(req.body.isDraft);
      updates.publicationStatus = isDraft ? 'draft' : 'published';
      updates.reviewStatus = isDraft ? 'DRAFT' : 'APPROVED';
      if (!isDraft) {
        const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : crew.locationGeo;
        const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : crew.locationAddress;
        const validation = validateListingLocation('crew', checkGeo, checkAddr, {
          location: updates.location || crew.location,
          serviceRadiusKm: updates.serviceRadiusKm !== undefined ? updates.serviceRadiusKm : crew.serviceRadiusKm,
          mapUrl: checkMapUrl,
        });
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Cannot publish professional profile: complete location details are required before publication.',
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
        const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : crew.locationGeo;
        const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : crew.locationAddress;
        const validation = validateListingLocation('crew', checkGeo, checkAddr, {
          location: updates.location || crew.location,
          serviceRadiusKm: updates.serviceRadiusKm !== undefined ? updates.serviceRadiusKm : crew.serviceRadiusKm,
          mapUrl: checkMapUrl,
        });
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Cannot publish professional profile: complete location details are required before publication.',
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

    Object.assign(crew, updates);
    await crew.save();

    res.status(200).json({
      success: true,
      message: 'Professional profile updated successfully.',
      data: crew.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { slugOrId } = req.params;

    let crew = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      crew = await ProfessionalProfile.findById(slugOrId);
    }
    if (!crew) {
      crew = await ProfessionalProfile.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!crew) {
      res.status(404).json({ success: false, error: 'Crew profile not found' });
      return;
    }

    const isOwner = crew.user && crew.user.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this professional profile.',
        code: 'UNAUTHORIZED_ACCESS',
      });
      return;
    }

    await crew.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Professional profile deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
