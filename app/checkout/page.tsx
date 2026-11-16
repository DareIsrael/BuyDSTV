import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { productService } from '@/services/product.service';
import { packageService } from '@/services/package.service';
import { installationService } from '@/services/installation.service';
import { CheckoutClient, PendingOrderSummary } from './CheckoutClient';
import { paymentRecoveryService } from '@/services/payment-recovery.service';
import { VideoBackground } from '@/components/VideoBackground';

interface CheckoutPageProps {
  searchParams: Promise<{
    product?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; role?: string; name?: string; email?: string; phone?: string; address?: string } | undefined;

  if (!session || !user || user.role !== 'customer') {
    const params = await searchParams;
    const product = params.product || 'dstv';
    redirect(`/auth/login?product=${product}&callbackUrl=${encodeURIComponent(`/checkout?product=${product}`)}`);
  }

  const params = await searchParams;
  let productType: 'dstv' | 'gotv' | 'dstv-with-dish' | 'dstv-explora' = 'dstv';
  if (params.product === 'gotv') productType = 'gotv';
  if (params.product === 'dstv-with-dish') productType = 'dstv-with-dish';
  if (params.product === 'dstv-explora') productType = 'dstv-explora';

  const product = await productService.getProductByType(productType);
  const packages = await packageService.getPackagesByProductType(productType);
  const installationOption = await installationService.getByProductType(productType);

  // Unpaid orders the customer can still pay, so they can resume instead of
  // placing a duplicate order. A lookup failure must not block checkout.
  let pendingOrders: PendingOrderSummary[] = [];
  try {
    const retryable = await paymentRecoveryService.getRetryableOrders(user.id, 3);
    pendingOrders = retryable.map((o) => ({
      _id: String(o._id),
      reference: o.reference,
      product: o.product,
      package: o.package,
      totalPrice: o.totalPrice,
      paymentStatus: o.paymentStatus,
      createdAt: new Date(o.createdAt).toISOString(),
    }));
  } catch (err) {
    console.error('Failed to load pending orders for checkout:', err);
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Product not found</h1>
          <p className="text-gray-400 mt-2">Please go back and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-16">
      <VideoBackground />
      <div className="relative z-10">
        <CheckoutClient
          product={JSON.parse(JSON.stringify(product))}
          packages={JSON.parse(JSON.stringify(packages))}
          installationOption={installationOption ? JSON.parse(JSON.stringify(installationOption)) : null}
          customer={{
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
          }}
          pendingOrders={pendingOrders}
        />
      </div>
    </div>
  );
}