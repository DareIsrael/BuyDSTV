import mongoose, { Model, Schema } from 'mongoose';
import { IPackage } from '@/types/package';

const PackageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    productType: {
      type: String,
      required: true,
      enum: ['dstv', 'gotv', 'dstv-with-dish'],
    },
  },
  {
    timestamps: true,
  }
);

export const Package: Model<IPackage> =
  mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema);