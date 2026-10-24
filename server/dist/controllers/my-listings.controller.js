"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyListings = getMyListings;
exports.publishListing = publishListing;
exports.updateListingLocation = updateListingLocation;
exports.unpublishListing = unpublishListing;
exports.submitListingForReview = submitListingForReview;
exports.getPartnerBusinessSummary = getPartnerBusinessSummary;
const studio_model_1 = require("../models/studio.model");
const location_model_1 = require("../models/location.model");
const professional_model_1 = require("../models/professional.model");
const equipment_model_1 = require("../models/equipment.model");
const booking_model_1 = require("../models/booking.model");
const location_validation_1 = require("../utils/location-validation");
const geocoding_service_1 = require("../services/geocoding.service");
async function getMyListings(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const userId = req.user._id;
        const [studios, locations, crew, equipment] = await Promise.all([
            studio_model_1.Studio.find({ owner: userId }).sort({ updatedAt: -1 }),
            location_model_1.FilmingLocationModel.find({ owner: userId }).sort({ updatedAt: -1 }),
            professional_model_1.ProfessionalProfile.find({ user: userId }).sort({ updatedAt: -1 }),
            equipment_model_1.Equipment.find({ owner: userId }).sort({ updatedAt: -1 }),
        ]);
        const items = [
            ...studios.map((s) => ({
                id: s._id.toString(),
                type: 'studio',
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
                type: 'location',
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
                type: 'crew',
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
                type: 'equipment',
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
    }
    catch (error) {
        next(error);
    }
}
async function publishListing(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { type, id } = req.params;
        let listing = null;
        if (type === 'studio') {
            listing = await studio_model_1.Studio.findOne({ _id: id, owner: req.user._id });
        }
        else if (type === 'location') {
            listing = await location_model_1.FilmingLocationModel.findOne({ _id: id, owner: req.user._id });
        }
        else if (type === 'crew') {
            listing = await professional_model_1.ProfessionalProfile.findOne({ _id: id, user: req.user._id });
        }
        else if (type === 'equipment') {
            listing = await equipment_model_1.Equipment.findOne({ _id: id, owner: req.user._id });
        }
        else {
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
        const validation = (0, location_validation_1.validateListingLocation)(type, listing.locationGeo, listing.locationAddress, {
            location: listing.location,
            submarket: listing.submarket,
            pickupLocation: listing.pickupLocation,
            serviceRadiusKm: listing.serviceRadiusKm,
            deliveryCoverageKm: listing.deliveryCoverageKm,
            mapUrl: listing.mapUrl || listing.locationAddress?.mapUrl,
        });
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
    }
    catch (error) {
        next(error);
    }
}
async function updateListingLocation(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { type, id } = req.params;
        let listing = null;
        if (type === 'studio') {
            listing = await studio_model_1.Studio.findOne({ _id: id, owner: req.user._id });
        }
        else if (type === 'location') {
            listing = await location_model_1.FilmingLocationModel.findOne({ _id: id, owner: req.user._id });
        }
        else if (type === 'crew') {
            listing = await professional_model_1.ProfessionalProfile.findOne({ _id: id, user: req.user._id });
        }
        else if (type === 'equipment') {
            listing = await equipment_model_1.Equipment.findOne({ _id: id, owner: req.user._id });
        }
        else {
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
        const { locationGeo, locationAddress, location, submarket, pickupLocation, serviceRadiusKm, deliveryCoverageKm, mapUrl, } = req.body;
        let resolvedGeo = locationGeo;
        let resolvedAddress = locationAddress || listing.locationAddress || {};
        const rawMapUrl = mapUrl !== undefined ? mapUrl : (locationAddress?.mapUrl !== undefined ? locationAddress.mapUrl : undefined);
        if (rawMapUrl !== undefined && rawMapUrl !== null) {
            const trimmedMapUrl = String(rawMapUrl).trim();
            if (trimmedMapUrl && !(0, location_validation_1.isValidGoogleMapsUrl)(trimmedMapUrl)) {
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
                const extractedCoords = (0, location_validation_1.extractCoordinatesFromGoogleMapsUrl)(trimmedMapUrl);
                if (extractedCoords) {
                    resolvedGeo = {
                        type: 'Point',
                        coordinates: extractedCoords,
                    };
                }
            }
        }
        if (resolvedGeo && resolvedGeo.coordinates) {
            if (!(0, location_validation_1.isValidCoordinates)(resolvedGeo.coordinates)) {
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
        }
        else if (resolvedAddress.city || location || pickupLocation) {
            // If coordinates not explicitly passed, attempt geocoding
            const query = resolvedAddress.formatted ||
                [resolvedAddress.building, resolvedAddress.street, resolvedAddress.locality, resolvedAddress.city, resolvedAddress.state, resolvedAddress.pincode]
                    .filter(Boolean)
                    .join(', ') ||
                location ||
                pickupLocation ||
                '';
            if (query.trim()) {
                try {
                    const matches = await geocoding_service_1.GeocodingService.searchLocations(query);
                    if (matches.length > 0 && matches[0].coordinates) {
                        resolvedGeo = {
                            type: 'Point',
                            coordinates: matches[0].coordinates,
                        };
                        if (!resolvedAddress.city)
                            resolvedAddress.city = matches[0].city;
                        if (!resolvedAddress.state)
                            resolvedAddress.state = matches[0].state;
                        if (!resolvedAddress.locality)
                            resolvedAddress.locality = matches[0].locality;
                        if (!resolvedAddress.pincode)
                            resolvedAddress.pincode = matches[0].pincode;
                        if (!resolvedAddress.formatted)
                            resolvedAddress.formatted = matches[0].formatted || matches[0].name;
                        if (!resolvedAddress.accuracy)
                            resolvedAddress.accuracy = matches[0].accuracy || 'approximate';
                    }
                }
                catch {
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
        }
        else if (cityLoc) {
            listing.location = cityLoc;
        }
        if (submarket !== undefined && 'submarket' in listing) {
            listing.submarket = submarket;
        }
        else if (resolvedAddress.locality && 'submarket' in listing) {
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
        const validation = (0, location_validation_1.validateListingLocation)(type, listing.locationGeo, listing.locationAddress, {
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
    }
    catch (error) {
        next(error);
    }
}
async function unpublishListing(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { type, id } = req.params;
        let listing = null;
        if (type === 'studio') {
            listing = await studio_model_1.Studio.findOne({ _id: id, owner: req.user._id });
        }
        else if (type === 'location') {
            listing = await location_model_1.FilmingLocationModel.findOne({ _id: id, owner: req.user._id });
        }
        else if (type === 'crew') {
            listing = await professional_model_1.ProfessionalProfile.findOne({ _id: id, user: req.user._id });
        }
        else if (type === 'equipment') {
            listing = await equipment_model_1.Equipment.findOne({ _id: id, owner: req.user._id });
        }
        else {
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
    }
    catch (error) {
        next(error);
    }
}
async function submitListingForReview(req, res, next) {
    // Aliased directly to immediate publish
    return publishListing(req, res, next);
}
async function getPartnerBusinessSummary(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const userId = req.user._id;
        const [studios, locations, crew, equipment, bookings] = await Promise.all([
            studio_model_1.Studio.find({ owner: userId }),
            location_model_1.FilmingLocationModel.find({ owner: userId }),
            professional_model_1.ProfessionalProfile.find({ user: userId }),
            equipment_model_1.Equipment.find({ owner: userId }),
            booking_model_1.BookingRequest.find({ studioOwner: userId })
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
                    clientName: b.customer?.fullName || b.customer?.email || 'Producer',
                    clientCompany: b.customer?.companyName || 'Production Signatory',
                    targetName: b.studio?.name ||
                        b.location?.name ||
                        b.equipment?.name ||
                        b.crew?.name ||
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=my-listings.controller.js.map