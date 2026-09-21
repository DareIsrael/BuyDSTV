'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/Button';
import { PackageSelect } from '@/components/PackageSelect';
import { PriceSummary } from '@/components/PriceSummary';
import { IProduct } from '@/types/product';
import { IPackage } from '@/types/package';
import { IInstallation } from '@/types/installation';
import { calculateTotal, formatPrice } from '@/lib/utils';

const productDetailsMap: Record<string, { summary: string; inTheBox: string[]; features: string[] }> = {
  dstv: {
    summary: 'High-definition DStv satellite decoder unit.',
    inTheBox: ['DStv HD Decoder Unit', 'DStv Smartcard', 'Remote Control with Batteries', 'HDMI Cable & Power Adapter'],
    features: ['1080p HD Video', 'Dolby Digital Sound', '7-Day TV Guide', 'Parental Controls'],
  },
  'dstv-with-dish': {
    summary: 'Complete DStv Decoder and satellite dish installation kit.',
    inTheBox: ['DStv HD Decoder & Smartcard', '60cm Satellite Dish', 'Single LNB Receiver', 'Coaxial Cable & Mounting Kit'],
    features: ['Full Satellite Dish Kit', 'Maximum Signal Strength', 'Crisp HD Output', 'Ready for Setup'],
  },
  'dstv-explora': {
    summary: 'Flagship DStv Explora decoder with recording and Catch Up',
    inTheBox: ['DStv Explora / Ultra Decoder', 'Smart Remote Control', 'HDMI Cable', 'Power Adapter'],
    features: ['Pause & Rewind Live TV', 'Record up to 110 Hours', 'Built-in Wi-Fi', '4K Streaming Support'],
  },
  gotv: {
    summary: 'Digital terrestrial GOtv decoder with outdoor GOtenna included.',
    inTheBox: ['GOtv HD Decoder Unit', 'GOtenna Outdoor Antenna', 'Signal Cable & Remote', 'Power Adapter'],
    features: ['Plug & Play Installation', 'Crisp Digital Signal', 'Wide Regional Coverage', 'Affordable Subscriptions'],
  },
};

interface CheckoutClientProps {
  product: IProduct;
  packages: IPackage[];
  installationOption: IInstallation | null;
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
  installationOption,
  customer,
}) => {
  const router = useRouter();
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [wantsInstallation, setWantsInstallation] = useState(false);
  const [openProductDetails, setOpenProductDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPackage = packages.find((p) => p._id === selectedPackageId);
  const installationPrice = wantsInstallation && installationOption ? installationOption.price : 0;
  const totalPrice = calculateTotal(product.price, selectedPackage?.price || 0, installationPrice);

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
          productType: product.type,
          package: selectedPackage.name,
          customerName: customer.name,
          phone: customer.phone,
          address: customer.address,
          customerId: customer.id,
          installation: wantsInstallation,
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
          onClick={() => router.push('/')}
          className="mb-8"
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-white">Activation Details</h2>
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
                  <p className="text-gray-400 mt-1 text-sm">Ready for nationwide delivery</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Package + Installation + Payment */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-white">Select Package</h2>
              <div className="space-y-4">
                <PackageSelect
                  packages={packages}
                  selectedPackageId={selectedPackageId}
                  onSelect={setSelectedPackageId}
                  error={!selectedPackage && error ? 'Please select a package' : undefined}
                />

                {/* Installation Option */}
                {installationOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Installation Service <span className="text-gray-500">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setWantsInstallation(!wantsInstallation)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        wantsInstallation
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-700 bg-dark hover:border-gray-600'
                      }`}
                    >
                      {/* Custom Checkbox */}
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                          wantsInstallation
                            ? 'bg-primary'
                            : 'border-2 border-gray-600 bg-transparent'
                        }`}
                      >
                        {wantsInstallation && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium text-sm">
                          Add Professional Installation
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Expert setup & alignment included
                        </p>
                      </div>
                      <span className={`text-lg font-bold ${wantsInstallation ? 'text-primary' : 'text-gray-400'}`}>
                        +{formatPrice(installationOption.price)}
                      </span>
                    </button>
                  </motion.div>
                )}

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
              installationPrice={installationPrice}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
