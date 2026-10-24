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
exports.FilmingLocationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const availability_types_1 = require("./availability.types");
const locationSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Location slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        enum: ['industrial', 'loft', 'warehouse', 'rooftop', 'commercial', 'outdoor'],
        required: true,
        index: true,
    },
    categoryLabel: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    location: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    submarket: {
        type: String,
        required: true,
        trim: true,
    },
    locationGeo: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        },
    },
    locationAddress: {
        formatted: { type: String, default: '' },
        street: { type: String, default: '' },
        building: { type: String, default: '' },
        locality: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
        accuracy: {
            type: String,
            enum: ['rooftop', 'street', 'locality', 'city', 'approximate', 'manual'],
            default: 'approximate',
        },
        isExactAddressPublic: { type: Boolean, default: true },
        placeId: { type: String, default: null },
        landmark: { type: String, default: '' },
        arrivalInstructions: { type: String, default: '' },
        mapUrl: { type: String, default: null, trim: true },
    },
    mapUrl: { type: String, default: null, trim: true },
    description: {
        type: String,
        required: true,
    },
    areaSqFt: {
        type: Number,
        required: true,
    },
    ceilingHeight: {
        type: String,
        required: true,
    },
    powerSupply: {
        type: String,
        required: true,
    },
    vehicleAccess: {
        type: String,
        required: true,
    },
    curfewRestrictions: {
        type: String,
        default: 'None / 24/7 filming permitted',
    },
    permitsRequired: {
        type: String,
        default: 'Standard NYC Mayor\'s Office Film Permit',
    },
    amenities: {
        type: [String],
        default: [],
    },
    dayRate10h: {
        type: Number,
        required: true,
        min: 0,
    },
    hourlyRate: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    galleryImages: {
        type: [String],
        default: [],
    },
    imageAlt: {
        type: String,
        default: '',
    },
    featured: {
        type: Boolean,
        default: false,
        index: true,
    },
    operatingHours: {
        type: {
            openingTime: { type: String, default: availability_types_1.defaultOperatingHours.openingTime },
            closingTime: { type: String, default: availability_types_1.defaultOperatingHours.closingTime },
            operatingDays: { type: [Number], default: availability_types_1.defaultOperatingHours.operatingDays },
            slotIncrementMinutes: { type: Number, default: availability_types_1.defaultOperatingHours.slotIncrementMinutes },
            minDurationHours: { type: Number, default: availability_types_1.defaultOperatingHours.minDurationHours },
            maxDurationHours: { type: Number, default: availability_types_1.defaultOperatingHours.maxDurationHours },
            bufferMinutes: { type: Number, default: availability_types_1.defaultOperatingHours.bufferMinutes },
            timezone: { type: String, default: availability_types_1.defaultOperatingHours.timezone },
        },
        default: () => ({ ...availability_types_1.defaultOperatingHours }),
    },
    blockedDates: {
        type: [
            {
                startDate: { type: String, required: true },
                endDate: { type: String, required: true },
                startTime: { type: String, default: null },
                endTime: { type: String, default: null },
                reason: { type: String, default: 'Unavailable' },
            },
        ],
        default: [],
    },
    publicationStatus: {
        type: String,
        enum: ['published', 'draft', 'archived'],
        default: 'published',
        index: true,
    },
    reviewStatus: {
        type: String,
        enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'SUSPENDED'],
        default: 'PENDING_REVIEW',
        index: true,
    },
    reviewFeedback: {
        type: String,
        default: null,
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
locationSchema.pre('save', function (next) {
    if (this.locationGeo) {
        const coords = this.locationGeo.coordinates;
        if (!coords ||
            !Array.isArray(coords) ||
            coords.length < 2 ||
            typeof coords[0] !== 'number' ||
            typeof coords[1] !== 'number' ||
            isNaN(coords[0]) ||
            isNaN(coords[1]) ||
            coords[0] < -180 ||
            coords[0] > 180 ||
            coords[1] < -90 ||
            coords[1] > 90) {
            this.locationGeo = undefined;
        }
        else {
            this.locationGeo.type = 'Point';
        }
    }
    next();
});
locationSchema.index({ name: 'text', description: 'text', location: 'text' });
locationSchema.index({ locationGeo: '2dsphere' });
exports.FilmingLocationModel = mongoose_1.default.model('FilmingLocation', locationSchema);
//# sourceMappingURL=location.model.js.map