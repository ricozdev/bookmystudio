"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutSettingsRouter = void 0;
const express_1 = require("express");
const payout_settings_controller_1 = require("../controllers/payout-settings.controller");
const payout_webhook_controller_1 = require("../controllers/payout-webhook.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const payout_settings_validator_1 = require("../validators/payout-settings.validator");
exports.payoutSettingsRouter = (0, express_1.Router)();
// Webhook endpoint (verified via HMAC-SHA256 signature, not user session)
exports.payoutSettingsRouter.post('/webhooks', payout_webhook_controller_1.handlePayoutWebhook);
// All user-facing payout routes require an authenticated user
exports.payoutSettingsRouter.use(auth_middleware_1.requireAuth);
// GET /api/payout-settings — Retrieve safe masked bank details & status
exports.payoutSettingsRouter.get('/', payout_settings_controller_1.getPayoutSettings);
// PUT /api/payout-settings — Save or update bank details
exports.payoutSettingsRouter.put('/', (0, validate_middleware_1.validateBody)(payout_settings_validator_1.savePayoutSettingsSchema), payout_settings_controller_1.savePayoutSettings);
// POST /api/payout-settings/onboarding — Initiate Razorpay Route linked account
exports.payoutSettingsRouter.post('/onboarding', payout_settings_controller_1.initiateProviderOnboarding);
// GET /api/payout-settings/status — Refresh and return latest verification status
exports.payoutSettingsRouter.get('/status', payout_settings_controller_1.getPayoutStatus);
//# sourceMappingURL=payout-settings.routes.js.map