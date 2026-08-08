import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (!customer) {
      // Even if customer doesn't exist, we return success to prevent email enumeration
      return NextResponse.json({ success: true, message: 'If that email is registered, a reset link was sent.' });
    }

    // Generate secure random raw token for email link
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Hash token before storing in database
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    customer.resetPasswordToken = hashedToken;
    customer.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry

    await customer.save();

    // Determine base URL safely (prefer NEXT_PUBLIC_BASE_URL env)
    const hostHeader = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (hostHeader ? `${protocol}://${hostHeader}` : 'http://localhost:3000');
    
    const resetUrl = `${baseUrl}/auth/reset-password?token=${rawToken}`;

    const emailResponse = await sendPasswordResetEmail({
      to: customer.email,
      resetUrl,
    });

    if (!emailResponse.success) {
      return NextResponse.json(
        { error: 'Failed to send password reset email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password reset link sent to email!' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

