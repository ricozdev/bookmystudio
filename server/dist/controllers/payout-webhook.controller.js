"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpayWebhookSignature = verifyRazorpayWebhookSignature;
exports.handlePayoutWebhook = handlePayoutWebhook;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const payout_settings_model_1 = require("../models/payout-settings.model");
/**
 * Verifies Razorpay webhook signature using HMAC-SHA256.
 */
function verifyRazorpayWebhookSignature(rawBody, signature, secret) {
    if (!rawBody || !signature || !secret) {
        return false;
    }
    const expectedSignature = crypto_1.default
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return crypto_1.default.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'));
}
/**
 * POST /api/payout-settings/webhooks
 * Handles incoming Razorpay Route webhook events for linked account lifecycle.
 */
async function handlePayoutWebhook(req, res) {
    const webhookSecret = env_1.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        res.status(200).json({
            received: true,
            processed: false,
            message: 'Razorpay webhook secret not configured on platform. Event ignored.',
        });
        return;
    }
    const signature = req.headers['x-razorpay-signature'] || '';
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret)) {
        res.status(400).json({
            success: false,
            error: 'Invalid Razorpay webhook signature',
        });
        return;
    }
    const event = req.body?.event;
    const accountEntity = req.body?.payload?.account?.entity;
    const accountId = accountEntity?.id;
    if (!accountId) {
        res.status(200).json({ received: true, processed: false, reason: 'No account ID in payload' });
        return;
    }
    const settings = await payout_settings_model_1.PayoutSettings.findOne({ razorpayAccountId: accountId });
    if (!settings) {
        res.status(200).json({ received: true, processed: false, reason: 'Linked account not found' });
        return;
    }
    switch (event) {
        case 'account.activated':
            settings.providerOnboardingStatus = 'activated';
            settings.status = 'VERIFIED_READY';
            settings.statusMessage = 'Your payout account is verified and ready to receive booking funds.';
            settings.auditLog.push({
                action: 'WEBHOOK_ACCOUNT_ACTIVATED',
                performedAt: new Date(),
                note: 'Razorpay Route webhook: account.activated',
            });
            break;
        case 'account.under_review':
            settings.providerOnboardingStatus = 'under_review';
            settings.status = 'SUBMITTED_FOR_VERIFICATION';
            settings.statusMessage = 'Your account details are currently under verification review by Razorpay.';
            settings.auditLog.push({
                action: 'WEBHOOK_ACCOUNT_UNDER_REVIEW',
                performedAt: new Date(),
                note: 'Razorpay Route webhook: account.under_review',
            });
            break;
        case 'account.needs_clarification':
            settings.providerOnboardingStatus = 'needs_clarification';
            settings.status = 'ACTION_REQUIRED';
            settings.statusMessage =
                'Action required: Additional documentation requested by Razorpay Route.';
            settings.auditLog.push({
                action: 'WEBHOOK_NEEDS_CLARIFICATION',
                performedAt: new Date(),
                note: 'Razorpay Route webhook: account.needs_clarification',
            });
            break;
        case 'account.rejected':
        case 'account.suspended':
            settings.providerOnboardingStatus = event === 'account.rejected' ? 'rejected' : 'suspended';
            settings.status = 'UNAVAILABLE';
            settings.statusMessage = `Payout services ${event === 'account.rejected' ? 'rejected' : 'suspended'} by payment provider.`;
            settings.auditLog.push({
                action: `WEBHOOK_${event.toUpperCase().replace('.', '_')}`,
                performedAt: new Date(),
                note: `Razorpay Route webhook: ${event}`,
            });
            break;
        default:
            // Other unhandled events
            break;
    }
    await settings.save();
    res.status(200).json({
        received: true,
        processed: true,
        event,
        accountId,
    });
}
//# sourceMappingURL=payout-webhook.controller.js.map