import { z } from 'zod';

export const createBookingSchema = z
  .object({
    listingType: z.enum(['studio', 'location', 'equipment', 'crew']).default('studio'),
    studioId: z.string().trim().optional(),
    locationId: z.string().trim().optional(),
    equipmentId: z.string().trim().optional(),
    crewId: z.string().trim().optional(),
    requestedDate: z.string().min(1, 'Requested shoot date is required'),
    startTime: z.string().trim().optional(),
    endTime: z.string().trim().optional(),
    shiftType: z.string().default('10h Standard Shoot Day'),
    durationHours: z.coerce.number().min(1).max(24).default(10),
    attendeesCount: z.coerce.number().min(1).default(10).optional(),
    productionName: z.string().trim().min(2, 'Production or Agency name is required'),
    contactEmail: z.string().trim().email('Valid contact email is required'),
    contactPhone: z.string().trim().optional(),
    powerAddon: z.boolean().default(false),
    riggingAddon: z.boolean().default(false),
    estimatedTotal: z.coerce.number().min(0, 'Estimated total must be positive').optional(),
    specialInstructions: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => data.studioId || data.locationId || data.equipmentId || data.crewId,
    {
      message: 'Either studioId, locationId, equipmentId, or crewId must be specified',
      path: ['studioId'],
    }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'confirmed', 'declined', 'cancelled']),
});
