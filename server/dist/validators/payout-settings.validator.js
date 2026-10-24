"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePayoutSettingsSchema = void 0;
const zod_1 = require("zod");
const crypto_1 = require("../utils/crypto");
exports.savePayoutSettingsSchema = zod_1.z
    .object({
    accountHolderName: zod_1.z
        .string({ required_error: 'Account holder name is required' })
        .trim()
        .min(2, 'Account holder name must be at least 2 characters')
        .max(120, 'Account holder name cannot exceed 120 characters'),
    accountHolderType: zod_1.z
        .enum(['individual', 'business'], {
        invalid_type_error: 'Account holder type must be individual or business',
    })
        .default('individual'),
    accountType: zod_1.z
        .enum(['savings', 'current'], {
        invalid_type_error: 'Account type must be savings or current',
    })
        .default('savings'),
    ifsc: zod_1.z
        .string({ required_error: 'IFSC code is required' })
        .transform(crypto_1.sanitizeIfsc)
        .refine((val) => crypto_1.IFSC_REGEX.test(val), {
        message: 'Invalid IFSC code format. Must be 11 characters (e.g., HDFC0000123)',
    }),
    bankName: zod_1.z.string().trim().max(100).optional().nullable(),
    accountNumber: zod_1.z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val ? (0, crypto_1.sanitizeAccountNumber)(val) : val))
        .refine((val) => !val || /^[0-9]{9,18}$/.test(val), {
        message: 'Account number must contain between 9 and 18 numeric digits',
    }),
    confirmAccountNumber: zod_1.z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val ? (0, crypto_1.sanitizeAccountNumber)(val) : val)),
    businessName: zod_1.z.string().trim().max(120).optional().nullable(),
    businessType: zod_1.z.string().trim().max(60).optional().nullable(),
    businessPan: zod_1.z
        .string()
        .trim()
        .toUpperCase()
        .optional()
        .nullable()
        .refine((val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
        message: 'Invalid Indian PAN format (e.g. ABCDE1234F)',
    }),
    businessGstin: zod_1.z
        .string()
        .trim()
        .toUpperCase()
        .optional()
        .nullable()
        .refine((val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val), {
        message: 'Invalid Indian GSTIN format',
    }),
})
    .superRefine((data, ctx) => {
    // If accountNumber is provided, confirmAccountNumber must match exactly
    if (data.accountNumber) {
        if (!data.confirmAccountNumber) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Please confirm your bank account number',
                path: ['confirmAccountNumber'],
            });
        }
        else if (data.accountNumber !== data.confirmAccountNumber) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Bank account numbers do not match',
                path: ['confirmAccountNumber'],
            });
        }
    }
    // Business name validation for business accounts
    if (data.accountHolderType === 'business' && (!data.businessName || data.businessName.length < 2)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Legal business name is required for business accounts',
            path: ['businessName'],
        });
    }
});
//# sourceMappingURL=payout-settings.validator.js.map