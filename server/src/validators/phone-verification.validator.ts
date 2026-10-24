import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export const sendPhoneOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(5, 'Phone number is required')
    .refine(
      (val) => {
        try {
          return isValidPhoneNumber(val, 'IN') || isValidPhoneNumber(val);
        } catch {
          return false;
        }
      },
      {
        message: 'Please provide a valid phone number with country code (e.g., +91 98765 43210)',
      }
    )
    .transform((val) => {
      try {
        const parsed = parsePhoneNumber(val, 'IN');
        return parsed.format('E.164');
      } catch {
        return val;
      }
    }),
  countryCode: z.string().trim().optional().default('IN'),
});

export const verifyPhoneOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
  phone: z.string().trim().optional(),
});

