import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { orderService } from '@/services/order.service';
import { generateReference } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      amount,
      product,
      package: packageName,
      customerName,
      phone,
      address,
      customerId,
    } = await request.json();

    if (!email || !amount || !product || !packageName || !customerName || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reference = generateReference();

    const response = await paystackService.initializePayment(
      email,
      amount,
      reference,
      { product, package: packageName, customerName, phone, address }
    );

    if (response.status) {
      await orderService.createOrder({
        customerId,
        customerName,
        email,
        phone: phone || '',
        address: address || '',
        product,
        package: packageName,
        totalPrice: amount,
        reference,
      });

      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}