import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';
import { IPackage, CreatePackageDTO, UpdatePackageDTO } from '@/types/package';

export class PackageService {
  async getAllPackages(): Promise<IPackage[]> {
    await connectDB();
    return await Package.find({}).sort({ productType: 1, price: 1 });
  }

  async getPackagesByProductType(productType: 'dstv' | 'gotv' | 'dstv-with-dish'): Promise<IPackage[]> {
    await connectDB();
    return await Package.find({ productType }).sort({ price: 1 });
  }

  async getPackageById(id: string): Promise<IPackage | null> {
    await connectDB();
    return await Package.findById(id);
  }

  async createPackage(data: CreatePackageDTO): Promise<IPackage> {
    await connectDB();
    const pkg = new Package(data);
    return await pkg.save();
  }

  async updatePackage(id: string, data: UpdatePackageDTO): Promise<IPackage | null> {
    await connectDB();
    return await Package.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePackage(id: string): Promise<boolean> {
    await connectDB();
    const result = await Package.findByIdAndDelete(id);
    return !!result;
  }
}

export const packageService = new PackageService();