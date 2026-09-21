import mongoose, { Model, Schema } from 'mongoose';
import { IInstallation } from '@/types/installation';

const InstallationSchema = new Schema<IInstallation>(
  {
    productType: {
      type: String,
      required: true,
      unique: true,
      enum: ['dstv', 'gotv', 'dstv-with-dish', 'dstv-explora'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Installation: Model<IInstallation> =
  mongoose.models.Installation || mongoose.model<IInstallation>('Installation', InstallationSchema);
