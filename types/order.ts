export interface IOrder {
  _id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  package: string;
  totalPrice: number;
  installation: boolean;
  installationPrice: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  orderStatus: 'processing' | 'On the way' | 'delivered' | 'cancelled';
  reference: string;
  /** Paystack reference of the most recent payment attempt (defaults to `reference`). */
  paymentReference?: string;
  /** Every Paystack reference initialized for this order (used by verify/webhook lookups). */
  paymentReferences?: string[];
  /** Number of payment initializations performed for this order. */
  paymentAttempts?: number;
  /** Paystack checkout URL of the most recent attempt. */
  authorizationUrl?: string;
  /** When the most recent payment attempt was initialized. */
  lastPaymentAttemptAt?: Date;
  /** Short-lived lock that serializes concurrent payment re-initializations. */
  paymentLockUntil?: Date;
  /** When the abandoned-payment reminder email was sent (set once per order). */
  reminderSentAt?: Date;
  /** When a reminder run claimed this order (prevents concurrent duplicate sends). */
  reminderClaimedAt?: Date;
  /** Number of failed attempts to deliver the reminder email. */
  reminderFailures?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  package: string;
  totalPrice: number;
  installation: boolean;
  installationPrice: number;
  reference: string;
  paymentReference?: string;
  paymentReferences?: string[];
  paymentAttempts?: number;
  authorizationUrl?: string;
  lastPaymentAttemptAt?: Date;
}

export interface PaymentInitializeRequest {
  email: string;
  amount: number;
  productType: 'dstv' | 'gotv' | 'dstv-with-dish' | 'dstv-explora';
  package: string;
  customerName: string;
  phone: string;
  address: string;
  customerId: string;
  installation?: boolean;
}

export interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    amount: number;
    status: string;
    reference: string;
  };
}
