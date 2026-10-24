import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'reviewed' | 'confirmed' | 'declined' | 'cancelled';
export type ListingType = 'studio' | 'location' | 'equipment' | 'crew';

export interface IBookingPricingBreakdown {
  baseRate: number;
  rateType: 'hourly' | 'daily' | 'weekly';
  durationUnits: number;
  subtotal: number;
  addonsTotal: number;
  insurancePolicyFee: number;
  taxes: number;
  total: number;
}

export interface IBookingRequest extends Document {
  _id: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  listingType: ListingType;
  studio?: mongoose.Types.ObjectId | null;
  location?: mongoose.Types.ObjectId | null;
  equipment?: mongoose.Types.ObjectId | null;
  crew?: mongoose.Types.ObjectId | null;
  studioOwner?: mongoose.Types.ObjectId | null;
  requestedDate: Date;
  startTime?: string;
  endTime?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  shiftType: string;
  durationHours: number;
  productionName: string;
  contactEmail: string;
  contactPhone?: string;
  attendeesCount?: number;
  powerAddon: boolean;
  riggingAddon: boolean;
  estimatedTotal: number;
  pricingBreakdown?: IBookingPricingBreakdown;
  specialInstructions?: string;
  status: BookingStatus;
  holdExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookingRequestSchema = new Schema<IBookingRequest>(
  {
    customer: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      default: null,
      index: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'FilmingLocation',
      default: null,
      index: true,
    },
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      default: null,
      index: true,
    },
    crew: {
      type: Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      default: null,
      index: true,
    },
    studioOwner: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.Mixed,
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

// Compound indexes for conflict resolution queries
bookingRequestSchema.index({ studio: 1, startDateTime: 1, endDateTime: 1, status: 1 });
bookingRequestSchema.index({ location: 1, startDateTime: 1, endDateTime: 1, status: 1 });
bookingRequestSchema.index({ equipment: 1, startDateTime: 1, endDateTime: 1, status: 1 });
bookingRequestSchema.index({ crew: 1, startDateTime: 1, endDateTime: 1, status: 1 });

export const BookingRequest = mongoose.model<IBookingRequest>('BookingRequest', bookingRequestSchema);
