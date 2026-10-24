"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z
    .object({
    listingType: zod_1.z.enum(['studio', 'location', 'equipment', 'crew']).default('studio'),
    studioId: zod_1.z.string().trim().optional(),
    locationId: zod_1.z.string().trim().optional(),
    equipmentId: zod_1.z.string().trim().optional(),
    crewId: zod_1.z.string().trim().optional(),
    requestedDate: zod_1.z.string().min(1, 'Requested shoot date is required'),
    startTime: zod_1.z.string().trim().optional(),
    endTime: zod_1.z.string().trim().optional(),
    shiftType: zod_1.z.string().default('10h Standard Shoot Day'),
    durationHours: zod_1.z.coerce.number().min(1).max(24).default(10),
    attendeesCount: zod_1.z.coerce.number().min(1).default(10).optional(),
    productionName: zod_1.z.string().trim().min(2, 'Production or Agency name is required'),
    contactEmail: zod_1.z.string().trim().email('Valid contact email is required'),
    contactPhone: zod_1.z.string().trim().optional(),
    powerAddon: zod_1.z.boolean().default(false),
    riggingAddon: zod_1.z.boolean().default(false),
    estimatedTotal: zod_1.z.coerce.number().min(0, 'Estimated total must be positive').optional(),
    specialInstructions: zod_1.z.string().trim().max(1000).optional(),
})
    .refine((data) => data.studioId || data.locationId || data.equipmentId || data.crewId, {
    message: 'Either studioId, locationId, equipmentId, or crewId must be specified',
    path: ['studioId'],
});
exports.updateBookingStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'reviewed', 'confirmed', 'declined', 'cancelled']),
});
//# sourceMappingURL=booking.validator.js.map