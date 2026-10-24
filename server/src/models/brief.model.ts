import mongoose, { Document, Schema } from 'mongoose';

export interface IProductionBrief extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  projectName: string;
  productionType: string;
  shootDate?: Date | null;
  durationHours: number;
  budgetExpectation?: string;
  requirements?: string;
  selectedResources: {
    studios: mongoose.Types.ObjectId[];
    locations: mongoose.Types.ObjectId[];
    crew: mongoose.Types.ObjectId[];
    equipment: mongoose.Types.ObjectId[];
  };
  status: 'draft' | 'submitted' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const productionBriefSchema = new Schema<IProductionBrief>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    productionType: {
      type: String,
      required: [true, 'Production type is required'],
      default: 'Commercial Shoot',
    },
    shootDate: {
      type: Date,
      default: null,
    },
    durationHours: {
      type: Number,
      default: 10,
      min: 1,
    },
    budgetExpectation: {
      type: String,
      default: '',
    },
    requirements: {
      type: String,
      default: '',
    },
    selectedResources: {
      studios: [{ type: Schema.Types.ObjectId, ref: 'Studio' }],
      locations: [{ type: Schema.Types.ObjectId, ref: 'FilmingLocation' }],
      crew: [{ type: Schema.Types.ObjectId, ref: 'ProfessionalProfile' }],
      equipment: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'active', 'completed', 'archived'],
      default: 'draft',
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

export const ProductionBrief = mongoose.model<IProductionBrief>('ProductionBrief', productionBriefSchema);
