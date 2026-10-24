import mongoose, { Document, Schema } from 'mongoose';
import { ListingReviewStatus } from './studio.model';
import { IOperatingHours, IBlockedDateRange, defaultOperatingHours } from './availability.types';

export type CrewRoleCategory =
  | 'camera_lighting'
  | 'grip_sound'
  | 'styling_art'
  | 'post_production'
  | 'production';

export interface IProfessionalProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | null;
  name: string;
  slug: string;
  role: string;
  category: CrewRoleCategory;
  rating: number;
  reviewCount: number;
  location: string;
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
  serviceRadiusKm?: number;
  serviceCities?: string[];
  credits: string;
  bio: string;
  skills: string[];
  workingKit: string;
  dayRate10h: number;
  nextAvailable: string;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  unionAffiliation: string;
  standardKitIncluded: boolean;
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

const professionalSchema = new Schema<IProfessionalProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Professional name is required'],
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
    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['camera_lighting', 'grip_sound', 'styling_art', 'post_production', 'production'],
      required: true,
      index: true,
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
      isExactAddressPublic: { type: Boolean, default: false },
      placeId: { type: String, default: null },
      landmark: { type: String, default: '' },
      arrivalInstructions: { type: String, default: '' },
      mapUrl: { type: String, default: null, trim: true },
    },
    mapUrl: { type: String, default: null, trim: true },
    serviceRadiusKm: {
      type: Number,
      default: 50,
      min: 1,
    },
    serviceCities: {
      type: [String],
      default: [],
    },
    credits: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    workingKit: {
      type: String,
      default: '',
    },
    dayRate10h: {
      type: Number,
      required: true,
      min: 0,
    },
    nextAvailable: {
      type: String,
      default: 'Immediate / Next Monday',
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
    unionAffiliation: {
      type: String,
      default: 'Non-Union / Commercial Independent',
    },
    standardKitIncluded: {
      type: Boolean,
      default: true,
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

professionalSchema.pre('save', function (next) {
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

professionalSchema.index({ name: 'text', role: 'text', bio: 'text', skills: 'text' });
professionalSchema.index({ locationGeo: '2dsphere' });

export const ProfessionalProfile = mongoose.model<IProfessionalProfile>('ProfessionalProfile', professionalSchema);
