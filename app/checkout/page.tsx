import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { productService } from '@/services/product.service';
import { packageService } from '@/services/package.service';
import { CheckoutClient } from './CheckoutClient';

interface CheckoutPageProps {
  searchParams: Promise<{
    product?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'customer') {
    const params = await searchParams;
    const product = params.product || 'dstv';
    redirect(`/auth/login?product=${product}&callbackUrl=${encodeURIComponent(`/checkout?product=${product}`)}`);
  }

  const params = await searchParams;
  let productType: 'dstv' | 'gotv' | 'dstv-with-dish' = 'dstv';
  if (params.product === 'gotv') productType = 'gotv';
  if (params.product === 'dstv-with-dish') productType = 'dstv-with-dish';

  const product = await productService.getProductByType(productType);
  const packages = await packageService.getPackagesByProductType(productType);

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

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark pt-16">
      <CheckoutClient
        product={JSON.parse(JSON.stringify(product))}
        packages={JSON.parse(JSON.stringify(packages))}
        customer={{
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        }}
      />
    </div>
  );
}