"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const payoutAuditSchema = new mongoose_1.Schema({
    action: { type: String, required: true },
    performedAt: { type: Date, default: Date.now },
    ip: { type: String, default: null },
    note: { type: String, default: null },
}, { _id: false });
const payoutSettingsSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true,
        maxlength: [120, 'Account holder name cannot exceed 120 characters'],
    },
    accountHolderType: {
        type: String,
        enum: ['individual', 'business'],
        default: 'individual',
        required: true,
    },
    accountType: {
        type: String,
        enum: ['savings', 'current'],
        default: 'savings',
        required: true,
    },
    accountNumberLast4: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4,
    },
    encryptedAccountNumber: {
        type: String,
        required: true,
        select: false, // Protected: exclude from standard queries
    },
    accountNumberIv: {
        type: String,
        required: true,
        select: false,
    },
    accountNumberTag: {
        type: String,
        required: true,
        select: false,
    },
    ifsc: {
        type: String,
        required: [true, 'IFSC code is required'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide a valid 11-character Indian IFSC code'],
    },
    bankName: {
        type: String,
        trim: true,
        default: null,
    },
    businessName: {
        type: String,
        trim: true,
        default: null,
    },
    businessType: {
        type: String,
        trim: true,
        default: null,
    },
    businessPan: {
        type: String,
        trim: true,
        default: null,
        select: false,
    },
    businessGstin: {
        type: String,
        trim: true,
        default: null,
    },
    provider: {
        type: String,
        enum: ['razorpay'],
        default: 'razorpay',
        required: true,
    },
    razorpayAccountId: {
        type: String,
        default: null,
        index: true,
    },
    providerOnboardingStatus: {
        type: String,
        enum: [
            'not_created',
            'created',
            'under_review',
            'needs_clarification',
            'activated',
            'rejected',
            'suspended',
        ],
        default: 'not_created',
    },
    status: {
        type: String,
        enum: [
            'NOT_SET_UP',
            'DETAILS_INCOMPLETE',
            'DETAILS_SAVED',
            'AWAITING_PROVIDER_CONNECTION',
            'VERIFICATION_PENDING',
            'SUBMITTED_FOR_VERIFICATION',
            'VERIFICATION_REQUIRED',
            'VERIFIED_READY',
            'ACTION_REQUIRED',
            'UNAVAILABLE',
        ],
        default: 'DETAILS_INCOMPLETE',
    },
    statusMessage: {
        type: String,
        default: null,
    },
    missingRequirements: {
        type: [String],
        default: [],
    },
    auditLog: {
        type: [payoutAuditSchema],
        default: [],
    },
}, {
    timestamps: true,
});
/**
 * Returns a sanitized client representation of the payout settings,
 * never exposing full account numbers, encryption keys, or internal tokens.
 */
payoutSettingsSchema.methods.toSafeResponse = function (providerConfigured) {
    let displayStatus = this.status;
    let statusMessage = this.statusMessage;
    if (!providerConfigured) {
        displayStatus = 'AWAITING_PROVIDER_CONNECTION';
        statusMessage =
            'Your payout settings can be prepared now. Payment-provider activation and verification will be completed by the deployment team.';
    }
    const statusLabelMap = {
        NOT_SET_UP: 'Not Set Up',
        DETAILS_INCOMPLETE: 'Details Incomplete',
        DETAILS_SAVED: 'Details Saved',
        AWAITING_PROVIDER_CONNECTION: 'Awaiting Razorpay Route Connection',
        VERIFICATION_PENDING: 'Verification Pending',
        SUBMITTED_FOR_VERIFICATION: 'Submitted for Verification',
        VERIFICATION_REQUIRED: 'Verification Required',
        VERIFIED_READY: 'Verified / Ready',
        ACTION_REQUIRED: 'Action Required',
        UNAVAILABLE: 'Unavailable',
    };
    return {
        hasPayoutSettings: true,
        accountHolderName: this.accountHolderName,
        accountHolderType: this.accountHolderType,
        accountType: this.accountType,
        accountNumberMasked: `••••••••${this.accountNumberLast4}`,
        accountNumberLast4: this.accountNumberLast4,
        ifsc: this.ifsc,
        bankName: this.bankName,
        businessName: this.businessName,
        businessType: this.businessType,
        businessGstin: this.businessGstin,
        status: displayStatus,
        statusLabel: statusLabelMap[displayStatus] || displayStatus,
        statusMessage: statusMessage,
        provider: this.provider,
        providerOnboardingConnected: Boolean(providerConfigured && this.razorpayAccountId),
        providerAccountId: this.razorpayAccountId || null,
        providerOnboardingStatus: this.providerOnboardingStatus,
        missingRequirements: this.missingRequirements,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};
exports.PayoutSettings = mongoose_1.default.model('PayoutSettings', payoutSettingsSchema);
//# sourceMappingURL=payout-settings.model.js.map