import { Router } from 'express';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  getPhoneStatus,
  removePhone,
} from '../controllers/phone-verification.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  sendPhoneOtpSchema,
  verifyPhoneOtpSchema,
} from '../validators/phone-verification.validator';

export const phoneVerificationRouter = Router();

// Retrieve phone status and verification state
phoneVerificationRouter.get('/status', requireAuth, getPhoneStatus);

// Send 6-digit OTP to unverified or changed phone number
phoneVerificationRouter.post('/send-otp', requireAuth, validateBody(sendPhoneOtpSchema), sendPhoneOtp);

// Verify 6-digit OTP code
phoneVerificationRouter.post('/verify-otp', requireAuth, validateBody(verifyPhoneOtpSchema), verifyPhoneOtp);

// Remove or unlink phone number
phoneVerificationRouter.delete('/', requireAuth, removePhone);

