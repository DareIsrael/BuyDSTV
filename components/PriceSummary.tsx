'use client';

import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PriceSummaryProps {
  decoderPrice: number;
  packagePrice: number;
  totalPrice: number;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  decoderPrice,
  packagePrice,
  totalPrice,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-xl p-6 border border-gray-800"
    >
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between pb-4 border-b border-gray-800">
          <span className="text-gray-400">Decoder Price</span>
          <span className="font-semibold">{formatPrice(decoderPrice)}</span>
        </div>
        {packagePrice > 0 && (
          <div className="flex justify-between pb-4 border-b border-gray-800">
            <span className="text-gray-400">Package Price</span>
            <span className="font-semibold">{formatPrice(packagePrice)}</span>
          </div>
        )}
        <div className="flex justify-between items-end pt-4">
          <div>
            <span className="text-xl font-bold block">Total</span>
            <span className="text-xs text-gray-400 font-normal">Includes delivery fee</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};