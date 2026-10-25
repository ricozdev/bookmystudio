import mongoose, { Document, Schema } from 'mongoose';

export type PaymentAttemptStatus = 'created' | 'attempted' | 'captured' | 'failed';

export interface IWebhookEventRecord {
  event: string;
  receivedAt: Date;
  eventId?: string;
  payload?: any;
}

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  amount: number; // In smallest currency subunit (paise for INR)
  currency: string;
  status: PaymentAttemptStatus;
  failureReason?: string | null;
  method?: string | null;
  notes?: Record<string, unknown>;
  verifiedAt?: Date | null;
  webhookEvents: IWebhookEventRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'BookingRequest',
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['created', 'attempted', 'captured', 'failed'],
      default: 'created',
      index: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      default: null,
    },
    notes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    webhookEvents: [
      {
        event: { type: String, required: true },
        receivedAt: { type: Date, default: Date.now },
        eventId: { type: String, default: null },
        payload: { type: Schema.Types.Mixed, default: {} },
      },
    ],
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

paymentSchema.index({ razorpayOrderId: 1, razorpayPaymentId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

