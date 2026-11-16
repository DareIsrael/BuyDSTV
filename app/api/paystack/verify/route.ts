import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { paymentRecoveryService } from '@/services/payment-recovery.service';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.paymentVerify);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference || typeof reference !== 'string' || reference.length > 100) {
      return NextResponse.json(
        { error: 'Valid reference is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // The reference may belong to any payment attempt of the order, because
    // each payment retry uses a new Paystack reference.
    const existingOrder = await paymentRecoveryService.findOrderByPaymentReference(reference);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotent: already verified
    if (existingOrder.paymentStatus === 'success') {
      return NextResponse.json({
        status: true,
        message: 'Payment already verified',
      });
    }

    // Verify with Paystack API (never trust the redirect alone)
    const response = await paystackService.verifyPayment(reference);
    const data = response.data as (typeof response.data & { currency?: string }) | undefined;

    if (response.status && data?.status === 'success') {
      // Verify amount (kobo) and currency match the stored order
      const paystackAmount = data.amount;
      const currencyOk = !data.currency || data.currency === 'NGN';
      if (paystackAmount !== existingOrder.totalPrice || !currencyOk) {
        console.error(
          `Verify amount mismatch: Paystack=${paystackAmount} ${data.currency || ''}, Order=${existingOrder.totalPrice}, ref=${reference}`
        );
        await Order.findOneAndUpdate(
          { _id: existingOrder._id, paymentStatus: { $ne: 'success' } },
          { paymentStatus: 'failed' }
        );
        return NextResponse.json(
          { error: 'Payment amount mismatch' },
          { status: 400 }
        );
      }

      // Atomically mark as paid (only once) and send the confirmation email
      await paymentRecoveryService.markOrderPaid(String(existingOrder._id), reference);

      return NextResponse.json({
        status: true,
        message: 'Payment verified successfully',
      });
    }

    // Payment not successful. Only the current attempt may move the order to
    // failed, so a stale attempt cannot override a newer pending one.
    const currentAttempt = existingOrder.paymentReference || existingOrder.reference;
    if (currentAttempt === reference) {
      await Order.findOneAndUpdate(
        { _id: existingOrder._id, paymentStatus: { $ne: 'success' } },
        { paymentStatus: 'failed' }
      );
    }

    return NextResponse.json(
      {
        error: 'Payment verification failed',
        orderId: String(existingOrder._id),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
