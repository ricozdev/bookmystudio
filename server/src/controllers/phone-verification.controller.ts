import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { smsService, maskPhoneNumber } from '../services/sms.service';

export async function sendPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required to verify phone number.' });
      return;
    }

    const { phone: normalizedPhone } = req.body;

    // Check if phone number is already verified by another active account
    const existing = await User.findOne({
      phone: normalizedPhone,
      isPhoneVerified: true,
      _id: { $ne: req.user._id },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'This phone number is already verified on another account.',
        code: 'PHONE_ALREADY_VERIFIED',
      });
      return;
    }

    const user = await User.findById(req.user._id).select(
      '+phoneOtpHash +phoneOtpExpires +phoneOtpAttempts +phoneOtpLastSentAt +pendingPhone'
    );

    if (!user) {
      res.status(404).json({ success: false, error: 'User record not found.' });
      return;
    }

    // Rate limiting: 60-second resend cooldown
    if (user.phoneOtpLastSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - user.phoneOtpLastSentAt.getTime()) / 1000);
      if (elapsedSeconds < 60) {
        res.status(429).json({
          success: false,
          error: `Please wait ${60 - elapsedSeconds} seconds before requesting a new code.`,
          retryAfter: 60 - elapsedSeconds,
          code: 'OTP_COOLDOWN_ACTIVE',
        });
        return;
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.pendingPhone = normalizedPhone;
    user.phoneOtpHash = otpHash;
    user.phoneOtpExpires = expiresAt;
    user.phoneOtpAttempts = 0;
    user.phoneOtpLastSentAt = new Date();
    await user.save();

    // Dispatch SMS via configured provider
    const sendResult = await smsService.sendOtp(normalizedPhone, otp);

    if (!sendResult.success && sendResult.provider !== 'mock') {
      res.status(502).json({
        success: false,
        error: sendResult.error || 'SMS gateway dispatch failed. Please try again later.',
        code: 'SMS_DELIVERY_FAILED',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your phone number.',
      maskedPhone: maskPhoneNumber(normalizedPhone),
      cooldownSeconds: 60,
      expiresInSeconds: 300,
      ...(process.env.NODE_ENV === 'test' ? { simulatedOtp: otp } : {}),
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { otp } = req.body;

    const user = await User.findById(req.user._id).select(
      '+phoneOtpHash +phoneOtpExpires +phoneOtpAttempts +pendingPhone'
    );

    if (!user || !user.phoneOtpHash || !user.phoneOtpExpires || !user.pendingPhone) {
      res.status(400).json({
        success: false,
        error: 'No active phone verification challenge found. Please request a new code.',
        code: 'NO_ACTIVE_CHALLENGE',
      });
      return;
    }

    // Attempt limit check (maximum 5 attempts)
    if ((user.phoneOtpAttempts || 0) >= 5) {
      user.phoneOtpHash = null;
      user.phoneOtpExpires = null;
      user.pendingPhone = null;
      await user.save();

      res.status(429).json({
        success: false,
        error: 'Too many invalid attempts. For your security, this verification code has been revoked. Please request a new code.',
        code: 'TOO_MANY_ATTEMPTS',
      });
      return;
    }

    // Increment attempt counter
    user.phoneOtpAttempts = (user.phoneOtpAttempts || 0) + 1;

    // Check expiration
    if (user.phoneOtpExpires.getTime() < Date.now()) {
      await user.save();
      res.status(400).json({
        success: false,
        error: 'The verification code has expired. Please request a new code.',
        code: 'OTP_EXPIRED',
      });
      return;
    }

    // Compare submitted OTP against secure bcrypt hash
    const isMatch = await bcrypt.compare(otp.trim(), user.phoneOtpHash);

    if (!isMatch) {
      await user.save();
      const remaining = Math.max(0, 5 - (user.phoneOtpAttempts || 0));
      res.status(400).json({
        success: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining,
        code: 'INVALID_OTP',
      });
      return;
    }

    // Mark verified and promote pendingPhone to active verified phone
    user.phone = user.pendingPhone;
    user.isPhoneVerified = true;
    user.phoneVerifiedAt = new Date();

    // Invalidate challenge and clear replay vulnerability
    user.pendingPhone = null;
    user.phoneOtpHash = null;
    user.phoneOtpExpires = null;
    user.phoneOtpAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully.',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPhoneStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user._id).select('+phoneOtpLastSentAt');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    let cooldownRemaining = 0;
    if (user.phoneOtpLastSentAt) {
      const elapsed = Math.floor((Date.now() - user.phoneOtpLastSentAt.getTime()) / 1000);
      if (elapsed < 60) cooldownRemaining = 60 - elapsed;
    }

    res.status(200).json({
      success: true,
      phone: user.phone,
      maskedPhone: user.phone ? maskPhoneNumber(user.phone) : null,
      isPhoneVerified: Boolean(user.isPhoneVerified),
      phoneVerifiedAt: user.phoneVerifiedAt,
      cooldownRemainingSeconds: cooldownRemaining,
    });
  } catch (error) {
    next(error);
  }
}

export async function removePhone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.phone = null;
    user.isPhoneVerified = false;
    user.phoneVerifiedAt = null;
    user.pendingPhone = null;
    user.phoneOtpHash = null;
    user.phoneOtpExpires = null;
    user.phoneOtpAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone number removed. Re-verification will be required before publishing listings.',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

