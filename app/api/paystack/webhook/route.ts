import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { sendPurchaseConfirmationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Paystack webhook handler.
 * Paystack sends POST with JSON body and x-paystack-signature header (HMAC SHA-512).
 * Must return 200 quickly. All processing is done before responding.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify HMAC SHA-512 signature
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Paystack webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only handle charge.success
    if (event.event !== 'charge.success') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    const data = event.data;
    const reference = data?.reference;
    const paystackAmountKobo = data?.amount; // Paystack sends amount in kobo
    const paystackStatus = data?.status;

    if (!reference || paystackStatus !== 'success') {
      return NextResponse.json({ message: 'Ignored' }, { status: 200 });
    }

    await connectDB();

    // Idempotent: only update if not already success
    const order = await Order.findOne({ reference });

    if (!order) {
      console.warn(`Webhook: no order found for reference ${reference}`);
      return NextResponse.json({ message: 'Order not found' }, { status: 200 });
    }

    if (order.paymentStatus === 'success') {
      // Already processed — idempotent
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // Verify amount matches (Paystack sends in kobo, our DB stores in kobo)
    if (paystackAmountKobo !== order.totalPrice) {
      console.error(
        `Webhook amount mismatch: Paystack=${paystackAmountKobo}, Order=${order.totalPrice}, ref=${reference}`
      );
      // Mark as failed if amount doesn't match
      await Order.findOneAndUpdate(
        { reference, paymentStatus: { $ne: 'success' } },
        { paymentStatus: 'failed' }
      );
      return NextResponse.json({ message: 'Amount mismatch' }, { status: 200 });
    }

    // Update payment status atomically (only if not already success)
    const updated = await Order.findOneAndUpdate(
      { reference, paymentStatus: { $ne: 'success' } },
      { paymentStatus: 'success' },
      { new: true }
    );

    if (updated) {
      // Send purchase confirmation email (non-blocking for webhook response)
      sendPurchaseConfirmationEmail(updated).catch((err) =>
        console.error('Failed to send purchase confirmation email:', err)
      );
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    // Always return 200 to prevent Paystack from retrying on our errors
    return NextResponse.json({ message: 'Error processing webhook' }, { status: 200 });
  }
}
