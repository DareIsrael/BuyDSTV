import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { orderService } from '@/services/order.service';
import { productService } from '@/services/product.service';
import { packageService } from '@/services/package.service';
import { generateReference } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.paymentInit);
    if (rateLimited) return rateLimited;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const {
      email,
      product,
      package: packageName,
      customerName,
      phone,
      address,
      customerId,
    } = await request.json();

    if (!email || !product || !packageName || !customerName || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Enforce session user identity
    const user = session.user as { id?: string };
    if (user.id !== customerId) {
      return NextResponse.json({ error: 'Unauthorized customer ID' }, { status: 403 });
    }

    // Determine product type
    let productType: 'dstv' | 'gotv' | 'dstv-with-dish' = 'dstv';
    if (product.toLowerCase().includes('gotv')) productType = 'gotv';
    if (product.toLowerCase().includes('dish')) productType = 'dstv-with-dish';

    // Look up server-side prices — REJECT if not found
    const dbProduct = await productService.getProductByType(productType);
    if (!dbProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 400 });
    }

    const dbPackages = await packageService.getPackagesByProductType(productType);
    const dbPackage = dbPackages.find((p) => p.name === packageName);
    if (!dbPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 400 });
    }

    // Calculate amount SERVER-SIDE — never trust client amount
    const serverAmount = dbProduct.price + dbPackage.price;

    const reference = generateReference();

    const response = await paystackService.initializePayment(
      email,
      serverAmount,
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
        totalPrice: serverAmount,
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