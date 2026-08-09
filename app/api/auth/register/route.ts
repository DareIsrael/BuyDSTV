import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { sendWelcomeEmail } from '@/lib/email';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.register);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { name, email, phone, address, password } = body;

    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof phone !== 'string' || typeof address !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (name.length > 100 || email.length > 254 || phone.length > 30 || address.length > 500) {
      return NextResponse.json(
        { error: 'Field length exceeds maximum' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password: hashedPassword,
      role: 'customer',
    });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    sendWelcomeEmail(customer.name, customer.email).catch((err) =>
      console.error('Failed to send welcome email:', err)
    );

    return NextResponse.json(
      {
        message: 'Registration successful',
        customer: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          role: customer.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
