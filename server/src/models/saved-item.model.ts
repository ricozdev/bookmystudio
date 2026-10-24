import mongoose, { Document, Schema } from 'mongoose';

export type SavedItemType = 'studio' | 'location' | 'crew' | 'equipment';

export interface ISavedItem extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  itemType: SavedItemType;
  itemId: string;
  studio?: mongoose.Types.ObjectId | null;
  location?: mongoose.Types.ObjectId | null;
  crew?: mongoose.Types.ObjectId | null;
  equipment?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const savedItemSchema = new Schema<ISavedItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['studio', 'location', 'crew', 'equipment'],
      required: true,
      index: true,
    },
    itemId: {
      type: String,
      required: true,
      trim: true,
    },
    studio: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      default: null,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'FilmingLocation',
      default: null,
    },
    crew: {
      type: Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      default: null,
    },
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
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

savedItemSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

export const SavedItem = mongoose.model<ISavedItem>('SavedItem', savedItemSchema);
