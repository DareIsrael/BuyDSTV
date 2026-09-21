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
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-200">
          Subscription Package
        </label>
        <a
          href="/dstv-channel-list.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download="DSTV_Channel_List.pdf"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Channel List (PDF)
        </a>
      </div>
      <select
        value={selectedPackageId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2.5 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition-colors text-white text-sm"
      >
        <option value="">Select a package</option>
        {packages.map((pkg) => (
          <option key={pkg._id} value={pkg._id}>
            {pkg.name} - {formatPrice(pkg.price)}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      ) : (
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <span>Not sure which package to choose?</span>
          <a
            href="/dstv-channel-list.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="DSTV_Channel_List.pdf"
            className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
          >
            Review channels guide PDF &rarr;
          </a>
        </p>
      )}
    </div>
  );
};