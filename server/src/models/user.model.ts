import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'CUSTOMER' | 'STUDIO_OWNER' | 'PROFESSIONAL' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  isVerified: boolean;
  verificationToken?: string | null;
  verificationExpires?: Date | null;
  verificationOtp?: string | null;
  verificationOtpExpires?: Date | null;
  lastVerificationSentAt?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  accountStatus: AccountStatus;
  avatarUrl?: string | null;
  companyName?: string | null;
  phone?: string | null;
  isPhoneVerified: boolean;
  phoneVerifiedAt?: Date | null;
  pendingPhone?: string | null;
  phoneOtpHash?: string | null;
  phoneOtpExpires?: Date | null;
  phoneOtpAttempts?: number;
  phoneOtpLastSentAt?: Date | null;
  bio?: string | null;
  lastSeenAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  hashPassword(plaintext: string): Promise<string>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
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
  }
);

userSchema.statics.hashPassword = async function (plaintext: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plaintext, salt);
};

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) {
    throw new Error('Password hash is not loaded on user document');
  }
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
