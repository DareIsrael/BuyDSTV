import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/services/paystack.service';
import { orderService } from '@/services/order.service';
import { productService } from '@/services/product.service';
import { packageService } from '@/services/package.service';
import { installationService } from '@/services/installation.service';
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
      productType,
      package: packageName,
      customerName,
      phone,
      address,
      customerId,
      installation,
    } = await request.json();

    if (!email || !productType || !packageName || !customerName || !customerId) {
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

    const validProductTypes = ['dstv', 'gotv', 'dstv-with-dish', 'dstv-explora'] as const;
    if (!validProductTypes.includes(productType)) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
    }

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

    // Calculate installation price SERVER-SIDE if requested
    let installationPrice = 0;
    const wantsInstallation = installation === true;
    if (wantsInstallation) {
      const dbInstallation = await installationService.getByProductType(productType);
      if (!dbInstallation) {
        return NextResponse.json(
          { error: 'Installation is not available for this product' },
          { status: 400 }
        );
      }
      installationPrice = dbInstallation.price;
    }

    // Calculate amount SERVER-SIDE — never trust client amount
    const serverAmount = dbProduct.price + dbPackage.price + installationPrice;

    const reference = generateReference();

    const response = await paystackService.initializePayment(
      email,
      serverAmount,
      reference,
      {
        product: dbProduct.name,
        package: dbPackage.name,
        customerName,
        phone,
        address,
        installation: wantsInstallation,
        installationPrice,
      }
    );

    if (response.status) {
      await orderService.createOrder({
        customerId,
        customerName,
        email,
        phone: phone || '',
        address: address || '',
        product: dbProduct.name,
        package: dbPackage.name,
        totalPrice: serverAmount,
        installation: wantsInstallation,
        installationPrice,
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
