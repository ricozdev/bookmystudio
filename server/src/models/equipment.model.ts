import mongoose, { Document, Schema } from 'mongoose';
import { ListingReviewStatus } from './studio.model';
import { IOperatingHours, IBlockedDateRange, defaultOperatingHours } from './availability.types';

export type EquipmentCategory =
  | 'cameras'
  | 'lighting'
  | 'grip'
  | 'audio'
  | 'monitoring'
  | 'packages';

export interface IEquipment extends Document {
  _id: mongoose.Types.ObjectId;
  owner?: mongoose.Types.ObjectId | null;
  name: string;
  slug: string;
  category: EquipmentCategory;
  categoryLabel: string;
  brand: string;
  rating: number;
  dayRate: number;
  weeklyRate: number;
  replacementValue: number;
  description: string;
  keySpecs: string[];
  includedAccessories: string[];
  powerRequirement: string;
  mountType?: string;
  location?: string;
  pickupLocation?: string;
  deliveryCoverageKm?: number;
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
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  featured: boolean;
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

const equipmentSchema = new Schema<IEquipment>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['cameras', 'lighting', 'grip', 'audio', 'monitoring', 'packages'],
      required: true,
      index: true,
    },
    categoryLabel: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    dayRate: {
      type: Number,
      required: true,
      min: 0,
    },
    weeklyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    replacementValue: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    keySpecs: {
      type: [String],
      default: [],
    },
    includedAccessories: {
      type: [String],
      default: [],
    },
    powerRequirement: {
      type: String,
      required: true,
    },
    mountType: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    pickupLocation: {
      type: String,
      default: '',
      trim: true,
    },
    deliveryCoverageKm: {
      type: Number,
      default: 30,
      min: 0,
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

equipmentSchema.pre('save', function (next) {
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

equipmentSchema.index({ name: 'text', brand: 'text', description: 'text', location: 'text' });
equipmentSchema.index({ locationGeo: '2dsphere' });

export const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);
