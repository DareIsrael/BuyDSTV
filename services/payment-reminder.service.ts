import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { sendPaymentReminderEmail } from '@/lib/email';
import { getContinuePaymentPath, getPaymentRetryEligibility } from '@/lib/order-payment';
import { paymentRecoveryService } from '@/services/payment-recovery.service';
import { IOrder } from '@/types/order';

const DEFAULT_DELAY_MINUTES = 45;
const MIN_DELAY_MINUTES = 15;
const MAX_DELAY_MINUTES = 24 * 60;
/** Orders older than this are never reminded (avoids emailing very old orders after deploy). */
const MAX_ORDER_AGE_MS = 24 * 60 * 60 * 1000;
/** Give up on an order after this many failed email deliveries. */
const MAX_REMINDER_FAILURES = 3;
/** A claim older than this is considered abandoned (e.g. the run crashed) and may be retried. */
const CLAIM_TIMEOUT_MS = 10 * 60 * 1000;
const BATCH_SIZE = 25;

export interface ReminderRunSummary {
  scanned: number;
  sent: number;
  failed: number;
  skippedPaid: number;
  skippedIneligible: number;
  skippedClaimed: number;
}

export function getReminderDelayMinutes(): number {
  const raw = Number(process.env.PAYMENT_REMINDER_DELAY_MINUTES);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_DELAY_MINUTES;
  return Math.min(Math.max(Math.round(raw), MIN_DELAY_MINUTES), MAX_DELAY_MINUTES);
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://buydstv.com.ng').replace(/\/+$/, '');
}

export class PaymentReminderService {
  /**
   * Send one reminder email per abandoned order. Safe to run concurrently and
   * repeatedly: each order is claimed atomically and `reminderSentAt` is set once.
   */
  async processPendingReminders(now: Date = new Date()): Promise<ReminderRunSummary> {
    await connectDB();

    const summary: ReminderRunSummary = {
      scanned: 0,
      sent: 0,
      failed: 0,
      skippedPaid: 0,
      skippedIneligible: 0,
      skippedClaimed: 0,
    };

    const inactiveSince = new Date(now.getTime() - getReminderDelayMinutes() * 60 * 1000);
    const createdAfter = new Date(now.getTime() - MAX_ORDER_AGE_MS);
    const staleClaim = new Date(now.getTime() - CLAIM_TIMEOUT_MS);

    const candidates = (await Order.find({
      paymentStatus: { $in: ['pending', 'failed'] },
      orderStatus: { $ne: 'cancelled' },
      reminderSentAt: { $exists: false },
      reminderFailures: { $not: { $gte: MAX_REMINDER_FAILURES } },
      createdAt: { $gte: createdAfter },
      $and: [
        // No payment activity for at least the configured delay
        {
          $or: [
            { lastPaymentAttemptAt: { $lte: inactiveSince } },
            { lastPaymentAttemptAt: { $exists: false }, createdAt: { $lte: inactiveSince } },
          ],
        },
        // Not currently claimed by another run
        {
          $or: [{ reminderClaimedAt: { $exists: false } }, { reminderClaimedAt: { $lt: staleClaim } }],
        },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE)
      .lean()) as IOrder[];

    for (const order of candidates) {
      summary.scanned++;
      try {
        await this.processOrder(order, now, staleClaim, summary);
      } catch (err) {
        summary.failed++;
        console.error(`Payment reminder failed for order ${order.reference}:`, err);
      }
    }

    return summary;
  }

  private async processOrder(
    order: IOrder,
    now: Date,
    staleClaim: Date,
    summary: ReminderRunSummary
  ): Promise<void> {
    if (!getPaymentRetryEligibility(order, now).eligible) {
      summary.skippedIneligible++;
      return;
    }

    // Make sure the customer has not actually paid (e.g. a missed webhook)
    // before reminding them. This also marks such orders as paid.
    if (await paymentRecoveryService.reconcileWithPaystack(order)) {
      summary.skippedPaid++;
      return;
    }

    // Atomically claim the order so concurrent runs never send duplicates.
    const claimed = (await Order.findOneAndUpdate(
      {
        _id: order._id,
        paymentStatus: { $in: ['pending', 'failed'] },
        orderStatus: { $ne: 'cancelled' },
        reminderSentAt: { $exists: false },
        $or: [{ reminderClaimedAt: { $exists: false } }, { reminderClaimedAt: { $lt: staleClaim } }],
      },
      { $set: { reminderClaimedAt: now } },
      { returnDocument: 'after' }
    ).lean()) as IOrder | null;

    if (!claimed) {
      summary.skippedClaimed++;
      return;
    }

    const continuePaymentUrl = `${getBaseUrl()}${getContinuePaymentPath(String(claimed._id))}`;

    try {
      await sendPaymentReminderEmail(claimed, continuePaymentUrl);
      await Order.updateOne(
        { _id: claimed._id },
        { $set: { reminderSentAt: new Date() }, $unset: { reminderClaimedAt: 1 } }
      );
      summary.sent++;
    } catch (err) {
      await Order.updateOne(
        { _id: claimed._id },
        { $inc: { reminderFailures: 1 }, $unset: { reminderClaimedAt: 1 } }
      ).catch((updateErr) => console.error('Failed to record reminder failure:', updateErr));
      summary.failed++;
      console.error(`Payment reminder email failed for order ${claimed.reference}:`, err);
    }
  }
}

export const paymentReminderService = new PaymentReminderService();

