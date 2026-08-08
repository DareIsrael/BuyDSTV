import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const customer = await Customer.findOne({
      $or: [{ resetPasswordToken: hashedToken }, { resetPasswordToken: token }],
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Password reset token is invalid or has expired' },
        { status: 400 }
      );
    }

    // Set the new password securely
    customer.password = await bcrypt.hash(newPassword, 12);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;

    await customer.save();

    return NextResponse.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

