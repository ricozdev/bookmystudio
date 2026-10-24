import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Studio } from '../models/studio.model';
import { generateSlug } from '../utils/slug';
import { parseGeoQueryParams, buildGeoFilter, attachDistanceAndSort } from '../utils/geo-query';
import { GeocodingService } from '../services/geocoding.service';
import { validateListingLocation, isValidGoogleMapsUrl, extractCoordinatesFromGoogleMapsUrl } from '../utils/location-validation';

export async function getStudios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minSqFt,
      camlockPower,
      driveInAccess,
      stc60Certified,
      northDaylight,
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

    if (minSqFt) {
      query['specs.sqFt'] = { $gte: Number(minSqFt) };
    }

    if (camlockPower === 'true' || camlockPower === true) {
      query['features.camlockPower'] = true;
    }
    if (driveInAccess === 'true' || driveInAccess === true) {
      query['features.driveInAccess'] = true;
    }
    if (stc60Certified === 'true' || stc60Certified === true) {
      query['features.stc60Certified'] = true;
    }
    if (northDaylight === 'true' || northDaylight === true) {
      query['features.northDaylight'] = true;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: regex },
          { description: regex },
          { location: regex },
          { submarket: regex },
          { equipmentHighlight: regex },
        ],
      });
    }

    const sortOption: any = {};
    if (sort === 'price_asc') sortOption.dayRate10h = 1;
    else if (sort === 'price_desc') sortOption.dayRate10h = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'sqft_desc') sortOption['specs.sqFt'] = -1;
    else sortOption.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [studios, total] = await Promise.all([
      Studio.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
      Studio.countDocuments(query),
    ]);

    const serialized = studios.map((s) => s.toJSON());
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

export async function getStudioBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slugOrId } = req.params;
    const cleanId = decodeURIComponent(slugOrId).trim();

    let studio = null;
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      studio = await Studio.findById(cleanId);
    }
    if (!studio) {
      studio = await Studio.findOne({ slug: cleanId.toLowerCase() });
    }

    if (!studio) {
      res.status(404).json({
        success: false,
        error: `Studio with identifier '${cleanId}' not found.`,
        code: 'STUDIO_NOT_FOUND',
      });
      return;
    }

    const isPublished =
      (studio.publicationStatus === 'published' || !studio.publicationStatus) &&
      !['SUSPENDED', 'REJECTED'].includes(studio.reviewStatus);

    if (!isPublished) {
      const isOwner =
        req.user &&
        studio.owner &&
        (req.user._id.toString() === studio.owner.toString() ||
          req.user._id.toString() === ((studio.owner as any)._id?.toString() || ''));
      const isAdmin = req.user && req.user.roles.includes('ADMIN');

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'This production stage is currently unpublished or pending verification.',
          code: 'LISTING_UNPUBLISHED',
          publicationStatus: studio.publicationStatus,
          reviewStatus: studio.reviewStatus,
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: studio.toJSON(),
      isDraftPreview: !isPublished,
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    let slug = req.body.slug ? generateSlug(req.body.slug) : generateSlug(req.body.name);
    const existing = await Studio.findOne({ slug });
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
      const validation = validateListingLocation('studio', locationGeo, locationAddress, {
        location: req.body.location,
        submarket: req.body.submarket,
        mapUrl: rawMapUrl,
      });
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Cannot publish studio listing: complete location details are required before publication.',
          missingFields: validation.missingFields,
          details: validation.errors,
        });
        return;
      }
    }

    const studioData = {
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

    const studio = new Studio(studioData);
    await studio.save();

    // Ensure user has host role if not already
    if (!req.user.roles.includes('STUDIO_OWNER') && !req.user.roles.includes('ADMIN')) {
      req.user.roles.push('STUDIO_OWNER');
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: isDraft
        ? 'Studio listing saved as draft.'
        : 'Studio listing published successfully and is now live in the directory.',
      data: studio.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { slugOrId } = req.params;

    let studio = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      studio = await Studio.findById(slugOrId);
    }
    if (!studio) {
      studio = await Studio.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!studio) {
      res.status(404).json({ success: false, error: 'Studio not found' });
      return;
    }

    // Authorization: Owner or Admin
    const isOwner = studio.owner && studio.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this studio listing.',
        code: 'UNAUTHORIZED_ACCESS',
      });
      return;
    }

    const updates = { ...req.body };
    delete updates.owner; // Never allow transfer of owner via update body
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

    const checkMapUrl = updates.mapUrl !== undefined ? updates.mapUrl : (studio.mapUrl || studio.locationAddress?.mapUrl);

    if (req.body.isDraft !== undefined) {
      const isDraft = Boolean(req.body.isDraft);
      updates.publicationStatus = isDraft ? 'draft' : 'published';
      updates.reviewStatus = isDraft ? 'DRAFT' : 'APPROVED';
      if (!isDraft) {
        const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : studio.locationGeo;
        const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : studio.locationAddress;
        const validation = validateListingLocation('studio', checkGeo, checkAddr, {
          location: updates.location || studio.location,
          submarket: updates.submarket || studio.submarket,
          mapUrl: checkMapUrl,
        });
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Cannot publish studio listing: complete location details are required before publication.',
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
        const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : studio.locationGeo;
        const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : studio.locationAddress;
        const validation = validateListingLocation('studio', checkGeo, checkAddr, {
          location: updates.location || studio.location,
          submarket: updates.submarket || studio.submarket,
          mapUrl: checkMapUrl,
        });
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Cannot publish studio listing: complete location details are required before publication.',
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

    Object.assign(studio, updates);
    await studio.save();

    res.status(200).json({
      success: true,
      message: 'Studio listing updated successfully.',
      data: studio.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { slugOrId } = req.params;

    let studio = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      studio = await Studio.findById(slugOrId);
    }
    if (!studio) {
      studio = await Studio.findOne({ slug: slugOrId.toLowerCase() });
    }

    if (!studio) {
      res.status(404).json({ success: false, error: 'Studio not found' });
      return;
    }

    const isOwner = studio.owner && studio.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this studio listing.',
        code: 'UNAUTHORIZED_ACCESS',
      });
      return;
    }

    await Studio.findByIdAndDelete(studio._id);

    res.status(200).json({
      success: true,
      message: 'Studio listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudioCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawCategories = await Studio.aggregate([
      { $match: { reviewStatus: 'APPROVED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categoryMetadata: Record<string, { name: string; description: string; iconName: string }> = {
      cyclorama: {
        name: 'Cycloramas',
        description: '1 & 2-wall seamless infinity coves',
        iconName: 'cyclorama',
      },
      soundstage: {
        name: 'Soundstages',
        description: 'STC 60+ certified acoustic stages',
        iconName: 'soundstage',
      },
      podcast: {
        name: 'Podcast Suites',
        description: 'Turnkey multi-cam broadcast bays',
        iconName: 'mic',
      },
      daylight: {
        name: 'Daylight Lofts',
        description: 'Factory sash & natural skylights',
        iconName: 'sun',
      },
      kitchen: {
        name: 'Kitchen Stages',
        description: 'Working island ranges & culinary bays',
        iconName: 'kitchen',
      },
      industrial: {
        name: 'Industrial Silos',
        description: 'Clear span warehouse locations',
        iconName: 'warehouse',
      },
    };

    const categories = rawCategories.map((item) => {
      const key = item._id || 'general';
      const meta = categoryMetadata[key] || {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        description: 'Certified commercial production spaces',
        iconName: 'soundstage',
      };
      return {
        id: `cat-${key}`,
        categoryKey: key,
        name: meta.name,
        count: item.count,
        description: meta.description,
        iconName: meta.iconName,
      };
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

