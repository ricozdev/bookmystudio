import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Studio } from '../models/studio.model';
import { FilmingLocationModel } from '../models/location.model';
import { ProfessionalProfile } from '../models/professional.model';
import { Equipment } from '../models/equipment.model';
import { BookingRequest } from '../models/booking.model';
import { validateListingLocation, isValidCoordinates, isValidGoogleMapsUrl, extractCoordinatesFromGoogleMapsUrl } from '../utils/location-validation';
import { GeocodingService } from '../services/geocoding.service';

export interface StandardizedListingSummary {
  id: string;
  type: 'studio' | 'location' | 'crew' | 'equipment';
  title: string;
  category: string;
  slug: string;
  thumbnail: string;
  rateLabel: string;
  location?: string;
  publicationStatus: string;
  submittedAt?: Date | null;
  updatedAt: Date;
  reviewStatus: string;
  reviewFeedback?: string | null;
  reviewedAt?: Date | null;
  raw: any;
}

export async function getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const userId = req.user._id;

    const [studios, locations, crew, equipment] = await Promise.all([
      Studio.find({ owner: userId }).sort({ updatedAt: -1 }),
      FilmingLocationModel.find({ owner: userId }).sort({ updatedAt: -1 }),
      ProfessionalProfile.find({ user: userId }).sort({ updatedAt: -1 }),
      Equipment.find({ owner: userId }).sort({ updatedAt: -1 }),
    ]);

    const items: StandardizedListingSummary[] = [
      ...studios.map((s) => ({
        id: s._id.toString(),
        type: 'studio' as const,
        title: s.name,
        category: s.categoryLabel || s.category,
        slug: s.slug,
        thumbnail: s.imageUrl || (s.galleryImages?.[0] ?? ''),
        rateLabel: `$${s.dayRate10h.toLocaleString()} / 10h`,
        location: s.location,
        publicationStatus: s.publicationStatus || (s.reviewStatus === 'DRAFT' ? 'draft' : 'published'),
        submittedAt: s.submittedAt,
        updatedAt: s.updatedAt,
        reviewStatus: s.reviewStatus || 'APPROVED',
        reviewFeedback: s.reviewFeedback,
        reviewedAt: s.reviewedAt,
        raw: s.toJSON(),
      })),
      ...locations.map((l) => ({
        id: l._id.toString(),
        type: 'location' as const,
        title: l.name,
        category: l.categoryLabel || l.category,
        slug: l.slug,
        thumbnail: l.imageUrl || (l.galleryImages?.[0] ?? ''),
        rateLabel: `$${l.dayRate10h.toLocaleString()} / 10h`,
        location: l.location,
        publicationStatus: l.publicationStatus || (l.reviewStatus === 'DRAFT' ? 'draft' : 'published'),
        submittedAt: l.submittedAt,
        updatedAt: l.updatedAt,
        reviewStatus: l.reviewStatus || 'APPROVED',
        reviewFeedback: l.reviewFeedback,
        reviewedAt: l.reviewedAt,
        raw: l.toJSON(),
      })),
      ...crew.map((c) => ({
        id: c._id.toString(),
        type: 'crew' as const,
        title: `${c.name} — ${c.role}`,
        category: c.category,
        slug: c.slug,
        thumbnail: c.imageUrl || (c.galleryImages?.[0] ?? ''),
        rateLabel: `$${c.dayRate10h.toLocaleString()} / 10h`,
        location: c.location,
        publicationStatus: c.publicationStatus || (c.reviewStatus === 'DRAFT' ? 'draft' : 'published'),
        submittedAt: c.submittedAt,
        updatedAt: c.updatedAt,
        reviewStatus: c.reviewStatus || 'APPROVED',
        reviewFeedback: c.reviewFeedback,
        reviewedAt: c.reviewedAt,
        raw: c.toJSON(),
      })),
      ...equipment.map((e) => ({
        id: e._id.toString(),
        type: 'equipment' as const,
        title: `${e.brand} ${e.name}`,
        category: e.categoryLabel || e.category,
        slug: e.slug,
        thumbnail: e.imageUrl || (e.galleryImages?.[0] ?? ''),
        rateLabel: `$${e.dayRate.toLocaleString()} / day`,
        publicationStatus: e.publicationStatus || (e.reviewStatus === 'DRAFT' ? 'draft' : 'published'),
        submittedAt: e.submittedAt,
        updatedAt: e.updatedAt,
        reviewStatus: e.reviewStatus || 'APPROVED',
        reviewFeedback: e.reviewFeedback,
        reviewedAt: e.reviewedAt,
        raw: e.toJSON(),
      })),
    ];

    // Sort by most recently updated
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.status(200).json({
      success: true,
      data: items,
      counts: {
        total: items.length,
        studios: studios.length,
        locations: locations.length,
        crew: crew.length,
        equipment: equipment.length,
        published: items.filter((i) => i.publicationStatus === 'published' || i.reviewStatus === 'APPROVED').length,
        drafts: items.filter((i) => i.publicationStatus === 'draft' || i.reviewStatus === 'DRAFT').length,
        pendingReview: items.filter((i) => i.reviewStatus === 'PENDING_REVIEW').length,
        approved: items.filter((i) => i.reviewStatus === 'APPROVED' || i.publicationStatus === 'published').length,
        changesRequested: items.filter((i) => i.reviewStatus === 'CHANGES_REQUESTED').length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function publishListing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { type, id } = req.params;
    let listing: any = null;

    if (type === 'studio') {
      listing = await Studio.findOne({ _id: id, owner: req.user._id });
    } else if (type === 'location') {
      listing = await FilmingLocationModel.findOne({ _id: id, owner: req.user._id });
    } else if (type === 'crew') {
      listing = await ProfessionalProfile.findOne({ _id: id, user: req.user._id });
    } else if (type === 'equipment') {
      listing = await Equipment.findOne({ _id: id, owner: req.user._id });
    } else {
      res.status(400).json({ success: false, error: 'Invalid listing type' });
      return;
    }

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission to manage it.',
      });
      return;
    }

    // Phone verification gating policy
    const isOwnerPhoneVerified = Boolean(req.user.isPhoneVerified);
    const isAdmin = req.user.roles?.includes('ADMIN');

    if (!isOwnerPhoneVerified && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Phone number verification is required before publishing a listing to the marketplace.',
        code: 'PHONE_VERIFICATION_REQUIRED',
        requiresPhoneVerification: true,
      });
      return;
    }

    // Publication location validation
    const validation = validateListingLocation(
      type as any,
      listing.locationGeo,
      listing.locationAddress,
      {
        location: listing.location,
        submarket: listing.submarket,
        pickupLocation: listing.pickupLocation,
        serviceRadiusKm: listing.serviceRadiusKm,
        deliveryCoverageKm: listing.deliveryCoverageKm,
        mapUrl: listing.mapUrl || listing.locationAddress?.mapUrl,
      }
    );

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: `Cannot publish ${type} listing: complete location details are required before publication.`,
        missingFields: validation.missingFields,
        details: validation.errors,
      });
      return;
    }

    listing.publicationStatus = 'published';
    listing.reviewStatus = 'APPROVED';
    listing.submittedAt = listing.submittedAt || new Date();
    listing.reviewFeedback = null;
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing published successfully and is now live in the directory.',
      data: listing.toJSON(),
      validation,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateListingLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { type, id } = req.params;
    let listing: any = null;

    if (type === 'studio') {
      listing = await Studio.findOne({ _id: id, owner: req.user._id });
    } else if (type === 'location') {
      listing = await FilmingLocationModel.findOne({ _id: id, owner: req.user._id });
    } else if (type === 'crew') {
      listing = await ProfessionalProfile.findOne({ _id: id, user: req.user._id });
    } else if (type === 'equipment') {
      listing = await Equipment.findOne({ _id: id, owner: req.user._id });
    } else {
      res.status(400).json({ success: false, error: 'Invalid listing type' });
      return;
    }

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission to manage it.',
      });
      return;
    }

    const {
      locationGeo,
      locationAddress,
      location,
      submarket,
      pickupLocation,
      serviceRadiusKm,
      deliveryCoverageKm,
      mapUrl,
    } = req.body;

    let resolvedGeo = locationGeo;
    let resolvedAddress = locationAddress || listing.locationAddress || {};

    const rawMapUrl = mapUrl !== undefined ? mapUrl : (locationAddress?.mapUrl !== undefined ? locationAddress.mapUrl : undefined);
    if (rawMapUrl !== undefined && rawMapUrl !== null) {
      const trimmedMapUrl = String(rawMapUrl).trim();
      if (trimmedMapUrl && !isValidGoogleMapsUrl(trimmedMapUrl)) {
        res.status(400).json({
          success: false,
          error: 'The provided Google Maps location link is invalid. Please paste a valid Google Maps URL.',
          code: 'INVALID_MAPS_URL',
        });
        return;
      }
      resolvedAddress.mapUrl = trimmedMapUrl || null;
      listing.mapUrl = trimmedMapUrl || null;
      if (trimmedMapUrl && (!resolvedGeo || !resolvedGeo.coordinates)) {
        const extractedCoords = extractCoordinatesFromGoogleMapsUrl(trimmedMapUrl);
        if (extractedCoords) {
          resolvedGeo = {
            type: 'Point',
            coordinates: extractedCoords,
          };
        }
      }
    }

    if (resolvedGeo && resolvedGeo.coordinates) {
      if (!isValidCoordinates(resolvedGeo.coordinates)) {
        res.status(400).json({
          success: false,
          error: 'Invalid coordinates provided. Must be valid [longitude, latitude] numbers.',
        });
        return;
      }
      resolvedGeo = {
        type: 'Point',
        coordinates: [Number(resolvedGeo.coordinates[0]), Number(resolvedGeo.coordinates[1])],
      };
    } else if (resolvedAddress.city || location || pickupLocation) {
      // If coordinates not explicitly passed, attempt geocoding
      const query =
        resolvedAddress.formatted ||
        [resolvedAddress.building, resolvedAddress.street, resolvedAddress.locality, resolvedAddress.city, resolvedAddress.state, resolvedAddress.pincode]
          .filter(Boolean)
          .join(', ') ||
        location ||
        pickupLocation ||
        '';

      if (query.trim()) {
        try {
          const matches = await GeocodingService.searchLocations(query);
          if (matches.length > 0 && matches[0].coordinates) {
            resolvedGeo = {
              type: 'Point',
              coordinates: matches[0].coordinates,
            };
            if (!resolvedAddress.city) resolvedAddress.city = matches[0].city;
            if (!resolvedAddress.state) resolvedAddress.state = matches[0].state;
            if (!resolvedAddress.locality) resolvedAddress.locality = matches[0].locality;
            if (!resolvedAddress.pincode) resolvedAddress.pincode = matches[0].pincode;
            if (!resolvedAddress.formatted) resolvedAddress.formatted = matches[0].formatted || matches[0].name;
            if (!resolvedAddress.accuracy) resolvedAddress.accuracy = matches[0].accuracy || 'approximate';
          }
        } catch {
          // Geocode fallback - keep existing coordinates if available
        }
      }
    }

    // Apply updates
    if (resolvedGeo !== undefined) {
      listing.locationGeo = resolvedGeo;
    }
    if (resolvedAddress) {
      const existingAddr = listing.locationAddress?.toObject ? listing.locationAddress.toObject() : (listing.locationAddress || {});
      listing.locationAddress = {
        ...existingAddr,
        ...resolvedAddress,
      };
    }

    const cityLoc = [resolvedAddress.locality || submarket, resolvedAddress.city].filter(Boolean).join(', ');
    if (location) {
      listing.location = location;
    } else if (cityLoc) {
      listing.location = cityLoc;
    }

    if (submarket !== undefined && 'submarket' in listing) {
      listing.submarket = submarket;
    } else if (resolvedAddress.locality && 'submarket' in listing) {
      listing.submarket = resolvedAddress.locality;
    }

    if (pickupLocation !== undefined && 'pickupLocation' in listing) {
      listing.pickupLocation = pickupLocation;
    }
    if (serviceRadiusKm !== undefined && 'serviceRadiusKm' in listing) {
      listing.serviceRadiusKm = Number(serviceRadiusKm) || listing.serviceRadiusKm;
    }
    if (deliveryCoverageKm !== undefined && 'deliveryCoverageKm' in listing) {
      listing.deliveryCoverageKm = Number(deliveryCoverageKm) || listing.deliveryCoverageKm;
    }

    await listing.save();

    const validation = validateListingLocation(type as any, listing.locationGeo, listing.locationAddress, {
      location: listing.location,
      submarket: listing.submarket,
      pickupLocation: listing.pickupLocation,
      serviceRadiusKm: listing.serviceRadiusKm,
      deliveryCoverageKm: listing.deliveryCoverageKm,
      mapUrl: listing.mapUrl || listing.locationAddress?.mapUrl,
    });

    res.status(200).json({
      success: true,
      message: 'Listing location details successfully updated.',
      data: listing.toJSON(),
      validation,
    });
  } catch (error) {
    next(error);
  }
}

export async function unpublishListing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { type, id } = req.params;
    let listing: any = null;

    if (type === 'studio') {
      listing = await Studio.findOne({ _id: id, owner: req.user._id });
    } else if (type === 'location') {
      listing = await FilmingLocationModel.findOne({ _id: id, owner: req.user._id });
    } else if (type === 'crew') {
      listing = await ProfessionalProfile.findOne({ _id: id, user: req.user._id });
    } else if (type === 'equipment') {
      listing = await Equipment.findOne({ _id: id, owner: req.user._id });
    } else {
      res.status(400).json({ success: false, error: 'Invalid listing type' });
      return;
    }

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission to manage it.',
      });
      return;
    }

    listing.publicationStatus = 'draft';
    listing.reviewStatus = 'DRAFT';
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing unpublished and moved to draft.',
      data: listing.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function submitListingForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Aliased directly to immediate publish
  return publishListing(req, res, next);
}

export async function getPartnerBusinessSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const userId = req.user._id;

    const [studios, locations, crew, equipment, bookings] = await Promise.all([
      Studio.find({ owner: userId }),
      FilmingLocationModel.find({ owner: userId }),
      ProfessionalProfile.find({ user: userId }),
      Equipment.find({ owner: userId }),
      BookingRequest.find({ studioOwner: userId })
        .populate('studio', 'name slug dayRate10h')
        .populate('location', 'name slug dayRate10h')
        .populate('equipment', 'name brand dayRate')
        .populate('crew', 'name role dayRate10h')
        .populate('customer', 'fullName email companyName')
        .sort({ createdAt: -1 }),
    ]);

    const totalListings = studios.length + locations.length + crew.length + equipment.length;
    const activeListings = [
      ...studios.filter((s) => s.publicationStatus === 'published' || s.reviewStatus === 'APPROVED'),
      ...locations.filter((l) => l.publicationStatus === 'published' || l.reviewStatus === 'APPROVED'),
      ...crew.filter((c) => c.publicationStatus === 'published' || c.reviewStatus === 'APPROVED'),
      ...equipment.filter((e) => e.publicationStatus === 'published' || e.reviewStatus === 'APPROVED'),
    ].length;
    const draftListings = totalListings - activeListings;

    const pendingRequests = bookings.filter((b) => b.status === 'pending' || b.status === 'reviewed');
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
    const completedBookings = bookings.filter((b) => b.status === 'confirmed' && new Date(b.requestedDate) < new Date());

    const totalConfirmedRevenue = confirmedBookings.reduce((sum, b) => sum + (b.estimatedTotal || 0), 0);
    const pendingHoldValue = pendingRequests.reduce((sum, b) => sum + (b.estimatedTotal || 0), 0);
    const netEarnings = Math.round(totalConfirmedRevenue * 0.9); // 10% standard platform fee

    res.status(200).json({
      success: true,
      data: {
        listings: {
          total: totalListings,
          active: activeListings,
          drafts: draftListings,
          studios: studios.length,
          locations: locations.length,
          crew: crew.length,
          equipment: equipment.length,
        },
        bookings: {
          totalInquiries: bookings.length,
          pendingCount: pendingRequests.length,
          confirmedCount: confirmedBookings.length,
          completedCount: completedBookings.length,
          declinedCount: bookings.filter((b) => b.status === 'declined').length,
          cancelledCount: bookings.filter((b) => b.status === 'cancelled').length,
        },
        earnings: {
          totalGross: totalConfirmedRevenue,
          totalNet: netEarnings,
          pendingPipelineGross: pendingHoldValue,
          currency: 'USD',
          payoutStatus: 'MANUAL_DISBURSEMENT',
          payoutStatusLabel: 'Disbursements processed upon production wrap completion',
        },
        recentActivity: bookings.slice(0, 10).map((b) => ({
          id: b._id.toString(),
          productionName: b.productionName,
          clientName: (b.customer as any)?.fullName || (b.customer as any)?.email || 'Producer',
          clientCompany: (b.customer as any)?.companyName || 'Production Signatory',
          targetName:
            (b.studio as any)?.name ||
            (b.location as any)?.name ||
            (b.equipment as any)?.name ||
            (b.crew as any)?.name ||
            'Production Asset',
          listingType: b.listingType,
          requestedDate: b.requestedDate,
          shiftType: b.shiftType,
          durationHours: b.durationHours,
          totalAmount: b.estimatedTotal,
          status: b.status,
          createdAt: b.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

