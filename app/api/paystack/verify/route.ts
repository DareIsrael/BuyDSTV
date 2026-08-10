import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
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

    // Check if already verified (idempotent)
    const existingOrder = await Order.findOne({ reference });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existingOrder.paymentStatus === 'success') {
      return NextResponse.json({
        status: true,
        message: 'Payment already verified',
      });
    }

    // Verify with Paystack API
    const response = await paystackService.verifyPayment(reference);

    if (response.status && response.data?.status === 'success') {
      // Verify amount matches
      const paystackAmount = response.data.amount;
      if (paystackAmount !== existingOrder.totalPrice) {
        console.error(
          `Verify amount mismatch: Paystack=${paystackAmount}, Order=${existingOrder.totalPrice}, ref=${reference}`
        );
        await Order.findOneAndUpdate(
          { reference, paymentStatus: { $ne: 'success' } },
          { paymentStatus: 'failed' }
        );
        return NextResponse.json(
          { error: 'Payment amount mismatch' },
          { status: 400 }
        );
      }

      // Atomically update only if not already success
      const updated = await Order.findOneAndUpdate(
        { reference, paymentStatus: { $ne: 'success' } },
        { paymentStatus: 'success' },
        { new: true }
      );

      if (updated) {
        try {
          await sendPurchaseConfirmationEmail(updated);
        } catch (err) {
          console.error('Failed to send confirmation email:', err);
        }
      }

      return NextResponse.json({
        status: true,
        message: 'Payment verified successfully',
      });
    }

    // Payment not successful at Paystack
    await Order.findOneAndUpdate(
      { reference, paymentStatus: { $ne: 'success' } },
      { paymentStatus: 'failed' }
    );

    return NextResponse.json(
      { error: 'Payment verification failed' },
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