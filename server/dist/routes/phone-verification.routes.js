"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneVerificationRouter = void 0;
const express_1 = require("express");
const phone_verification_controller_1 = require("../controllers/phone-verification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const phone_verification_validator_1 = require("../validators/phone-verification.validator");
exports.phoneVerificationRouter = (0, express_1.Router)();
// Retrieve phone status and verification state
exports.phoneVerificationRouter.get('/status', auth_middleware_1.requireAuth, phone_verification_controller_1.getPhoneStatus);
// Send 6-digit OTP to unverified or changed phone number
exports.phoneVerificationRouter.post('/send-otp', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(phone_verification_validator_1.sendPhoneOtpSchema), phone_verification_controller_1.sendPhoneOtp);
// Verify 6-digit OTP code
exports.phoneVerificationRouter.post('/verify-otp', auth_middleware_1.requireAuth, (0, validate_middleware_1.validateBody)(phone_verification_validator_1.verifyPhoneOtpSchema), phone_verification_controller_1.verifyPhoneOtp);
// Remove or unlink phone number
exports.phoneVerificationRouter.delete('/', auth_middleware_1.requireAuth, phone_verification_controller_1.removePhone);
//# sourceMappingURL=phone-verification.routes.js.map