import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailResult {
  delivered: boolean;
  simulated: boolean;
  messageId?: string;
  otp?: string;
  token?: string;
  error?: string;
}

export interface SmtpVerifyResult {
  success: boolean;
  configured: boolean;
  host: string;
  port: number;
  message: string;
  error?: string;
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***';
  const [local, domain] = parts;
  const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
  return `${maskedLocal}@${domain}`;
}

function sanitizeErrorMessage(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[EMAIL_REDACTED]')
    .replace(/pass(word)?\s*[:=]\s*\S+/gi, 'pass=[REDACTED]');
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        const isPort465 = env.SMTP_PORT === 465;
        // Strip any spaces from Google App Passwords
        const cleanPassword = env.SMTP_PASS.replace(/\s+/g, '');

        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: isPort465, // SSL for 465, STARTTLS for 587
          auth: {
            user: env.SMTP_USER,
            pass: cleanPassword,
          },
          tls: {
            rejectUnauthorized: true,
          },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        });

        this.isConfigured = true;
        console.log(`✉️ Email service initialized with host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
      } catch (err: any) {
        console.error('❌ Failed to initialize email transporter:', sanitizeErrorMessage(err?.message || ''));
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️ SMTP credentials not fully configured. Email service will run in development simulation mode.');
      this.isConfigured = false;
    }
  }

  public async verifyConnection(): Promise<SmtpVerifyResult> {
    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        configured: false,
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        message: 'SMTP credentials not configured (simulation mode active).',
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        configured: true,
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        message: 'Gmail SMTP handshake and TLS authentication verified successfully.',
      };
    } catch (err: any) {
      const sanitized = sanitizeErrorMessage(err?.message || 'SMTP connection verification failed');
      return {
        success: false,
        configured: true,
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        message: 'SMTP connection verification failed.',
        error: sanitized,
      };
    }
  }

  public async sendVerificationEmail(
    to: string,
    fullName: string,
    otpCode: string,
    verificationToken: string
  ): Promise<EmailResult> {
    const isTestMode = process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test';

    // In test mode or when unconfigured, run simulation without external network calls
    if (isTestMode || !this.isConfigured || !this.transporter) {
      console.log(`ℹ️ [SIMULATED EMAIL] Verification dispatch for: ${maskEmail(to)}`);
      return {
        delivered: false,
        simulated: true,
        otp: otpCode,
        token: verificationToken,
      };
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 32px; border-radius: 16px; border: 1px solid #27272A;">
        <h2 style="color: #F59E0B; margin-top: 0; letter-spacing: -0.5px;">BOOKMYSTUDIO</h2>
        <h3 style="color: #FAFAFA; margin-bottom: 8px;">Verify Your Production Account</h3>
        <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">Hello ${fullName},</p>
        <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">Welcome to BookMyStudio. Enter this 6-digit verification code to activate your account and access commercial stages, soundstage holds, and verified crew rosters:</p>
        <div style="background: #18181E; border: 1px solid #27272A; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #F59E0B; font-family: monospace;">${otpCode}</span>
        </div>
        <p style="color: #71717A; font-size: 12px; line-height: 1.5;">This code expires in 15 minutes. Never share this code with anyone. If you did not create a BookMyStudio account, you can safely ignore this email.</p>
        <p style="color: #71717A; font-size: 12px; margin-top: 24px; border-top: 1px solid #27272A; padding-top: 16px;">BookMyStudio Commercial Production Marketplace</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject: 'Verify Your BookMyStudio Production Account',
        text: `Your BookMyStudio verification code is: ${otpCode}. It expires in 15 minutes. Never share this code with anyone.`,
        html,
      });

      console.log(`✉️ Verification email sent via Gmail SMTP to: ${maskEmail(to)}`);

      return {
        delivered: true,
        simulated: false,
        messageId: info.messageId,
      };
    } catch (err: any) {
      const errorMsg = sanitizeErrorMessage(err?.message || 'Failed to dispatch email');
      console.error(`❌ Failed to deliver verification email to ${maskEmail(to)}:`, errorMsg);
      return {
        delivered: false,
        simulated: false,
        error: errorMsg,
      };
    }
  }

  public async sendPasswordResetEmail(
    to: string,
    fullName: string,
    resetToken: string
  ): Promise<EmailResult> {
    const isTestMode = process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test';
    const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;

    if (isTestMode || !this.isConfigured || !this.transporter) {
      console.log(`ℹ️ [SIMULATED EMAIL] Password reset dispatch for: ${maskEmail(to)}`);
      return {
        delivered: false,
        simulated: true,
        token: resetToken,
      };
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 32px; border-radius: 16px; border: 1px solid #27272A;">
        <h2 style="color: #F59E0B; margin-top: 0; letter-spacing: -0.5px;">BOOKMYSTUDIO</h2>
        <h3 style="color: #FAFAFA; margin-bottom: 8px;">Reset Your Account Password</h3>
        <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">Hello ${fullName},</p>
        <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">A password reset request was received for your BookMyStudio production account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #F59E0B; color: #09090B; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none;">Reset Password</a>
        </div>
        <p style="color: #71717A; font-size: 12px; line-height: 1.5;">This reset link expires in 1 hour. If you did not make this request, you can safely ignore this email.</p>
        <p style="color: #71717A; font-size: 12px; margin-top: 24px; border-top: 1px solid #27272A; padding-top: 16px;">BookMyStudio Commercial Production Marketplace</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject: 'Reset Your BookMyStudio Password',
        text: `Reset your BookMyStudio password here: ${resetUrl}. This link expires in 1 hour.`,
        html,
      });

      console.log(`✉️ Password reset email sent via Gmail SMTP to: ${maskEmail(to)}`);

      return {
        delivered: true,
        simulated: false,
        messageId: info.messageId,
      };
    } catch (err: any) {
      const errorMsg = sanitizeErrorMessage(err?.message || 'Failed to dispatch email');
      console.error(`❌ Failed to deliver password reset email to ${maskEmail(to)}:`, errorMsg);
      return {
        delivered: false,
        simulated: false,
        error: errorMsg,
      };
    }
  }
}

export const emailService = new EmailService();
