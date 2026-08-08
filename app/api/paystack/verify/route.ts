import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { orderService } from '@/services/order.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    const response = await paystackService.verifyPayment(reference);

    if (response.status && response.data?.status === 'success') {
      await orderService.updatePaymentStatus(
        reference,
        'success'
      );

      return NextResponse.json({
        status: true,
        message: 'Payment verified successfully',
      });
    }

    await orderService.updatePaymentStatus(reference, 'failed');

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