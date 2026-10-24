"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReviewListingSchema = exports.updateEquipmentSchema = exports.createEquipmentSchema = exports.updateProfessionalSchema = exports.createProfessionalSchema = exports.updateLocationSchema = exports.createLocationSchema = exports.updateStudioSchema = exports.createStudioSchema = exports.productionBriefSchema = exports.compareItemSchema = exports.savedItemSchema = exports.marketplaceQuerySchema = void 0;
const zod_1 = require("zod");
exports.marketplaceQuerySchema = zod_1.z.object({
    search: zod_1.z.string().trim().optional(),
    category: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().optional(),
    lat: zod_1.z.coerce.number().optional(),
    lng: zod_1.z.coerce.number().optional(),
    radiusKm: zod_1.z.union([zod_1.z.coerce.number(), zod_1.z.literal('all'), zod_1.z.literal('ALL')]).optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().min(0).optional(),
    minSqFt: zod_1.z.coerce.number().min(0).optional(),
    camlockPower: zod_1.z.coerce.boolean().optional(),
    driveInAccess: zod_1.z.coerce.boolean().optional(),
    stc60Certified: zod_1.z.coerce.boolean().optional(),
    northDaylight: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    sort: zod_1.z.enum(['recommended', 'price_asc', 'price_desc', 'rating', 'sqft_desc', 'nearest']).default('recommended'),
}).passthrough();
exports.savedItemSchema = zod_1.z.object({
    itemType: zod_1.z.enum(['studio', 'location', 'crew', 'equipment']),
    itemId: zod_1.z.string().trim().min(1, 'Item ID or slug is required'),
});
exports.compareItemSchema = zod_1.z.object({
    studioId: zod_1.z.string().trim().min(1, 'Studio ID or slug is required'),
});
exports.productionBriefSchema = zod_1.z.object({
    projectName: zod_1.z.string().trim().min(2, 'Project name is required').max(150),
    productionType: zod_1.z.string().trim().min(2).default('Commercial Shoot'),
    shootDate: zod_1.z.string().optional().nullable(),
    durationHours: zod_1.z.coerce.number().min(1).max(24).default(10),
    budgetExpectation: zod_1.z.string().trim().optional(),
    requirements: zod_1.z.string().trim().max(2000).optional(),
    selectedResources: zod_1.z.object({
        studios: zod_1.z.array(zod_1.z.string()).default([]),
        locations: zod_1.z.array(zod_1.z.string()).default([]),
        crew: zod_1.z.array(zod_1.z.string()).default([]),
        equipment: zod_1.z.array(zod_1.z.string()).default([]),
    }).default({ studios: [], locations: [], crew: [], equipment: [] }),
});
// Listing Creation & Management Validators
exports.createStudioSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Stage name must be at least 2 characters').max(150),
    category: zod_1.z.enum(['cyclorama', 'soundstage', 'daylight', 'podcast', 'kitchen', 'industrial']),
    categoryLabel: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().min(2, 'Location is required').max(150),
    submarket: zod_1.z.string().trim().min(2, 'Submarket or neighborhood is required').max(150),
    description: zod_1.z.string().trim().min(10, 'Description must be at least 10 characters').max(3000),
    specs: zod_1.z.object({
        sqFt: zod_1.z.coerce.number().min(50, 'Square footage must be at least 50'),
        gridHeight: zod_1.z.string().trim().min(1, 'Grid height is required'),
        power: zod_1.z.string().trim().min(1, 'Power capacity is required'),
        access: zod_1.z.string().trim().min(1, 'Access type is required'),
    }),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    equipmentHighlight: zod_1.z.string().trim().default(''),
    hourlyRate: zod_1.z.coerce.number().min(0, 'Hourly rate cannot be negative'),
    dayRate10h: zod_1.z.coerce.number().min(0, '10h day rate cannot be negative'),
    imageUrl: zod_1.z.string().trim().min(1, 'Primary image URL is required'),
    galleryImages: zod_1.z.array(zod_1.z.string()).default([]),
    imageAlt: zod_1.z.string().trim().default(''),
    features: zod_1.z.object({
        camlockPower: zod_1.z.boolean().default(false),
        driveInAccess: zod_1.z.boolean().default(false),
        stc60Certified: zod_1.z.boolean().default(false),
        northDaylight: zod_1.z.boolean().default(false),
        gripPackageIncluded: zod_1.z.boolean().default(false),
    }).default({}),
    isDraft: zod_1.z.boolean().default(false),
}).passthrough();
exports.updateStudioSchema = exports.createStudioSchema.partial();
exports.createLocationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Location title must be at least 2 characters').max(150),
    category: zod_1.z.enum(['industrial', 'loft', 'warehouse', 'rooftop', 'commercial', 'outdoor']),
    categoryLabel: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().min(2, 'Location is required').max(150),
    submarket: zod_1.z.string().trim().min(2, 'Submarket is required').max(150),
    description: zod_1.z.string().trim().min(10, 'Description must be at least 10 characters').max(3000),
    areaSqFt: zod_1.z.coerce.number().min(50, 'Square footage must be at least 50'),
    ceilingHeight: zod_1.z.string().trim().min(1, 'Ceiling height is required'),
    powerSupply: zod_1.z.string().trim().min(1, 'Power supply is required'),
    vehicleAccess: zod_1.z.string().trim().min(1, 'Vehicle access description is required'),
    curfewRestrictions: zod_1.z.string().trim().default('None / 24/7 filming permitted'),
    permitsRequired: zod_1.z.string().trim().default("Standard NYC Mayor's Office Film Permit"),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    dayRate10h: zod_1.z.coerce.number().min(0, '10h day rate cannot be negative'),
    hourlyRate: zod_1.z.coerce.number().min(0, 'Hourly rate cannot be negative'),
    imageUrl: zod_1.z.string().trim().min(1, 'Primary image URL is required'),
    galleryImages: zod_1.z.array(zod_1.z.string()).default([]),
    imageAlt: zod_1.z.string().trim().default(''),
    isDraft: zod_1.z.boolean().default(false),
}).passthrough();
exports.updateLocationSchema = exports.createLocationSchema.partial();
exports.createProfessionalSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Full name must be at least 2 characters').max(150),
    role: zod_1.z.string().trim().min(2, 'Role / Department title is required').max(100),
    category: zod_1.z.enum(['camera_lighting', 'grip_sound', 'styling_art', 'post_production', 'production']),
    location: zod_1.z.string().trim().min(2, 'Home base / city is required').max(150),
    credits: zod_1.z.string().trim().min(5, 'Recent credits / productions are required').max(2000),
    bio: zod_1.z.string().trim().min(10, 'Professional bio must be at least 10 characters').max(3000),
    skills: zod_1.z.array(zod_1.z.string()).default([]),
    workingKit: zod_1.z.string().trim().default(''),
    dayRate10h: zod_1.z.coerce.number().min(0, '10h day rate cannot be negative'),
    nextAvailable: zod_1.z.string().trim().default('Immediate / Next Monday'),
    imageUrl: zod_1.z.string().trim().min(1, 'Profile image URL is required'),
    galleryImages: zod_1.z.array(zod_1.z.string()).default([]),
    imageAlt: zod_1.z.string().trim().default(''),
    unionAffiliation: zod_1.z.string().trim().default('Non-Union / Commercial Independent'),
    standardKitIncluded: zod_1.z.boolean().default(true),
    isDraft: zod_1.z.boolean().default(false),
}).passthrough();
exports.updateProfessionalSchema = exports.createProfessionalSchema.partial();
exports.createEquipmentSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Equipment item name is required').max(150),
    category: zod_1.z.enum(['cameras', 'lighting', 'grip', 'audio', 'monitoring', 'packages']),
    categoryLabel: zod_1.z.string().trim().optional(),
    brand: zod_1.z.string().trim().min(1, 'Brand is required').max(100),
    dayRate: zod_1.z.coerce.number().min(0, 'Daily rate cannot be negative'),
    weeklyRate: zod_1.z.coerce.number().min(0, 'Weekly rate cannot be negative'),
    replacementValue: zod_1.z.coerce.number().min(0, 'Replacement value cannot be negative'),
    description: zod_1.z.string().trim().min(10, 'Description must be at least 10 characters').max(3000),
    keySpecs: zod_1.z.array(zod_1.z.string()).default([]),
    includedAccessories: zod_1.z.array(zod_1.z.string()).default([]),
    powerRequirement: zod_1.z.string().trim().min(1, 'Power requirement is required'),
    mountType: zod_1.z.string().trim().default(''),
    imageUrl: zod_1.z.string().trim().min(1, 'Primary image URL is required'),
    galleryImages: zod_1.z.array(zod_1.z.string()).default([]),
    imageAlt: zod_1.z.string().trim().default(''),
    isDraft: zod_1.z.boolean().default(false),
}).passthrough();
exports.updateEquipmentSchema = exports.createEquipmentSchema.partial();
exports.adminReviewListingSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT', 'SUSPEND']),
    feedback: zod_1.z.string().trim().optional(),
}).refine((data) => {
    if (data.action === 'REQUEST_CHANGES' || data.action === 'REJECT') {
        return Boolean(data.feedback && data.feedback.length >= 5);
    }
    return true;
}, {
    message: 'A written explanation of at least 5 characters is required when requesting changes or rejecting a listing.',
    path: ['feedback'],
});
//# sourceMappingURL=marketplace.validator.js.map