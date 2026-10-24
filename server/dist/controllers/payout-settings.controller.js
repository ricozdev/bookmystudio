"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayoutSettings = getPayoutSettings;
exports.savePayoutSettings = savePayoutSettings;
exports.initiateProviderOnboarding = initiateProviderOnboarding;
exports.getPayoutStatus = getPayoutStatus;
const payout_settings_model_1 = require("../models/payout-settings.model");
const crypto_1 = require("../utils/crypto");
const razorpay_route_service_1 = require("../services/razorpay-route.service");
/**
 * GET /api/payout-settings
 * Returns the authenticated user's current payout settings status and masked display details.
 */
async function getPayoutSettings(req, res, next) {
    try {
        const userId = req.user._id;
        const settings = await payout_settings_model_1.PayoutSettings.findOne({ user: userId });
        const isProviderConfigured = razorpay_route_service_1.razorpayRouteService.isConfigured();
        if (!settings) {
            res.status(200).json({
                success: true,
                data: {
                    hasPayoutSettings: false,
                    status: 'NOT_SET_UP',
                    statusMessage: 'Connect your bank account to prepare to receive payments from your bookings.',
                    provider: 'razorpay',
                    providerOnboardingConnected: false,
                    providerConfigured: isProviderConfigured,
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: settings.toSafeResponse(isProviderConfigured),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/payout-settings
 * Creates or updates the authenticated user's payout bank account details.
 * Encrypts sensitive account numbers with AES-256-GCM and stores only masked data for display.
 */
async function savePayoutSettings(req, res, next) {
    try {
        const userId = req.user._id;
        const input = req.body;
        const isProviderConfigured = razorpay_route_service_1.razorpayRouteService.isConfigured();
        let existing = await payout_settings_model_1.PayoutSettings.findOne({ user: userId }).select('+encryptedAccountNumber +accountNumberIv +accountNumberTag');
        // Initial setup requires an account number
        if (!existing && !input.accountNumber) {
            res.status(400).json({
                success: false,
                error: 'Bank account number is required when setting up payout details for the first time.',
                code: 'ACCOUNT_NUMBER_REQUIRED',
            });
            return;
        }
        let encryptedData = null;
        let last4 = existing?.accountNumberLast4 || '';
        if (input.accountNumber) {
            encryptedData = (0, crypto_1.encryptSensitiveData)(input.accountNumber);
            last4 = input.accountNumber.slice(-4);
        }
        const auditAction = existing ? 'UPDATED_BANK_DETAILS' : 'CREATED_BANK_DETAILS';
        const auditEntry = {
            action: auditAction,
            performedAt: new Date(),
            ip: req.ip || null,
            note: input.accountNumber ? 'Updated bank account number and IFSC' : 'Updated account metadata',
        };
        if (!existing) {
            // Create new record
            existing = new payout_settings_model_1.PayoutSettings({
                user: userId,
                accountHolderName: input.accountHolderName,
                accountHolderType: input.accountHolderType,
                accountType: input.accountType,
                accountNumberLast4: last4,
                encryptedAccountNumber: encryptedData.encrypted,
                accountNumberIv: encryptedData.iv,
                accountNumberTag: encryptedData.tag,
                ifsc: input.ifsc,
                bankName: input.bankName || null,
                businessName: input.businessName || null,
                businessType: input.businessType || null,
                businessGstin: input.businessGstin || null,
                provider: 'razorpay',
                providerOnboardingStatus: 'not_created',
                status: isProviderConfigured ? 'SUBMITTED_FOR_VERIFICATION' : 'AWAITING_PROVIDER_CONNECTION',
                statusMessage: isProviderConfigured
                    ? 'Your details have been submitted. Verification may still be required.'
                    : 'Your payout settings can be prepared now. Payment-provider activation and verification will be completed by the deployment team.',
                missingRequirements: isProviderConfigured ? [] : ['provider_route_activation'],
                auditLog: [auditEntry],
            });
        }
        else {
            // Update existing record
            existing.accountHolderName = input.accountHolderName;
            existing.accountHolderType = input.accountHolderType;
            existing.accountType = input.accountType;
            existing.ifsc = input.ifsc;
            if (input.bankName !== undefined)
                existing.bankName = input.bankName || null;
            if (input.businessName !== undefined)
                existing.businessName = input.businessName || null;
            if (input.businessType !== undefined)
                existing.businessType = input.businessType || null;
            if (input.businessGstin !== undefined)
                existing.businessGstin = input.businessGstin || null;
            if (encryptedData) {
                existing.encryptedAccountNumber = encryptedData.encrypted;
                existing.accountNumberIv = encryptedData.iv;
                existing.accountNumberTag = encryptedData.tag;
                existing.accountNumberLast4 = last4;
            }
            existing.status = isProviderConfigured ? 'SUBMITTED_FOR_VERIFICATION' : 'AWAITING_PROVIDER_CONNECTION';
            existing.statusMessage = isProviderConfigured
                ? 'Your updated bank details have been saved.'
                : 'Your payout settings can be prepared now. Payment-provider activation and verification will be completed by the deployment team.';
            if (!existing.auditLog) {
                existing.auditLog = [];
            }
            existing.auditLog.push(auditEntry);
        }
        await existing.save();
        res.status(200).json({
            success: true,
            message: 'Payout details saved successfully.',
            data: existing.toSafeResponse(isProviderConfigured),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/payout-settings/onboarding
 * Initiates Razorpay Route linked account onboarding if credentials and route are configured.
 */
async function initiateProviderOnboarding(req, res, next) {
    try {
        const userId = req.user._id;
        const isConfigured = razorpay_route_service_1.razorpayRouteService.isConfigured();
        if (!isConfigured) {
            res.status(200).json({
                success: false,
                code: 'PROVIDER_NOT_CONFIGURED',
                error: 'Razorpay Route linked-account onboarding is not yet configured for this platform. Please contact platform administrators.',
                providerOnboardingConnected: false,
            });
            return;
        }
        const settings = await payout_settings_model_1.PayoutSettings.findOne({ user: userId });
        if (!settings) {
            res.status(400).json({
                success: false,
                error: 'Please save your bank account details before initiating provider onboarding.',
                code: 'SETTINGS_NOT_FOUND',
            });
            return;
        }
        // Call Razorpay Route
        const account = await razorpay_route_service_1.razorpayRouteService.createLinkedAccount({
            email: req.user.email,
            fullName: settings.accountHolderName,
            phone: req.user.phone || undefined,
            accountHolderType: settings.accountHolderType,
            legalBusinessName: settings.businessName || undefined,
            businessType: settings.businessType || undefined,
        });
        settings.razorpayAccountId = account.id;
        settings.providerOnboardingStatus = 'under_review';
        settings.status = 'SUBMITTED_FOR_VERIFICATION';
        settings.statusMessage = `Submitted to Razorpay Route (Account ID: ${account.id}). Under review.`;
        settings.auditLog.push({
            action: 'INITIATED_PROVIDER_ONBOARDING',
            performedAt: new Date(),
            ip: req.ip || null,
            note: `Linked account created: ${account.id}`,
        });
        await settings.save();
        res.status(200).json({
            success: true,
            message: 'Provider onboarding initiated successfully.',
            data: {
                providerAccountId: account.id,
                status: settings.status,
                providerOnboardingStatus: settings.providerOnboardingStatus,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/payout-settings/status
 * Returns the current validated status from the database and checks provider if connected.
 */
async function getPayoutStatus(req, res, next) {
    try {
        const userId = req.user._id;
        const settings = await payout_settings_model_1.PayoutSettings.findOne({ user: userId });
        const isProviderConfigured = razorpay_route_service_1.razorpayRouteService.isConfigured();
        if (!settings) {
            res.status(200).json({
                success: true,
                data: {
                    status: 'NOT_SET_UP',
                    statusLabel: 'Not Set Up',
                    statusMessage: 'Connect your bank account to prepare to receive payments from your bookings.',
                    providerOnboardingConnected: false,
                },
            });
            return;
        }
        // If an account is already linked and provider is configured, check for updates
        if (settings.razorpayAccountId && isProviderConfigured) {
            const providerData = await razorpay_route_service_1.razorpayRouteService.fetchAccountStatus(settings.razorpayAccountId);
            if (providerData && typeof providerData.status === 'string') {
                const rawStatus = providerData.status.toLowerCase();
                if (rawStatus === 'activated') {
                    settings.providerOnboardingStatus = 'activated';
                    settings.status = 'VERIFIED_READY';
                    settings.statusMessage = 'Your payout account is verified and ready to receive funds.';
                    await settings.save();
                }
                else if (rawStatus === 'needs_clarification') {
                    settings.providerOnboardingStatus = 'needs_clarification';
                    settings.status = 'ACTION_REQUIRED';
                    settings.statusMessage =
                        'Action required: Razorpay has requested additional verification documents.';
                    await settings.save();
                }
            }
        }
        const currentStatus = isProviderConfigured ? settings.status : 'AWAITING_PROVIDER_CONNECTION';
        const currentMessage = isProviderConfigured
            ? settings.statusMessage
            : 'Your payout settings can be prepared now. Payment-provider activation and verification will be completed by the deployment team.';
        res.status(200).json({
            success: true,
            data: {
                status: currentStatus,
                statusLabel: currentStatus === 'AWAITING_PROVIDER_CONNECTION' ? 'Awaiting Razorpay Route Connection' : currentStatus,
                statusMessage: currentMessage,
                providerOnboardingStatus: settings.providerOnboardingStatus,
                providerOnboardingConnected: Boolean(isProviderConfigured && settings.razorpayAccountId),
                updatedAt: settings.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=payout-settings.controller.js.map