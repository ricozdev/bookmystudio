"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SmsService = void 0;
exports.maskPhoneNumber = maskPhoneNumber;
const https_1 = __importDefault(require("https"));
const env_1 = require("../config/env");
/**
 * Mask phone number for safe user display and audit logging without leaking full PII.
 * Example: "+919876543210" -> "+91 98****3210"
 */
function maskPhoneNumber(phone) {
    if (!phone)
        return '***';
    const clean = phone.trim();
    if (clean.length <= 5)
        return '***' + clean.slice(-2);
    const start = clean.slice(0, 5);
    const end = clean.slice(-4);
    return `${start}****${end}`;
}
class SmsService {
    static recentTestDispatches = new Map();
    /**
     * For integration testing verification only (when NODE_ENV === 'test').
     */
    static getTestOtp(phone) {
        const item = this.recentTestDispatches.get(phone);
        return item ? item.otp : null;
    }
    async sendOtp(toPhone, otp) {
        const provider = env_1.env.SMS_PROVIDER;
        const masked = maskPhoneNumber(toPhone);
        // 1. MOCK PROVIDER (Development & Automated Testing)
        if (provider === 'mock' || env_1.env.NODE_ENV === 'test') {
            if (env_1.env.NODE_ENV === 'test') {
                SmsService.recentTestDispatches.set(toPhone, { otp, timestamp: new Date() });
            }
            console.log(`📱 [SIMULATED SMS] Verification dispatch for: ${masked}`);
            return {
                success: true,
                provider: 'mock',
                messageId: `mock-sms-${Date.now()}`,
                maskedPhone: masked,
            };
        }
        // 2. MSG91 PROVIDER (India DLT Flow)
        if (provider === 'msg91') {
            if (!env_1.env.SMS_API_KEY) {
                console.error('❌ MSG91 provider selected but SMS_API_KEY is not configured in environment.');
                return {
                    success: false,
                    provider: 'msg91',
                    error: 'SMS service configuration required: MSG91 API key is not configured.',
                    maskedPhone: masked,
                };
            }
            try {
                const postData = JSON.stringify({
                    template_id: env_1.env.SMS_TEMPLATE_ID || '',
                    sender: env_1.env.SMS_SENDER_ID || 'BKMS',
                    short_url: '0',
                    mobiles: toPhone.replace('+', ''),
                    otp,
                });
                const options = {
                    hostname: 'control.msg91.com',
                    port: 443,
                    path: '/api/v5/otp',
                    method: 'POST',
                    headers: {
                        authkey: env_1.env.SMS_API_KEY,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                    },
                    timeout: 6000,
                };
                const res = await new Promise((resolve, reject) => {
                    const req = https_1.default.request(options, (msgRes) => {
                        let data = '';
                        msgRes.on('data', (c) => (data += c));
                        msgRes.on('end', () => resolve({ statusCode: msgRes.statusCode, data }));
                    });
                    req.on('error', reject);
                    req.on('timeout', () => {
                        req.destroy();
                        reject(new Error('MSG91 HTTP dispatch timed out'));
                    });
                    req.write(postData);
                    req.end();
                });
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    return {
                        success: true,
                        provider: 'msg91',
                        messageId: `msg91-${Date.now()}`,
                        maskedPhone: masked,
                    };
                }
                else {
                    return {
                        success: false,
                        provider: 'msg91',
                        error: `MSG91 gateway responded with HTTP ${res.statusCode}: ${res.data}`,
                        maskedPhone: masked,
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    provider: 'msg91',
                    error: `MSG91 transmission error: ${err.message}`,
                    maskedPhone: masked,
                };
            }
        }
        // 3. TWILIO PROVIDER (Global SMS)
        if (provider === 'twilio') {
            if (!env_1.env.TWILIO_ACCOUNT_SID || !env_1.env.TWILIO_AUTH_TOKEN || !env_1.env.TWILIO_FROM_NUMBER) {
                console.error('❌ Twilio provider selected but TWILIO credentials are not fully configured in environment.');
                return {
                    success: false,
                    provider: 'twilio',
                    error: 'SMS service configuration required: Twilio credentials are not configured.',
                    maskedPhone: masked,
                };
            }
            try {
                const auth = Buffer.from(`${env_1.env.TWILIO_ACCOUNT_SID}:${env_1.env.TWILIO_AUTH_TOKEN}`).toString('base64');
                const postData = new URLSearchParams({
                    To: toPhone,
                    From: env_1.env.TWILIO_FROM_NUMBER,
                    Body: `Your BookMyStudio verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
                }).toString();
                const options = {
                    hostname: 'api.twilio.com',
                    port: 443,
                    path: `/2010-04-01/Accounts/${env_1.env.TWILIO_ACCOUNT_SID}/Messages.json`,
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData),
                    },
                    timeout: 6000,
                };
                const res = await new Promise((resolve, reject) => {
                    const req = https_1.default.request(options, (msgRes) => {
                        let data = '';
                        msgRes.on('data', (c) => (data += c));
                        msgRes.on('end', () => resolve({ statusCode: msgRes.statusCode, data }));
                    });
                    req.on('error', reject);
                    req.on('timeout', () => {
                        req.destroy();
                        reject(new Error('Twilio HTTP dispatch timed out'));
                    });
                    req.write(postData);
                    req.end();
                });
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    const parsed = JSON.parse(res.data);
                    return {
                        success: true,
                        provider: 'twilio',
                        messageId: parsed.sid,
                        maskedPhone: masked,
                    };
                }
                else {
                    return {
                        success: false,
                        provider: 'twilio',
                        error: `Twilio gateway responded with HTTP ${res.statusCode}`,
                        maskedPhone: masked,
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    provider: 'twilio',
                    error: `Twilio transmission error: ${err.message}`,
                    maskedPhone: masked,
                };
            }
        }
        return {
            success: false,
            provider: 'mock',
            error: `Unsupported SMS provider: ${provider}`,
            maskedPhone: masked,
        };
    }
}
exports.SmsService = SmsService;
exports.smsService = new SmsService();
//# sourceMappingURL=sms.service.js.map