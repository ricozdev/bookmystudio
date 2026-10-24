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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required'],
        select: false, // Do not return by default in queries
    },
    roles: {
        type: [String],
        enum: ['CUSTOMER', 'STUDIO_OWNER', 'PROFESSIONAL', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT'],
        default: ['CUSTOMER'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        select: false,
    },
    verificationExpires: {
        type: Date,
        select: false,
    },
    verificationOtp: {
        type: String,
        select: false,
    },
    verificationOtpExpires: {
        type: Date,
        select: false,
    },
    lastVerificationSentAt: {
        type: Date,
        select: false,
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        select: false,
    },
    accountStatus: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'PENDING'],
        default: 'ACTIVE',
    },
    avatarUrl: {
        type: String,
        default: null,
    },
    companyName: {
        type: String,
        default: null,
        trim: true,
    },
    phone: {
        type: String,
        default: null,
        trim: true,
        index: true,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
        index: true,
    },
    phoneVerifiedAt: {
        type: Date,
        default: null,
    },
    pendingPhone: {
        type: String,
        default: null,
        select: false,
    },
    phoneOtpHash: {
        type: String,
        default: null,
        select: false,
    },
    phoneOtpExpires: {
        type: Date,
        default: null,
        select: false,
    },
    phoneOtpAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    phoneOtpLastSentAt: {
        type: Date,
        default: null,
        select: false,
    },
    bio: {
        type: String,
        default: null,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    lastSeenAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            delete ret.passwordHash;
            delete ret.verificationToken;
            delete ret.verificationExpires;
            delete ret.verificationOtp;
            delete ret.verificationOtpExpires;
            delete ret.lastVerificationSentAt;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.pendingPhone;
            delete ret.phoneOtpHash;
            delete ret.phoneOtpExpires;
            delete ret.phoneOtpAttempts;
            delete ret.phoneOtpLastSentAt;
            return ret;
        },
    },
});
userSchema.statics.hashPassword = async function (plaintext) {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(plaintext, salt);
};
userSchema.methods.comparePassword = async function (candidate) {
    if (!this.passwordHash) {
        throw new Error('Password hash is not loaded on user document');
    }
    return bcryptjs_1.default.compare(candidate, this.passwordHash);
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=user.model.js.map