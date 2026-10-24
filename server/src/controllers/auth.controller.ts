import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User, IUser, UserRole } from '../models/user.model';
import { emailService } from '../services/email.service';

function generateSixDigitOtp(): string {
  // Cryptographically secure 6-digit integer in range [100000, 999999]
  return crypto.randomInt(100000, 1000000).toString();
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, email, password, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    const passwordHash = await User.hashPassword(password);
    const otpCode = generateSixDigitOtp();
    const verificationToken = generateSecureToken();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Role safety: never allow ADMIN assignment from public registration
    const assignedRole = role === 'STUDIO_OWNER' || role === 'PROFESSIONAL' ? role : 'CUSTOMER';

    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      roles: [assignedRole],
      isVerified: false,
      verificationOtp: otpCode,
      verificationOtpExpires: tokenExpiry,
      verificationToken,
      verificationExpires: tokenExpiry,
      lastVerificationSentAt: new Date(),
    });

    await user.save();

    // Send verification email via Gmail SMTP (or simulated in test mode)
    const emailResult = await emailService.sendVerificationEmail(
      normalizedEmail,
      user.fullName,
      otpCode,
      verificationToken
    );

    // Regenerate session to prevent fixation
    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }
      req.session.userId = user._id.toString();

      res.status(201).json({
        success: true,
        message: 'Account created successfully. A verification code has been dispatched to your email.',
        user: user.toJSON(),
        verificationSimulated: emailResult.simulated,
        ...(process.env.NODE_ENV === 'test' && emailResult.simulated && { simulatedOtp: emailResult.otp }),
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Fetch user including hidden passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid work email or password.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    if (user.accountStatus === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact the facility desk.',
        code: 'ACCOUNT_SUSPENDED',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid work email or password.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Update lastSeenAt timestamp
    user.lastSeenAt = new Date();
    await user.save();

    // Rotate session identifier upon successful authentication
    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }
      req.session.userId = user._id.toString();

      res.status(200).json({
        success: true,
        message: 'Sign in successful.',
        user: user.toJSON(),
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.session) {
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('bms_sid', { path: '/' });
      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Not authenticated.',
      code: 'UNAUTHENTICATED',
    });
    return;
  }

  res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp, token } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+verificationOtp +verificationOtpExpires +verificationToken +verificationExpires'
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'No account registered with this email address.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (user.isVerified) {
      res.status(200).json({
        success: true,
        message: 'Email address is already verified.',
        user: user.toJSON(),
      });
      return;
    }

    const now = new Date();
    let isValid = false;

    // Check OTP
    if (otp && user.verificationOtp && user.verificationOtpExpires) {
      if (user.verificationOtp === otp.trim() && user.verificationOtpExpires > now) {
        isValid = true;
      }
    }

    // Check token
    if (!isValid && token && user.verificationToken && user.verificationExpires) {
      if (user.verificationToken === token.trim() && user.verificationExpires > now) {
        isValid = true;
      }
    }

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code. Please request a new one.',
        code: 'INVALID_VERIFICATION_CODE',
      });
      return;
    }

    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your production account is fully active.',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+verificationOtp +verificationOtpExpires +verificationToken +verificationExpires +lastVerificationSentAt'
    );

    if (!user) {
      // Don't leak account existence
      res.status(200).json({
        success: true,
        message: 'If an unverified account exists, a new verification code has been dispatched.',
      });
      return;
    }

    if (user.isVerified) {
      res.status(200).json({
        success: true,
        message: 'Account is already verified.',
      });
      return;
    }

    // Enforce 60-second cooldown between resend requests
    if (user.lastVerificationSentAt && process.env.NODE_ENV !== 'test') {
      const elapsedMs = Date.now() - user.lastVerificationSentAt.getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        res.status(429).json({
          success: false,
          error: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
          code: 'RATE_LIMITED',
          retryAfter: remainingSeconds,
        });
        return;
      }
    }

    const otpCode = generateSixDigitOtp();
    const verificationToken = generateSecureToken();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationOtp = otpCode;
    user.verificationOtpExpires = tokenExpiry;
    user.verificationToken = verificationToken;
    user.verificationExpires = tokenExpiry;
    user.lastVerificationSentAt = new Date();
    await user.save();

    const emailResult = await emailService.sendVerificationEmail(
      normalizedEmail,
      user.fullName,
      otpCode,
      verificationToken
    );

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email.',
      verificationSimulated: emailResult.simulated,
      ...(process.env.NODE_ENV === 'test' && emailResult.simulated && { simulatedOtp: emailResult.otp }),
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+resetPasswordToken +resetPasswordExpires'
    );

    // Prevent account enumeration by always returning success
    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password recovery link has been dispatched.',
      });
      return;
    }

    const resetToken = generateSecureToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const emailResult = await emailService.sendPasswordResetEmail(
      normalizedEmail,
      user.fullName,
      resetToken
    );

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password recovery link has been dispatched.',
      resetSimulated: emailResult.simulated,
      ...(process.env.NODE_ENV === 'test' && emailResult.simulated && { simulatedToken: emailResult.token }),
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token.trim(),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+passwordHash +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'This password recovery link is invalid or has expired. Please request a new link.',
        code: 'INVALID_RESET_TOKEN',
      });
      return;
    }

    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Rotate session for security
    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }
      req.session.userId = user._id.toString();

      res.status(200).json({
        success: true,
        message: 'Password updated successfully. You are now securely signed in.',
        user: user.toJSON(),
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { fullName, companyName, phone, bio, avatarUrl } = req.body;

    if (fullName !== undefined) req.user.fullName = fullName.trim();
    if (companyName !== undefined) req.user.companyName = companyName ? companyName.trim() : null;
    if (phone !== undefined) {
      const normalized = phone ? phone.trim() : null;
      if (normalized !== req.user.phone) {
        req.user.phone = normalized;
        req.user.isPhoneVerified = false;
        req.user.phoneVerifiedAt = null;
      }
    }
    if (bio !== undefined) req.user.bio = bio ? bio.trim() : null;
    if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: req.user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function becomeVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to continue.',
        code: 'UNAUTHENTICATED',
      });
      return;
    }

    const { vendorTypes, role, companyName, phone, bio } = req.body;

    // Use a Set to handle roles cleanly and avoid duplicates
    const currentRoles = new Set<UserRole>(req.user.roles || ['CUSTOMER']);

    // Always maintain CUSTOMER role so existing bookings/saved listings are never lost
    currentRoles.add('CUSTOMER');

    // Add roles based on explicit role or vendorTypes
    if (role === 'STUDIO_OWNER' || role === 'PROFESSIONAL') {
      currentRoles.add(role);
    }

    if (Array.isArray(vendorTypes)) {
      for (const vt of vendorTypes) {
        if (vt === 'studio' || vt === 'location' || vt === 'equipment') {
          currentRoles.add('STUDIO_OWNER');
        } else if (vt === 'crew') {
          currentRoles.add('PROFESSIONAL');
        }
      }
    }

    // Default to STUDIO_OWNER if neither was specified
    if (!currentRoles.has('STUDIO_OWNER') && !currentRoles.has('PROFESSIONAL')) {
      currentRoles.add('STUDIO_OWNER');
    }

    // Security: never allow ADMIN assignment through become-vendor
    const wasAdmin = req.user.roles.includes('ADMIN');
    currentRoles.delete('ADMIN');
    if (wasAdmin) {
      currentRoles.add('ADMIN');
    }

    req.user.roles = Array.from(currentRoles);

    if (companyName !== undefined) {
      req.user.companyName = companyName ? companyName.trim() : null;
    }
    if (phone !== undefined) {
      const normalized = phone ? phone.trim() : null;
      if (normalized !== req.user.phone) {
        req.user.phone = normalized;
        req.user.isPhoneVerified = false;
        req.user.phoneVerifiedAt = null;
      }
    }
    if (bio !== undefined) {
      req.user.bio = bio ? bio.trim() : null;
    }

    await req.user.save();

    // Touch/save session
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        message: 'Vendor capabilities successfully activated. You can now publish listings.',
        user: req.user?.toJSON(),
      });
    });
  } catch (error) {
    next(error);
  }
}

