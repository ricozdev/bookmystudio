"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquipment = getEquipment;
exports.getEquipmentBySlugOrId = getEquipmentBySlugOrId;
exports.createEquipment = createEquipment;
exports.updateEquipment = updateEquipment;
exports.deleteEquipment = deleteEquipment;
const mongoose_1 = __importDefault(require("mongoose"));
const equipment_model_1 = require("../models/equipment.model");
const slug_1 = require("../utils/slug");
const geo_query_1 = require("../utils/geo-query");
const geocoding_service_1 = require("../services/geocoding.service");
const location_validation_1 = require("../utils/location-validation");
async function getEquipment(req, res, next) {
    try {
        const { search, category, location, minPrice, maxPrice, page = 1, limit = 20, sort = 'recommended', } = req.query;
        const { coords, radiusKm } = (0, geo_query_1.parseGeoQueryParams)(req.query);
        const query = {
            $and: [
                { publicationStatus: 'published' },
                { reviewStatus: { $nin: ['SUSPENDED', 'REJECTED'] } },
            ],
        };
        const geoFilter = (0, geo_query_1.buildGeoFilter)(coords, radiusKm);
        if (geoFilter.locationGeo) {
            query.locationGeo = geoFilter.locationGeo;
        }
        if (category && category !== 'all') {
            query.category = category;
        }
        if (location && location !== 'all') {
            query.$or = [
                { location: { $regex: location, $options: 'i' } },
                { pickupLocation: { $regex: location, $options: 'i' } },
                { 'locationAddress.city': { $regex: location, $options: 'i' } },
                { 'locationAddress.locality': { $regex: location, $options: 'i' } },
            ];
        }
        if (minPrice || maxPrice) {
            query.dayRate = {};
            if (minPrice)
                query.dayRate.$gte = Number(minPrice);
            if (maxPrice)
                query.dayRate.$lte = Number(maxPrice);
        }
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$and.push({
                $or: [
                    { name: regex },
                    { brand: regex },
                    { description: regex },
                    { keySpecs: regex },
                ],
            });
        }
        const sortOption = {};
        if (sort === 'price_asc')
            sortOption.dayRate = 1;
        else if (sort === 'price_desc')
            sortOption.dayRate = -1;
        else if (sort === 'rating')
            sortOption.rating = -1;
        else
            sortOption.createdAt = -1;
        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            equipment_model_1.Equipment.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
            equipment_model_1.Equipment.countDocuments(query),
        ]);
        const serialized = items.map((e) => e.toJSON());
        const enriched = (0, geo_query_1.attachDistanceAndSort)(serialized, coords, sort);
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
    }
    catch (error) {
        next(error);
    }
}
async function getEquipmentBySlugOrId(req, res, next) {
    try {
        const { slugOrId } = req.params;
        const cleanId = decodeURIComponent(slugOrId).trim();
        let item = null;
        if (mongoose_1.default.Types.ObjectId.isValid(cleanId)) {
            item = await equipment_model_1.Equipment.findById(cleanId);
        }
        if (!item) {
            item = await equipment_model_1.Equipment.findOne({ slug: cleanId.toLowerCase() });
        }
        if (!item) {
            res.status(404).json({
                success: false,
                error: `Equipment item '${cleanId}' not found.`,
                code: 'EQUIPMENT_NOT_FOUND',
            });
            return;
        }
        const isPublished = (item.publicationStatus === 'published' || !item.publicationStatus) &&
            !['SUSPENDED', 'REJECTED'].includes(item.reviewStatus);
        if (!isPublished) {
            const isOwner = req.user &&
                item.owner &&
                (req.user._id.toString() === item.owner.toString() ||
                    req.user._id.toString() === (item.owner._id?.toString() || ''));
            const isAdmin = req.user && req.user.roles.includes('ADMIN');
            if (!isOwner && !isAdmin) {
                res.status(403).json({
                    success: false,
                    error: 'This cinema equipment package is currently unpublished or pending verification.',
                    code: 'LISTING_UNPUBLISHED',
                    publicationStatus: item.publicationStatus,
                    reviewStatus: item.reviewStatus,
                });
                return;
            }
        }
        res.status(200).json({
            success: true,
            data: item.toJSON(),
            isDraftPreview: !isPublished,
        });
    }
    catch (error) {
        next(error);
    }
}
async function createEquipment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        let slug = req.body.slug ? (0, slug_1.generateSlug)(req.body.slug) : (0, slug_1.generateSlug)(`${req.body.brand}-${req.body.name}`);
        const existing = await equipment_model_1.Equipment.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }
        const isDraft = Boolean(req.body.isDraft);
        let locationGeo = req.body.locationGeo;
        let locationAddress = req.body.locationAddress;
        const hasValidCoords = locationGeo &&
            Array.isArray(locationGeo.coordinates) &&
            locationGeo.coordinates.length === 2 &&
            !isNaN(locationGeo.coordinates[0]) &&
            !isNaN(locationGeo.coordinates[1]);
        if (!hasValidCoords) {
            // Attempt geocoding of user's entered location string without silent fallbacks
            const locationQuery = req.body.location || req.body.pickupLocation || '';
            let match = null;
            if (locationQuery.trim()) {
                try {
                    const matches = await geocoding_service_1.GeocodingService.searchLocations(locationQuery);
                    if (matches.length > 0 && matches[0].coordinates) {
                        match = matches[0];
                    }
                }
                catch {
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
            }
            else {
                locationGeo = undefined;
                if (!locationAddress) {
                    locationAddress = {
                        formatted: locationQuery,
                        locality: '',
                        city: locationQuery,
                        state: '',
                        pincode: '',
                    };
                }
            }
        }
        const rawMapUrl = (req.body.mapUrl || req.body.locationAddress?.mapUrl || '').trim();
        if (rawMapUrl && !(0, location_validation_1.isValidGoogleMapsUrl)(rawMapUrl)) {
            res.status(400).json({
                success: false,
                error: 'The provided Google Maps location link is invalid. Please paste a valid Google Maps URL.',
                code: 'INVALID_MAPS_URL',
            });
            return;
        }
        if (rawMapUrl && (!locationGeo || !locationGeo.coordinates)) {
            const extractedCoords = (0, location_validation_1.extractCoordinatesFromGoogleMapsUrl)(rawMapUrl);
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
            const validation = (0, location_validation_1.validateListingLocation)('equipment', locationGeo, locationAddress, {
                location: req.body.location,
                pickupLocation: req.body.pickupLocation,
                deliveryCoverageKm: req.body.deliveryCoverageKm,
                mapUrl: rawMapUrl,
            });
            if (!validation.isValid) {
                res.status(400).json({
                    success: false,
                    error: 'Cannot publish equipment listing: complete location details are required before publication.',
                    missingFields: validation.missingFields,
                    details: validation.errors,
                });
                return;
            }
        }
        const equipmentData = {
            ...req.body,
            slug,
            owner: req.user._id,
            categoryLabel: req.body.categoryLabel || req.body.category.toUpperCase(),
            location: req.body.location || req.body.pickupLocation || '',
            pickupLocation: req.body.pickupLocation || req.body.location || '',
            deliveryCoverageKm: req.body.deliveryCoverageKm || 30,
            locationGeo,
            locationAddress: locationAddress ? { ...locationAddress, mapUrl: rawMapUrl || null } : { mapUrl: rawMapUrl || null },
            mapUrl: rawMapUrl || null,
            publicationStatus: isDraft ? 'draft' : 'published',
            reviewStatus: isDraft ? 'DRAFT' : 'APPROVED',
            submittedAt: isDraft ? null : new Date(),
            reviewFeedback: null,
        };
        const item = new equipment_model_1.Equipment(equipmentData);
        await item.save();
        // Ensure host/vendor role
        if (!req.user.roles.includes('STUDIO_OWNER') && !req.user.roles.includes('ADMIN')) {
            req.user.roles.push('STUDIO_OWNER');
            await req.user.save();
        }
        res.status(201).json({
            success: true,
            message: isDraft
                ? 'Equipment listing saved as draft.'
                : 'Equipment listing published successfully and is now live in the directory.',
            data: item.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateEquipment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { slugOrId } = req.params;
        let item = null;
        if (mongoose_1.default.Types.ObjectId.isValid(slugOrId)) {
            item = await equipment_model_1.Equipment.findById(slugOrId);
        }
        if (!item) {
            item = await equipment_model_1.Equipment.findOne({ slug: slugOrId.toLowerCase() });
        }
        if (!item) {
            res.status(404).json({ success: false, error: 'Equipment item not found' });
            return;
        }
        const isOwner = item.owner && item.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.roles.includes('ADMIN');
        if (!isOwner && !isAdmin) {
            res.status(403).json({
                success: false,
                error: 'Forbidden: You do not own this equipment listing.',
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
            if (trimmedMapUrl && !(0, location_validation_1.isValidGoogleMapsUrl)(trimmedMapUrl)) {
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
        const checkMapUrl = updates.mapUrl !== undefined ? updates.mapUrl : (item.mapUrl || item.locationAddress?.mapUrl);
        if (req.body.isDraft !== undefined) {
            const isDraft = Boolean(req.body.isDraft);
            updates.publicationStatus = isDraft ? 'draft' : 'published';
            updates.reviewStatus = isDraft ? 'DRAFT' : 'APPROVED';
            if (!isDraft) {
                const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : item.locationGeo;
                const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : item.locationAddress;
                const validation = (0, location_validation_1.validateListingLocation)('equipment', checkGeo, checkAddr, {
                    location: updates.location || item.location,
                    pickupLocation: updates.pickupLocation || item.pickupLocation,
                    deliveryCoverageKm: updates.deliveryCoverageKm !== undefined ? updates.deliveryCoverageKm : item.deliveryCoverageKm,
                    mapUrl: checkMapUrl,
                });
                if (!validation.isValid) {
                    res.status(400).json({
                        success: false,
                        error: 'Cannot publish equipment listing: complete location details are required before publication.',
                        missingFields: validation.missingFields,
                        details: validation.errors,
                    });
                    return;
                }
                updates.submittedAt = updates.submittedAt || new Date();
                updates.reviewFeedback = null;
            }
        }
        else if (req.body.publicationStatus) {
            updates.publicationStatus = req.body.publicationStatus;
            if (req.body.publicationStatus === 'published') {
                const checkGeo = updates.locationGeo !== undefined ? updates.locationGeo : item.locationGeo;
                const checkAddr = updates.locationAddress !== undefined ? updates.locationAddress : item.locationAddress;
                const validation = (0, location_validation_1.validateListingLocation)('equipment', checkGeo, checkAddr, {
                    location: updates.location || item.location,
                    pickupLocation: updates.pickupLocation || item.pickupLocation,
                    deliveryCoverageKm: updates.deliveryCoverageKm !== undefined ? updates.deliveryCoverageKm : item.deliveryCoverageKm,
                    mapUrl: checkMapUrl,
                });
                if (!validation.isValid) {
                    res.status(400).json({
                        success: false,
                        error: 'Cannot publish equipment listing: complete location details are required before publication.',
                        missingFields: validation.missingFields,
                        details: validation.errors,
                    });
                    return;
                }
                updates.reviewStatus = 'APPROVED';
                updates.submittedAt = updates.submittedAt || new Date();
                updates.reviewFeedback = null;
            }
            else if (req.body.publicationStatus === 'draft') {
                updates.reviewStatus = 'DRAFT';
            }
        }
        Object.assign(item, updates);
        await item.save();
        res.status(200).json({
            success: true,
            message: 'Equipment listing updated successfully.',
            data: item.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function deleteEquipment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { slugOrId } = req.params;
        let item = null;
        if (mongoose_1.default.Types.ObjectId.isValid(slugOrId)) {
            item = await equipment_model_1.Equipment.findById(slugOrId);
        }
        if (!item) {
            item = await equipment_model_1.Equipment.findOne({ slug: slugOrId.toLowerCase() });
        }
        if (!item) {
            res.status(404).json({ success: false, error: 'Equipment item not found' });
            return;
        }
        const isOwner = item.owner && item.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.roles.includes('ADMIN');
        if (!isOwner && !isAdmin) {
            res.status(403).json({
                success: false,
                error: 'Forbidden: You do not own this equipment listing.',
                code: 'UNAUTHORIZED_ACCESS',
            });
            return;
        }
        await item.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Equipment listing deleted successfully.',
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=equipment.controller.js.map