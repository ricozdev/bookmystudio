"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminListings = getAdminListings;
exports.reviewListing = reviewListing;
const studio_model_1 = require("../models/studio.model");
const location_model_1 = require("../models/location.model");
const professional_model_1 = require("../models/professional.model");
const equipment_model_1 = require("../models/equipment.model");
const audit_log_model_1 = require("../models/audit-log.model");
const marketplace_validator_1 = require("../validators/marketplace.validator");
async function getAdminListings(req, res, next) {
    try {
        const { status, type } = req.query;
        const buildFilter = (userField) => {
            const filter = {};
            if (status && status !== 'all') {
                filter.reviewStatus = status;
            }
            return filter;
        };
        const shouldQueryStudios = !type || type === 'all' || type === 'studio';
        const shouldQueryLocations = !type || type === 'all' || type === 'location';
        const shouldQueryCrew = !type || type === 'all' || type === 'crew';
        const shouldQueryEquipment = !type || type === 'all' || type === 'equipment';
        const [studios, locations, crew, equipment] = await Promise.all([
            shouldQueryStudios
                ? studio_model_1.Studio.find(buildFilter('owner'))
                    .populate('owner', 'name email companyName phone')
                    .populate('reviewedBy', 'name email')
                    .sort({ submittedAt: -1, updatedAt: -1 })
                : Promise.resolve([]),
            shouldQueryLocations
                ? location_model_1.FilmingLocationModel.find(buildFilter('owner'))
                    .populate('owner', 'name email companyName phone')
                    .populate('reviewedBy', 'name email')
                    .sort({ submittedAt: -1, updatedAt: -1 })
                : Promise.resolve([]),
            shouldQueryCrew
                ? professional_model_1.ProfessionalProfile.find(buildFilter('user'))
                    .populate('user', 'name email companyName phone')
                    .populate('reviewedBy', 'name email')
                    .sort({ submittedAt: -1, updatedAt: -1 })
                : Promise.resolve([]),
            shouldQueryEquipment
                ? equipment_model_1.Equipment.find(buildFilter('owner'))
                    .populate('owner', 'name email companyName phone')
                    .populate('reviewedBy', 'name email')
                    .sort({ submittedAt: -1, updatedAt: -1 })
                : Promise.resolve([]),
        ]);
        const items = [
            ...studios.map((s) => {
                const owner = s.owner;
                return {
                    id: s._id.toString(),
                    type: 'studio',
                    title: s.name,
                    category: s.categoryLabel || s.category,
                    slug: s.slug,
                    thumbnail: s.imageUrl || (s.galleryImages?.[0] ?? ''),
                    rateLabel: `$${s.dayRate10h.toLocaleString()} / 10h`,
                    location: s.location,
                    submittedAt: s.submittedAt,
                    updatedAt: s.updatedAt,
                    createdAt: s.createdAt,
                    reviewStatus: s.reviewStatus || 'PENDING_REVIEW',
                    reviewFeedback: s.reviewFeedback,
                    reviewedBy: s.reviewedBy,
                    reviewedAt: s.reviewedAt,
                    ownerInfo: owner
                        ? {
                            id: owner._id?.toString() || owner.toString(),
                            name: owner.name || 'Anonymous User',
                            email: owner.email || '',
                            companyName: owner.companyName,
                            phone: owner.phone,
                        }
                        : null,
                    raw: s.toJSON(),
                };
            }),
            ...locations.map((l) => {
                const owner = l.owner;
                return {
                    id: l._id.toString(),
                    type: 'location',
                    title: l.name,
                    category: l.categoryLabel || l.category,
                    slug: l.slug,
                    thumbnail: l.imageUrl || (l.galleryImages?.[0] ?? ''),
                    rateLabel: `$${l.dayRate10h.toLocaleString()} / 10h`,
                    location: l.location,
                    submittedAt: l.submittedAt,
                    updatedAt: l.updatedAt,
                    createdAt: l.createdAt,
                    reviewStatus: l.reviewStatus || 'PENDING_REVIEW',
                    reviewFeedback: l.reviewFeedback,
                    reviewedBy: l.reviewedBy,
                    reviewedAt: l.reviewedAt,
                    ownerInfo: owner
                        ? {
                            id: owner._id?.toString() || owner.toString(),
                            name: owner.name || 'Anonymous User',
                            email: owner.email || '',
                            companyName: owner.companyName,
                            phone: owner.phone,
                        }
                        : null,
                    raw: l.toJSON(),
                };
            }),
            ...crew.map((c) => {
                const owner = c.user;
                return {
                    id: c._id.toString(),
                    type: 'crew',
                    title: `${c.name} — ${c.role}`,
                    category: c.category,
                    slug: c.slug,
                    thumbnail: c.imageUrl || (c.galleryImages?.[0] ?? ''),
                    rateLabel: `$${c.dayRate10h.toLocaleString()} / 10h`,
                    location: c.location,
                    submittedAt: c.submittedAt,
                    updatedAt: c.updatedAt,
                    createdAt: c.createdAt,
                    reviewStatus: c.reviewStatus || 'PENDING_REVIEW',
                    reviewFeedback: c.reviewFeedback,
                    reviewedBy: c.reviewedBy,
                    reviewedAt: c.reviewedAt,
                    ownerInfo: owner
                        ? {
                            id: owner._id?.toString() || owner.toString(),
                            name: owner.name || c.name,
                            email: owner.email || '',
                            companyName: owner.companyName,
                            phone: owner.phone,
                        }
                        : null,
                    raw: c.toJSON(),
                };
            }),
            ...equipment.map((e) => {
                const owner = e.owner;
                return {
                    id: e._id.toString(),
                    type: 'equipment',
                    title: `${e.brand} ${e.name}`,
                    category: e.categoryLabel || e.category,
                    slug: e.slug,
                    thumbnail: e.imageUrl || (e.galleryImages?.[0] ?? ''),
                    rateLabel: `$${e.dayRate.toLocaleString()} / day`,
                    submittedAt: e.submittedAt,
                    updatedAt: e.updatedAt,
                    createdAt: e.createdAt,
                    reviewStatus: e.reviewStatus || 'PENDING_REVIEW',
                    reviewFeedback: e.reviewFeedback,
                    reviewedBy: e.reviewedBy,
                    reviewedAt: e.reviewedAt,
                    ownerInfo: owner
                        ? {
                            id: owner._id?.toString() || owner.toString(),
                            name: owner.name || 'Anonymous User',
                            email: owner.email || '',
                            companyName: owner.companyName,
                            phone: owner.phone,
                        }
                        : null,
                    raw: e.toJSON(),
                };
            }),
        ];
        // Priority ordering: PENDING_REVIEW first, then newest
        items.sort((a, b) => {
            if (a.reviewStatus === 'PENDING_REVIEW' && b.reviewStatus !== 'PENDING_REVIEW')
                return -1;
            if (b.reviewStatus === 'PENDING_REVIEW' && a.reviewStatus !== 'PENDING_REVIEW')
                return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        // Compute global metrics
        const [allStudios, allLocations, allCrew, allEquip] = await Promise.all([
            studio_model_1.Studio.find({}, 'reviewStatus'),
            location_model_1.FilmingLocationModel.find({}, 'reviewStatus'),
            professional_model_1.ProfessionalProfile.find({}, 'reviewStatus'),
            equipment_model_1.Equipment.find({}, 'reviewStatus'),
        ]);
        const allStatuses = [
            ...allStudios.map((s) => s.reviewStatus || 'PENDING_REVIEW'),
            ...allLocations.map((l) => l.reviewStatus || 'PENDING_REVIEW'),
            ...allCrew.map((c) => c.reviewStatus || 'PENDING_REVIEW'),
            ...allEquip.map((e) => e.reviewStatus || 'PENDING_REVIEW'),
        ];
        const counts = {
            total: allStatuses.length,
            pendingReview: allStatuses.filter((s) => s === 'PENDING_REVIEW').length,
            approved: allStatuses.filter((s) => s === 'APPROVED').length,
            changesRequested: allStatuses.filter((s) => s === 'CHANGES_REQUESTED').length,
            rejected: allStatuses.filter((s) => s === 'REJECTED').length,
            suspended: allStatuses.filter((s) => s === 'SUSPENDED').length,
            draft: allStatuses.filter((s) => s === 'DRAFT').length,
        };
        res.status(200).json({
            success: true,
            data: items,
            counts,
        });
    }
    catch (error) {
        next(error);
    }
}
async function reviewListing(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const { type, id } = req.params;
        const validation = marketplace_validator_1.adminReviewListingSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.error.flatten(),
            });
            return;
        }
        const { action, feedback } = validation.data;
        let listing = null;
        let ownerId;
        if (type === 'studio') {
            listing = await studio_model_1.Studio.findById(id);
            ownerId = listing?.owner?.toString();
        }
        else if (type === 'location') {
            listing = await location_model_1.FilmingLocationModel.findById(id);
            ownerId = listing?.owner?.toString();
        }
        else if (type === 'crew') {
            listing = await professional_model_1.ProfessionalProfile.findById(id);
            ownerId = listing?.user?.toString();
        }
        else if (type === 'equipment') {
            listing = await equipment_model_1.Equipment.findById(id);
            ownerId = listing?.owner?.toString();
        }
        else {
            res.status(400).json({ success: false, error: 'Invalid listing type specified' });
            return;
        }
        if (!listing) {
            res.status(404).json({ success: false, error: 'Listing not found' });
            return;
        }
        // STRICT SELF-APPROVAL BARRIER:
        // Administrators cannot review/approve their own listings to prevent conflicts of interest.
        if (ownerId && ownerId === req.user._id.toString()) {
            res.status(403).json({
                success: false,
                error: 'Conflict of Interest: You cannot review or change status of your own listing. Another administrator must conduct this review.',
                code: 'SELF_REVIEW_PROHIBITED',
            });
            return;
        }
        const now = new Date();
        listing.reviewedBy = req.user._id;
        listing.reviewedAt = now;
        if (action === 'APPROVE') {
            listing.reviewStatus = 'APPROVED';
            listing.publicationStatus = 'published';
            listing.reviewFeedback = feedback || null;
        }
        else if (action === 'REQUEST_CHANGES') {
            listing.reviewStatus = 'CHANGES_REQUESTED';
            listing.reviewFeedback = feedback;
        }
        else if (action === 'REJECT') {
            listing.reviewStatus = 'REJECTED';
            listing.reviewFeedback = feedback;
        }
        else if (action === 'SUSPEND') {
            listing.reviewStatus = 'SUSPENDED';
            listing.publicationStatus = 'draft';
            listing.reviewFeedback = feedback || 'Listing suspended by trust & safety administration.';
        }
        await listing.save();
        // Record immutable audit ledger entry
        try {
            const actionMap = {
                APPROVE: 'LISTING_APPROVED',
                REQUEST_CHANGES: 'LISTING_CHANGES_REQUESTED',
                REJECT: 'LISTING_REJECTED',
                SUSPEND: 'LISTING_SUSPENDED',
            };
            await audit_log_model_1.AuditLog.create({
                adminId: req.user._id,
                adminEmail: req.user.email,
                adminName: req.user.fullName,
                action: actionMap[action],
                targetType: 'LISTING',
                targetId: listing._id.toString(),
                targetLabel: `${type.toUpperCase()}: ${listing.name || listing.title || listing.stageName || listing.slug}`,
                details: {
                    listingType: type,
                    newStatus: listing.reviewStatus,
                    feedback: feedback || undefined,
                },
                status: 'SUCCESS',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
        }
        catch {
            // Non-fatal
        }
        res.status(200).json({
            success: true,
            message: `Listing status updated to ${listing.reviewStatus}.`,
            data: listing.toJSON(),
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=admin-review.controller.js.map