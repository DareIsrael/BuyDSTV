'use client';

import { motion } from 'framer-motion';
import { IProduct } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductSelectorProps {
  products: IProduct[];
  selectedType: 'dstv' | 'gotv' | 'dstv-with-dish';
  onSelect: (type: 'dstv' | 'gotv' | 'dstv-with-dish') => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedType,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <motion.button
          key={product.type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(product.type)}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedType === product.type
              ? 'border-primary bg-primary/10'
              : 'border-gray-700 bg-dark-card hover:border-gray-600'
          }`}
        >
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </motion.button>
      ))}
    </div>
  );
};