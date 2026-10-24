import { z } from 'zod';

export const marketplaceQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.union([z.coerce.number(), z.literal('all'), z.literal('ALL')]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minSqFt: z.coerce.number().min(0).optional(),
  camlockPower: z.coerce.boolean().optional(),
  driveInAccess: z.coerce.boolean().optional(),
  stc60Certified: z.coerce.boolean().optional(),
  northDaylight: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['recommended', 'price_asc', 'price_desc', 'rating', 'sqft_desc', 'nearest']).default('recommended'),
}).passthrough();

export const savedItemSchema = z.object({
  itemType: z.enum(['studio', 'location', 'crew', 'equipment']),
  itemId: z.string().trim().min(1, 'Item ID or slug is required'),
});

export const compareItemSchema = z.object({
  studioId: z.string().trim().min(1, 'Studio ID or slug is required'),
});

export const productionBriefSchema = z.object({
  projectName: z.string().trim().min(2, 'Project name is required').max(150),
  productionType: z.string().trim().min(2).default('Commercial Shoot'),
  shootDate: z.string().optional().nullable(),
  durationHours: z.coerce.number().min(1).max(24).default(10),
  budgetExpectation: z.string().trim().optional(),
  requirements: z.string().trim().max(2000).optional(),
  selectedResources: z.object({
    studios: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
    crew: z.array(z.string()).default([]),
    equipment: z.array(z.string()).default([]),
  }).default({ studios: [], locations: [], crew: [], equipment: [] }),
});

// Listing Creation & Management Validators
export const createStudioSchema = z.object({
  name: z.string().trim().min(2, 'Stage name must be at least 2 characters').max(150),
  category: z.enum(['cyclorama', 'soundstage', 'daylight', 'podcast', 'kitchen', 'industrial']),
  categoryLabel: z.string().trim().optional(),
  location: z.string().trim().min(2, 'Location is required').max(150),
  submarket: z.string().trim().min(2, 'Submarket or neighborhood is required').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(3000),
  specs: z.object({
    sqFt: z.coerce.number().min(50, 'Square footage must be at least 50'),
    gridHeight: z.string().trim().min(1, 'Grid height is required'),
    power: z.string().trim().min(1, 'Power capacity is required'),
    access: z.string().trim().min(1, 'Access type is required'),
  }),
  amenities: z.array(z.string()).default([]),
  equipmentHighlight: z.string().trim().default(''),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate cannot be negative'),
  dayRate10h: z.coerce.number().min(0, '10h day rate cannot be negative'),
  imageUrl: z.string().trim().min(1, 'Primary image URL is required'),
  galleryImages: z.array(z.string()).default([]),
  imageAlt: z.string().trim().default(''),
  features: z.object({
    camlockPower: z.boolean().default(false),
    driveInAccess: z.boolean().default(false),
    stc60Certified: z.boolean().default(false),
    northDaylight: z.boolean().default(false),
    gripPackageIncluded: z.boolean().default(false),
  }).default({}),
  isDraft: z.boolean().default(false),
}).passthrough();

export const updateStudioSchema = createStudioSchema.partial();

export const createLocationSchema = z.object({
  name: z.string().trim().min(2, 'Location title must be at least 2 characters').max(150),
  category: z.enum(['industrial', 'loft', 'warehouse', 'rooftop', 'commercial', 'outdoor']),
  categoryLabel: z.string().trim().optional(),
  location: z.string().trim().min(2, 'Location is required').max(150),
  submarket: z.string().trim().min(2, 'Submarket is required').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(3000),
  areaSqFt: z.coerce.number().min(50, 'Square footage must be at least 50'),
  ceilingHeight: z.string().trim().min(1, 'Ceiling height is required'),
  powerSupply: z.string().trim().min(1, 'Power supply is required'),
  vehicleAccess: z.string().trim().min(1, 'Vehicle access description is required'),
  curfewRestrictions: z.string().trim().default('None / 24/7 filming permitted'),
  permitsRequired: z.string().trim().default("Standard NYC Mayor's Office Film Permit"),
  amenities: z.array(z.string()).default([]),
  dayRate10h: z.coerce.number().min(0, '10h day rate cannot be negative'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate cannot be negative'),
  imageUrl: z.string().trim().min(1, 'Primary image URL is required'),
  galleryImages: z.array(z.string()).default([]),
  imageAlt: z.string().trim().default(''),
  isDraft: z.boolean().default(false),
}).passthrough();

export const updateLocationSchema = createLocationSchema.partial();

export const createProfessionalSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(150),
  role: z.string().trim().min(2, 'Role / Department title is required').max(100),
  category: z.enum(['camera_lighting', 'grip_sound', 'styling_art', 'post_production', 'production']),
  location: z.string().trim().min(2, 'Home base / city is required').max(150),
  credits: z.string().trim().min(5, 'Recent credits / productions are required').max(2000),
  bio: z.string().trim().min(10, 'Professional bio must be at least 10 characters').max(3000),
  skills: z.array(z.string()).default([]),
  workingKit: z.string().trim().default(''),
  dayRate10h: z.coerce.number().min(0, '10h day rate cannot be negative'),
  nextAvailable: z.string().trim().default('Immediate / Next Monday'),
  imageUrl: z.string().trim().min(1, 'Profile image URL is required'),
  galleryImages: z.array(z.string()).default([]),
  imageAlt: z.string().trim().default(''),
  unionAffiliation: z.string().trim().default('Non-Union / Commercial Independent'),
  standardKitIncluded: z.boolean().default(true),
  isDraft: z.boolean().default(false),
}).passthrough();

export const updateProfessionalSchema = createProfessionalSchema.partial();

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(2, 'Equipment item name is required').max(150),
  category: z.enum(['cameras', 'lighting', 'grip', 'audio', 'monitoring', 'packages']),
  categoryLabel: z.string().trim().optional(),
  brand: z.string().trim().min(1, 'Brand is required').max(100),
  dayRate: z.coerce.number().min(0, 'Daily rate cannot be negative'),
  weeklyRate: z.coerce.number().min(0, 'Weekly rate cannot be negative'),
  replacementValue: z.coerce.number().min(0, 'Replacement value cannot be negative'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(3000),
  keySpecs: z.array(z.string()).default([]),
  includedAccessories: z.array(z.string()).default([]),
  powerRequirement: z.string().trim().min(1, 'Power requirement is required'),
  mountType: z.string().trim().default(''),
  imageUrl: z.string().trim().min(1, 'Primary image URL is required'),
  galleryImages: z.array(z.string()).default([]),
  imageAlt: z.string().trim().default(''),
  isDraft: z.boolean().default(false),
}).passthrough();

export const updateEquipmentSchema = createEquipmentSchema.partial();

export const adminReviewListingSchema = z.object({
  action: z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT', 'SUSPEND']),
  feedback: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.action === 'REQUEST_CHANGES' || data.action === 'REJECT') {
      return Boolean(data.feedback && data.feedback.length >= 5);
    }
    return true;
  },
  {
    message: 'A written explanation of at least 5 characters is required when requesting changes or rejecting a listing.',
    path: ['feedback'],
  }
);


