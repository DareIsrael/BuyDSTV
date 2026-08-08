import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, password } = await request.json();

    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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
      name,
      email: email.toLowerCase(),
      phone,
      address,
      password: hashedPassword,
      role:'customer'
    });

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
