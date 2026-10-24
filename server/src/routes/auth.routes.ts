import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateProfile,
  becomeVendor,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { authLimiter, otpResendLimiter } from '../middleware/rate-limit.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  becomeVendorSchema,
} from '../validators/auth.validator';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validateBody(registerSchema), register);
authRouter.post('/login', authLimiter, validateBody(loginSchema), login);
authRouter.post('/logout', requireAuth, logout);
authRouter.get('/me', requireAuth, getCurrentUser);
authRouter.post('/verify-email', authLimiter, validateBody(verifyEmailSchema), verifyEmail);
authRouter.post('/resend-verification', otpResendLimiter, validateBody(resendVerificationSchema), resendVerification);
authRouter.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPassword);
authRouter.patch('/profile', requireAuth, validateBody(updateProfileSchema), updateProfile);
authRouter.post('/become-vendor', requireAuth, validateBody(becomeVendorSchema), becomeVendor);

