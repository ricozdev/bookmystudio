import mongoose, { Document, Schema } from 'mongoose';
import { IOperatingHours, IBlockedDateRange, defaultOperatingHours } from './availability.types';

export type StudioCategory =
  | 'cyclorama'
  | 'soundstage'
  | 'daylight'
  | 'podcast'
  | 'kitchen'
  | 'industrial';

export type ListingReviewStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface IStudio extends Document {
  _id: mongoose.Types.ObjectId;
  owner?: mongoose.Types.ObjectId | null;
  name: string;
  slug: string;
  category: StudioCategory;
  categoryLabel: string;
  badgeTopLeft: string;
  badgeTopSecondary?: string;
  rating: number;
  reviewCount: number;
  location: string;
  submarket: string;
  locationGeo?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  locationAddress?: {
    formatted?: string;
    street?: string;
    building?: string;
    city?: string;
    locality?: string;
    state?: string;
    pincode?: string;
    country?: string;
    accuracy?: 'rooftop' | 'street' | 'locality' | 'city' | 'approximate' | 'manual';
    isExactAddressPublic?: boolean;
    placeId?: string;
    landmark?: string;
    arrivalInstructions?: string;
    mapUrl?: string | null;
  };
  mapUrl?: string | null;
  description: string;
  specs: {
    sqFt: number;
    gridHeight: string;
    power: string;
    access: string;
  };
  amenities: string[];
  equipmentHighlight: string;
  hourlyRate: number;
  dayRate10h: number;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  features: {
    camlockPower: boolean;
    driveInAccess: boolean;
    stc60Certified: boolean;
    northDaylight: boolean;
    gripPackageIncluded: boolean;
  };
  operatingHours?: IOperatingHours;
  blockedDates?: IBlockedDateRange[];
  publicationStatus: 'published' | 'draft' | 'archived';
  reviewStatus: ListingReviewStatus;
  reviewFeedback?: string | null;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewedAt?: Date | null;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const studioSchema = new Schema<IStudio>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Studio name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Studio slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['cyclorama', 'soundstage', 'daylight', 'podcast', 'kitchen', 'industrial'],
      required: true,
      index: true,
    },
    categoryLabel: {
      type: String,
      required: true,
    },
    badgeTopLeft: {
      type: String,
      default: 'VERIFIED STAGE',
    },
    badgeTopSecondary: {
      type: String,
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
    specs: {
      sqFt: { type: Number, required: true },
      gridHeight: { type: String, required: true },
      power: { type: String, required: true },
      access: { type: String, required: true },
    },
    amenities: {
      type: [String],
      default: [],
    },
    equipmentHighlight: {
      type: String,
      default: '',
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    dayRate10h: {
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
    features: {
      camlockPower: { type: Boolean, default: false },
      driveInAccess: { type: Boolean, default: false },
      stc60Certified: { type: Boolean, default: false },
      northDaylight: { type: Boolean, default: false },
      gripPackageIncluded: { type: Boolean, default: false },
    },
    operatingHours: {
      type: {
        openingTime: { type: String, default: defaultOperatingHours.openingTime },
        closingTime: { type: String, default: defaultOperatingHours.closingTime },
        operatingDays: { type: [Number], default: defaultOperatingHours.operatingDays },
        slotIncrementMinutes: { type: Number, default: defaultOperatingHours.slotIncrementMinutes },
        minDurationHours: { type: Number, default: defaultOperatingHours.minDurationHours },
        maxDurationHours: { type: Number, default: defaultOperatingHours.maxDurationHours },
        bufferMinutes: { type: Number, default: defaultOperatingHours.bufferMinutes },
        timezone: { type: String, default: defaultOperatingHours.timezone },
      },
      default: () => ({ ...defaultOperatingHours }),
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
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

studioSchema.pre('save', function (next) {
  if (this.locationGeo) {
    const coords = this.locationGeo.coordinates;
    if (
      !coords ||
      !Array.isArray(coords) ||
      coords.length < 2 ||
      typeof coords[0] !== 'number' ||
      typeof coords[1] !== 'number' ||
      isNaN(coords[0]) ||
      isNaN(coords[1]) ||
      coords[0] < -180 ||
      coords[0] > 180 ||
      coords[1] < -90 ||
      coords[1] > 90
    ) {
      this.locationGeo = undefined;
    } else {
      this.locationGeo.type = 'Point';
    }
  }
  next();
});

studioSchema.index({ name: 'text', description: 'text', location: 'text', submarket: 'text' });
studioSchema.index({ locationGeo: '2dsphere' });

export const Studio = mongoose.model<IStudio>('Studio', studioSchema);
