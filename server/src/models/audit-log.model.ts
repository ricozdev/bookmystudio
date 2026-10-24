import mongoose, { Document, Model, Schema } from 'mongoose';

export type AuditAction =
  | 'ADMIN_PROVISIONED'
  | 'USER_ROLE_ASSIGNED'
  | 'USER_ROLE_REVOKED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_ACTIVATED'
  | 'LISTING_APPROVED'
  | 'LISTING_CHANGES_REQUESTED'
  | 'LISTING_REJECTED'
  | 'LISTING_SUSPENDED'
  | 'BOOKING_STATUS_MODIFIED'
  | 'ADMIN_SETTINGS_UPDATED';

export type AuditTargetType = 'USER' | 'LISTING' | 'BOOKING' | 'SYSTEM' | 'SECURITY';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  adminName: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  details?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['USER', 'LISTING', 'BOOKING', 'SYSTEM', 'SECURITY'],
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetLabel: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
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

// Compound index for efficient activity timeline queries
auditLogSchema.index({ createdAt: -1, action: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

