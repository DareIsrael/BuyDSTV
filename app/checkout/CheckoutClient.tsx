'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { PackageSelect } from '@/components/PackageSelect';
import { PriceSummary } from '@/components/PriceSummary';
import { IProduct } from '@/types/product';
import { IPackage } from '@/types/package';
import { calculateTotal, formatPrice } from '@/lib/utils';

interface CheckoutClientProps {
  product: IProduct;
  packages: IPackage[];
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export const CheckoutClient: React.FC<CheckoutClientProps> = ({
  product,
  packages,
  customer,
}) => {
  const router = useRouter();
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPackage = packages.find((p) => p._id === selectedPackageId);
  const totalPrice = calculateTotal(product.price, selectedPackage?.price || 0);

  const onSubmit = async () => {
    if (!selectedPackage) {
      setError('Please select a subscription package');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customer.email,
          amount: totalPrice,
          product: product.name,
          package: selectedPackage.name,
          customerName: customer.name,
          phone: customer.phone,
          address: customer.address,
          customerId: customer.id,
        }),
      });

      const result = await response.json();

      if (result.status) {
        window.location.href = result.data.authorization_url;
      } else {
        setError(result.message || 'Payment initialization failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-8"
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-white">Customer Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white font-medium">{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white font-medium">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address</span>
                  <span className="text-white font-medium text-right max-w-[200px]">{customer.address}</span>
                </div>
              </div>
            </div>

            {/* Selected Product */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-white">Selected Decoder</h2>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-gray-400 mt-1 text-sm">Ready for installation</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Package + Payment */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-white">Select Package</h2>
              <div className="space-y-4">
                <PackageSelect
                  packages={packages}
                  selectedPackageId={selectedPackageId}
                  onSelect={setSelectedPackageId}
                  error={!selectedPackage && error ? 'Please select a package' : undefined}
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={onSubmit}
                  isLoading={isLoading}
                  disabled={!selectedPackage}
                  className="w-full"
                >
                  Pay Now — {formatPrice(totalPrice)}
                </Button>
                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Total payment includes delivery fee</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <PriceSummary
              decoderPrice={product.price}
              packagePrice={selectedPackage?.price || 0}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};