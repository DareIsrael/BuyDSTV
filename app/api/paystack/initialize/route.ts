import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { orderService } from '@/services/order.service';
import { productService } from '@/services/product.service';
import { packageService } from '@/services/package.service';
import { generateReference } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    // Enforce session user identity matching if logged in
    if (session?.user && (session.user as any).id !== customerId) {
      return NextResponse.json({ error: 'Unauthorized customer ID' }, { status: 403 });
    }

    // Verify amount server-side to prevent price tampering
    let productType: 'dstv' | 'gotv' | 'dstv-with-dish' = 'dstv';
    if (product.toLowerCase().includes('gotv')) productType = 'gotv';
    if (product.toLowerCase().includes('dish')) productType = 'dstv-with-dish';

    const dbProduct = await productService.getProductByType(productType);
    const dbPackages = await packageService.getPackagesByProductType(productType);
    const dbPackage = dbPackages.find((p) => p.name === packageName);

    if (dbProduct && dbPackage) {
      const expectedTotal = dbProduct.price + dbPackage.price;
      if (amount < expectedTotal) {
        return NextResponse.json({ error: 'Invalid transaction amount' }, { status: 400 });
      }
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