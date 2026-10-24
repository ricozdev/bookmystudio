import mongoose, { Document, Schema } from 'mongoose';

export interface ICompareItem extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  studio: mongoose.Types.ObjectId;
  createdAt: Date;
}

const compareItemSchema = new Schema<ICompareItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studio: {
      type: Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
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

compareItemSchema.index({ user: 1, studio: 1 }, { unique: true });

export const CompareItem = mongoose.model<ICompareItem>('CompareItem', compareItemSchema);
