import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { paystackService } from '@/services/paystack.service';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
import { generateReference } from '@/lib/utils';
import { getPaymentRetryEligibility, RetryIneligibleReason } from '@/lib/order-payment';
import { IOrder } from '@/types/order';

/** Reuse the current Paystack checkout link if it was created this recently. */
const AUTHORIZATION_REUSE_WINDOW_MS = 10 * 60 * 1000;
/** Lock duration that serializes concurrent re-initializations of one order. */
const PAYMENT_LOCK_MS = 30 * 1000;
/** Max number of previous attempts checked against Paystack before retrying. */
const MAX_REFERENCES_TO_RECONCILE = 5;

export type ResumePaymentResult =
  | { status: 'redirect'; authorizationUrl: string; reference: string; reused: boolean }
  | { status: 'already_paid' }
  | { status: 'ineligible'; reason: RetryIneligibleReason }
  | { status: 'not_found' }
  | { status: 'busy' }
  | { status: 'error'; message: string };

function getAttemptReferences(order: IOrder): string[] {
  const refs = order.paymentReferences && order.paymentReferences.length > 0
    ? order.paymentReferences
    : [order.reference];
  return Array.from(new Set(refs));
}

export class PaymentRecoveryService {
  /** Find an order by its original reference or by any Paystack attempt reference. */
  async findOrderByPaymentReference(reference: string) {
    await connectDB();
    return Order.findOne({
      $or: [{ reference }, { paymentReferences: reference }],
    });
  }

  /**
   * Atomically mark an order as paid (only if not already paid) and send the
   * confirmation email once. Returns the updated order, or null if it was already paid.
   */
  async markOrderPaid(orderId: string, paidReference: string): Promise<IOrder | null> {
    await connectDB();
    const updated = (await Order.findOneAndUpdate(
      { _id: orderId, paymentStatus: { $ne: 'success' } },
      {
        $set: { paymentStatus: 'success', paymentReference: paidReference },
        $unset: { paymentLockUntil: 1 },
      },
      { returnDocument: 'after' }
    )) as unknown as IOrder | null;

    if (updated) {
      try {
        await sendPurchaseConfirmationEmail(updated);
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }
    }
    return updated;
  }

  /**
   * Check the order's recent Paystack attempts server-side. If any attempt was
   * actually paid with the correct amount and currency, the order is marked as paid.
   * Returns true when the order is (now) paid.
   */
  async reconcileWithPaystack(order: IOrder): Promise<boolean> {
    if (order.paymentStatus === 'success') return true;

    const refs = getAttemptReferences(order).slice(-MAX_REFERENCES_TO_RECONCILE).reverse();
    for (const ref of refs) {
      try {
        const response = await paystackService.verifyPayment(ref);
        const data = response.data as (typeof response.data & { currency?: string }) | undefined;
        if (
          response.status &&
          data?.status === 'success' &&
          data.amount === order.totalPrice &&
          (!data.currency || data.currency === 'NGN')
        ) {
          await this.markOrderPaid(String(order._id), ref);
          return true;
        }
      } catch (err) {
        // A Paystack lookup failure must not block the customer; log and continue.
        console.error(`Paystack reconcile failed for ref=${ref}:`, err);
      }
    }
    return false;
  }

  /**
   * Most recent unpaid order of this customer for exactly these items that can
   * still be paid. Used to avoid creating duplicate orders.
   */
  async findRetryableDuplicate(params: {
    customerId: string;
    product: string;
    packageName: string;
    installation: boolean;
    totalPrice: number;
  }): Promise<IOrder | null> {
    await connectDB();
    const candidates = await Order.find({
      customerId: params.customerId,
      product: params.product,
      package: params.packageName,
      installation: params.installation,
      totalPrice: params.totalPrice,
      paymentStatus: { $in: ['pending', 'failed'] },
      orderStatus: { $ne: 'cancelled' },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return candidates.find((o) => getPaymentRetryEligibility(o).eligible) || null;
  }

  /** Retryable (unpaid, not cancelled, not expired) orders of a customer, newest first. */
  async getRetryableOrders(customerId: string, limit = 5): Promise<IOrder[]> {
    await connectDB();
    const candidates = await Order.find({
      customerId,
      paymentStatus: { $in: ['pending', 'failed'] },
      orderStatus: { $ne: 'cancelled' },
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean();

    return (candidates as IOrder[])
      .filter((o) => getPaymentRetryEligibility(o).eligible)
      .slice(0, limit);
  }

  /**
   * Resume payment for an existing order owned by `customerId`.
   * Never creates a new order and always charges the stored order amount.
   * Idempotent: a recent checkout link is reused and concurrent calls are locked.
   */
  async resumePayment(orderId: string, customerId: string): Promise<ResumePaymentResult> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return { status: 'not_found' };

    await connectDB();
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) return { status: 'not_found' };

    if (order.paymentStatus === 'success') return { status: 'already_paid' };

    // Confirm server-side that no previous attempt was actually paid (for
    // example, a missed webhook) before letting the customer pay again.
    if (await this.reconcileWithPaystack(order)) return { status: 'already_paid' };

    const eligibility = getPaymentRetryEligibility(order);
    if (!eligibility.eligible) return { status: 'ineligible', reason: eligibility.reason };

    // Idempotency: reuse a recently created checkout link that is still pending.
    const lastAttempt = order.lastPaymentAttemptAt ? new Date(order.lastPaymentAttemptAt).getTime() : 0;
    if (
      order.paymentStatus === 'pending' &&
      order.authorizationUrl &&
      order.paymentReference &&
      Date.now() - lastAttempt < AUTHORIZATION_REUSE_WINDOW_MS
    ) {
      return {
        status: 'redirect',
        authorizationUrl: order.authorizationUrl,
        reference: order.paymentReference,
        reused: true,
      };
    }

    // Short lock so concurrent requests cannot open several Paystack
    // transactions for the same order.
    const now = new Date();
    const locked = await Order.findOneAndUpdate(
      {
        _id: order._id,
        paymentStatus: { $in: ['pending', 'failed'] },
        $or: [{ paymentLockUntil: { $exists: false } }, { paymentLockUntil: { $lt: now } }],
      },
      { $set: { paymentLockUntil: new Date(now.getTime() + PAYMENT_LOCK_MS) } },
      { returnDocument: 'after' }
    );
    if (!locked) {
      const fresh = await Order.findById(order._id).select('paymentStatus').lean();
      return fresh?.paymentStatus === 'success' ? { status: 'already_paid' } : { status: 'busy' };
    }

    const releaseLock = () =>
      Order.updateOne({ _id: order._id }, { $unset: { paymentLockUntil: 1 } }).catch((err) =>
        console.error('Failed to release payment lock:', err)
      );

    try {
      // Paystack references are single-use, so each attempt gets a new one.
      const attemptReference = generateReference();
      const response = await paystackService.initializePayment(
        order.email,
        order.totalPrice,
        attemptReference,
        {
          orderId: String(order._id),
          orderReference: order.reference,
          product: order.product,
          package: order.package,
          customerName: order.customerName,
          phone: order.phone,
          address: order.address,
          installation: order.installation,
          installationPrice: order.installationPrice,
          retry: true,
        }
      );

      if (!response?.status || !response.data?.authorization_url) {
        await releaseLock();
        return { status: 'error', message: 'Payment initialization failed' };
      }

      // Orders created before retries existed have no reference list yet.
      const legacyRefs = order.paymentReferences && order.paymentReferences.length > 0
        ? []
        : [order.reference];

      const updated = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: { $ne: 'success' } },
        {
          $set: {
            paymentStatus: 'pending',
            paymentReference: attemptReference,
            authorizationUrl: response.data.authorization_url,
            lastPaymentAttemptAt: new Date(),
          },
          $push: { paymentReferences: { $each: [...legacyRefs, attemptReference] } },
          $inc: { paymentAttempts: 1 },
          $unset: { paymentLockUntil: 1 },
        },
        { returnDocument: 'after' }
      );

      if (!updated) {
        // Paid by the webhook while we were initializing.
        await releaseLock();
        return { status: 'already_paid' };
      }

      return {
        status: 'redirect',
        authorizationUrl: response.data.authorization_url,
        reference: attemptReference,
        reused: false,
      };
    } catch (err) {
      console.error('Resume payment error:', err);
      await releaseLock();
      return { status: 'error', message: 'Payment initialization failed' };
    }
  }
}

export const paymentRecoveryService = new PaymentRecoveryService();

