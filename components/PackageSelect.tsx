'use client';

import { IPackage } from '@/types/package';
import { formatPrice } from '@/lib/utils';

interface PackageSelectProps {
  packages: IPackage[];
  selectedPackageId: string;
  onSelect: (packageId: string) => void;
  error?: string;
}

export const PackageSelect: React.FC<PackageSelectProps> = ({
  packages,
  selectedPackageId,
  onSelect,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Subscription Package
      </label>
      <select
        value={selectedPackageId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition-colors"
      >
        <option value="">Select a package</option>
        {packages.map((pkg) => (
          <option key={pkg._id} value={pkg._id}>
            {pkg.name} - {formatPrice(pkg.price)}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};