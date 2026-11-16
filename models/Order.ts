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
    installation: {
      type: Boolean,
      default: false,
    },
    installationPrice: {
      type: Number,
      default: 0,
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
    // Paystack reference of the most recent payment attempt.
    paymentReference: {
      type: String,
    },
    // Every Paystack reference initialized for this order (retries use new references).
    paymentReferences: {
      type: [String],
      default: undefined,
    },
    paymentAttempts: {
      type: Number,
      default: 1,
      min: 0,
    },
    // Paystack checkout URL of the most recent attempt.
    authorizationUrl: {
      type: String,
    },
    lastPaymentAttemptAt: {
      type: Date,
    },
    // Short-lived lock that serializes concurrent payment re-initializations.
    paymentLockUntil: {
      type: Date,
    },
    // Abandoned-payment reminder bookkeeping.
    reminderSentAt: {
      type: Date,
    },
    reminderClaimedAt: {
      type: Date,
    },
    reminderFailures: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
// Lookup by any Paystack attempt reference (payment retries)
OrderSchema.index({ paymentReferences: 1 });
// Abandoned-payment reminder scan
OrderSchema.index({ paymentStatus: 1, reminderSentAt: 1, createdAt: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
