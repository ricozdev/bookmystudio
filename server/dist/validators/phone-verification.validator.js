"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPhoneOtpSchema = exports.sendPhoneOtpSchema = void 0;
const zod_1 = require("zod");
const libphonenumber_js_1 = require("libphonenumber-js");
exports.sendPhoneOtpSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .trim()
        .min(5, 'Phone number is required')
        .refine((val) => {
        try {
            return (0, libphonenumber_js_1.isValidPhoneNumber)(val, 'IN') || (0, libphonenumber_js_1.isValidPhoneNumber)(val);
        }
        catch {
            return false;
        }
    }, {
        message: 'Please provide a valid phone number with country code (e.g., +91 98765 43210)',
    })
        .transform((val) => {
        try {
            const parsed = (0, libphonenumber_js_1.parsePhoneNumber)(val, 'IN');
            return parsed.format('E.164');
        }
        catch {
            return val;
        }
    }),
    countryCode: zod_1.z.string().trim().optional().default('IN'),
});
exports.verifyPhoneOtpSchema = zod_1.z.object({
    otp: zod_1.z
        .string()
        .trim()
        .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
    phone: zod_1.z.string().trim().optional(),
});
//# sourceMappingURL=phone-verification.validator.js.map