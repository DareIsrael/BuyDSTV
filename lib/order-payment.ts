/**
 * Shared rules for paying (or re-paying) an existing order.
 * Safe to import from both server and client code.
 */

/** Unpaid orders older than this can no longer be paid and are shown as expired. */
export const ORDER_PAYMENT_EXPIRY_HOURS = 48;
export const ORDER_PAYMENT_EXPIRY_MS = ORDER_PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000;

export type RetryIneligibleReason = 'paid' | 'cancelled' | 'expired';

export type RetryEligibility =
  | { eligible: true }
  | { eligible: false; reason: RetryIneligibleReason };

interface PayableOrderLike {
  paymentStatus: string;
  orderStatus: string;
  createdAt: Date | string;
}

export function isOrderPaymentExpired(order: Pick<PayableOrderLike, 'createdAt'>, now: Date = new Date()): boolean {
  const created = new Date(order.createdAt).getTime();
  if (Number.isNaN(created)) return true;
  return now.getTime() - created > ORDER_PAYMENT_EXPIRY_MS;
}

/** An order may be (re)paid only if it is unpaid, not cancelled and not expired. */
export function getPaymentRetryEligibility(order: PayableOrderLike, now: Date = new Date()): RetryEligibility {
  if (order.paymentStatus === 'success') return { eligible: false, reason: 'paid' };
  if (order.orderStatus === 'cancelled') return { eligible: false, reason: 'cancelled' };
  if (isOrderPaymentExpired(order, now)) return { eligible: false, reason: 'expired' };
  return { eligible: true };
}

export function getRetryIneligibleMessage(reason: RetryIneligibleReason): string {
  switch (reason) {
    case 'paid':
      return 'This order has already been paid.';
    case 'cancelled':
      return 'This order has been cancelled and can no longer be paid.';
    case 'expired':
      return `This order has expired. Unpaid orders can only be paid within ${ORDER_PAYMENT_EXPIRY_HOURS} hours. Please place a new order.`;
  }
}

/** In-app page that resumes payment for an existing order (also used by reminder emails). */
export function getContinuePaymentPath(orderId: string): string {
  return `/orders/${encodeURIComponent(orderId)}/pay`;
}

