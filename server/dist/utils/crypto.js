"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFSC_REGEX = void 0;
exports.encryptSensitiveData = encryptSensitiveData;
exports.decryptSensitiveData = decryptSensitiveData;
exports.maskAccountNumber = maskAccountNumber;
exports.sanitizeAccountNumber = sanitizeAccountNumber;
exports.sanitizeIfsc = sanitizeIfsc;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
// Derive a 32-byte cryptographic key deterministically from the configured encryption secret or session secret
function getEncryptionKey() {
    const secret = env_1.env.PAYOUT_ENCRYPTION_SECRET || env_1.env.SESSION_SECRET || 'bms_payout_vault_default_secret_32';
    return crypto_1.default.createHash('sha256').update(secret).digest();
}
/**
 * Encrypt sensitive payout string using AES-256-GCM authenticated encryption.
 */
function encryptSensitiveData(plaintext) {
    const key = getEncryptionKey();
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
        encrypted,
        iv: iv.toString('hex'),
        tag,
    };
}
/**
 * Decrypt sensitive payout string using AES-256-GCM.
 */
function decryptSensitiveData(encryptedHex, ivHex, tagHex) {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Formats a bank account number into a secure masked string.
 * Example: '000492819284' -> '••••••••9284'
 */
function maskAccountNumber(accountNumber) {
    if (!accountNumber)
        return '';
    const trimmed = accountNumber.trim();
    if (trimmed.length <= 4) {
        return `••••${trimmed}`;
    }
    const last4 = trimmed.slice(-4);
    return `••••••••${last4}`;
}
/**
 * Sanitizes an account number by removing all whitespace and hyphens while preserving leading zeros.
 */
function sanitizeAccountNumber(accountNumber) {
    if (!accountNumber)
        return '';
    return accountNumber.replace(/[\s-]/g, '').trim();
}
/**
 * Sanitizes and validates an Indian Financial System Code (IFSC).
 * Format: 4 alphabetic characters, followed by 0, followed by 6 alphanumeric characters.
 */
function sanitizeIfsc(ifsc) {
    if (!ifsc)
        return '';
    return ifsc.toUpperCase().replace(/\s/g, '').trim();
}
exports.IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
//# sourceMappingURL=crypto.js.map