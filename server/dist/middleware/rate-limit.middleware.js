"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.otpResendLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.NODE_ENV === 'test' ? 1000 : 15, // limit each IP to 15 login/register attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    skip: () => env_1.env.NODE_ENV === 'test',
});
exports.otpResendLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.NODE_ENV === 'test' ? 1000 : 5, // limit each IP to 5 OTP resends per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many verification code requests from this IP. Please wait 15 minutes before requesting another code.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    skip: () => env_1.env.NODE_ENV === 'test',
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: env_1.env.NODE_ENV === 'test' ? 5000 : 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    skip: () => env_1.env.NODE_ENV === 'test',
});
//# sourceMappingURL=rate-limit.middleware.js.map