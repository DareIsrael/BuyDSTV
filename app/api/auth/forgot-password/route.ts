import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const customer = await Customer.findOne({ email: email.toLowerCase() });

    if (!customer) {
      // Even if customer doesn't exist, we return success to prevent email enumeration
      return NextResponse.json({ success: true, message: 'If that email is strictly registered, a reset link was sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    customer.resetPasswordToken = token;
    // 1 hour expiry
    customer.resetPasswordExpires = new Date(Date.now() + 3600000); 

    await customer.save();

    // Determine base URL dynamically (works locally and heavily deployed)
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

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
