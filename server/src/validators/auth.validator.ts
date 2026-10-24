import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full legal or company name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please provide a valid work email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one number or symbol'),
  role: z
    .enum(['CUSTOMER', 'STUDIO_OWNER', 'PROFESSIONAL'])
    .optional()
    .default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  otp: z
    .string()
    .trim()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'Verification code must contain digits only')
    .optional(),
  token: z.string().trim().optional(),
}).refine((data) => data.otp || data.token, {
  message: 'Either an OTP code or verification token must be provided',
  path: ['otp'],
});

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Recovery token is required'),
  password: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one number or symbol'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  companyName: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const becomeVendorSchema = z.object({
  vendorTypes: z
    .array(z.enum(['studio', 'location', 'crew', 'equipment']))
    .optional(),
  role: z.enum(['STUDIO_OWNER', 'PROFESSIONAL']).optional(),
  companyName: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
});

