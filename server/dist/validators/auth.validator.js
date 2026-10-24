"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.becomeVendorSchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendVerificationSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, 'Full legal or company name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters'),
    email: zod_1.z
        .string()
        .trim()
        .email('Please provide a valid work email address')
        .toLowerCase(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one number or symbol'),
    role: zod_1.z
        .enum(['CUSTOMER', 'STUDIO_OWNER', 'PROFESSIONAL'])
        .optional()
        .default('CUSTOMER'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email('Please provide a valid email address')
        .toLowerCase(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email('Please provide a valid email address')
        .toLowerCase(),
    otp: zod_1.z
        .string()
        .trim()
        .length(6, 'Verification code must be exactly 6 digits')
        .regex(/^[0-9]+$/, 'Verification code must contain digits only')
        .optional(),
    token: zod_1.z.string().trim().optional(),
}).refine((data) => data.otp || data.token, {
    message: 'Either an OTP code or verification token must be provided',
    path: ['otp'],
});
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email('Please provide a valid email address')
        .toLowerCase(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email('Please provide a valid email address')
        .toLowerCase(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().trim().min(1, 'Recovery token is required'),
    password: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one number or symbol'),
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2).max(100).optional(),
    companyName: zod_1.z.string().trim().max(100).optional().nullable(),
    phone: zod_1.z.string().trim().max(30).optional().nullable(),
    bio: zod_1.z.string().trim().max(500).optional().nullable(),
    avatarUrl: zod_1.z.string().url().optional().nullable(),
});
exports.becomeVendorSchema = zod_1.z.object({
    vendorTypes: zod_1.z
        .array(zod_1.z.enum(['studio', 'location', 'crew', 'equipment']))
        .optional(),
    role: zod_1.z.enum(['STUDIO_OWNER', 'PROFESSIONAL']).optional(),
    companyName: zod_1.z.string().trim().max(100).optional().nullable(),
    phone: zod_1.z.string().trim().max(30).optional().nullable(),
    bio: zod_1.z.string().trim().max(500).optional().nullable(),
});
//# sourceMappingURL=auth.validator.js.map