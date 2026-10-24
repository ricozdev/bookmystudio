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
exports.BookingRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bookingRequestSchema = new mongoose_1.Schema({
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    listingType: {
        type: String,
        enum: ['studio', 'location', 'equipment', 'crew'],
        default: 'studio',
        required: true,
        index: true,
    },
    studio: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Studio',
        default: null,
        index: true,
    },
    location: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'FilmingLocation',
        default: null,
        index: true,
    },
    equipment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Equipment',
        default: null,
        index: true,
    },
    crew: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ProfessionalProfile',
        default: null,
        index: true,
    },
    studioOwner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    requestedDate: {
        type: Date,
        required: [true, 'Requested shoot date is required'],
        index: true,
    },
    startTime: {
        type: String,
        default: '09:00',
    },
    endTime: {
        type: String,
        default: '19:00',
    },
    startDateTime: {
        type: Date,
        index: true,
    },
    endDateTime: {
        type: Date,
        index: true,
    },
    shiftType: {
        type: String,
        default: '10h Standard Shoot Day',
    },
    durationHours: {
        type: Number,
        default: 10,
        min: 1,
    },
    productionName: {
        type: String,
        required: [true, 'Production or Agency name is required'],
        trim: true,
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
    },
    contactPhone: {
        type: String,
        default: '',
        trim: true,
    },
    attendeesCount: {
        type: Number,
        default: 10,
        min: 1,
    },
    powerAddon: {
        type: Boolean,
        default: false,
    },
    riggingAddon: {
        type: Boolean,
        default: false,
    },
    estimatedTotal: {
        type: Number,
        required: true,
        min: 0,
    },
    pricingBreakdown: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null,
    },
    specialInstructions: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'confirmed', 'declined', 'cancelled'],
        default: 'pending',
        index: true,
    },
    holdExpiresAt: {
        type: Date,
        default: null,
        index: true,
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
// Compound indexes for conflict resolution queries
bookingRequestSchema.index({ studio: 1, startDateTime: 1, endDateTime: 1, status: 1 });
bookingRequestSchema.index({ location: 1, startDateTime: 1, endDateTime: 1, status: 1 });
bookingRequestSchema.index({ equipment: 1, startDateTime: 1, endDateTime: 1, status: 1 });
bookingRequestSchema.index({ crew: 1, startDateTime: 1, endDateTime: 1, status: 1 });
exports.BookingRequest = mongoose_1.default.model('BookingRequest', bookingRequestSchema);
//# sourceMappingURL=booking.model.js.map