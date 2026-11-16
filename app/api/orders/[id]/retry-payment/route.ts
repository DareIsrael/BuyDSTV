import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { paymentRecoveryService } from '@/services/payment-recovery.service';
import { getRetryIneligibleMessage } from '@/lib/order-payment';

export const dynamic = 'force-dynamic';

/**
 * Re-initiate payment for an existing unpaid order owned by the signed-in
 * customer. Never creates a new order; the stored order amount is charged.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.paymentInit);
    if (rateLimited) return rateLimited;

    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string } | undefined;
    if (!user?.id) {
      return NextResponse.json({ status: false, code: 'unauthenticated', error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.length > 64) {
      return NextResponse.json({ status: false, code: 'not_found', error: 'Order not found' }, { status: 404 });
    }

    // Ownership is enforced inside resumePayment (order must belong to user.id).
    const result = await paymentRecoveryService.resumePayment(id, user.id);

    switch (result.status) {
      case 'redirect':
        return NextResponse.json({
          status: true,
          data: {
            authorization_url: result.authorizationUrl,
            reference: result.reference,
          },
        });
      case 'already_paid':
        return NextResponse.json(
          { status: false, code: 'paid', error: getRetryIneligibleMessage('paid') },
          { status: 409 }
        );
      case 'ineligible':
        return NextResponse.json(
          { status: false, code: result.reason, error: getRetryIneligibleMessage(result.reason) },
          { status: 409 }
        );
      case 'busy':
        return NextResponse.json(
          {
            status: false,
            code: 'busy',
            error: 'Your payment is already being prepared. Please wait a moment and try again.',
          },
          { status: 409 }
        );
      case 'not_found':
        return NextResponse.json({ status: false, code: 'not_found', error: 'Order not found' }, { status: 404 });
      default:
        return NextResponse.json(
          { status: false, code: 'error', error: 'Unable to start payment. Please try again.' },
          { status: 502 }
        );
    }
  } catch (error) {
    console.error('Retry payment error:', error);
    return NextResponse.json({ status: false, code: 'error', error: 'Internal server error' }, { status: 500 });
  }
}

