import mongoose, { Model, Schema } from 'mongoose';
import { IOrder } from '@/types/order';

const OrderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: String,
      required: true,
    },
    package: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['processing', 'On the way', 'delivered', 'cancelled'],
      default: 'processing',
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);