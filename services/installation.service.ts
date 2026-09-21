import { connectDB } from '@/lib/db';
import { Installation } from '@/models/Installation';
import { IInstallation, CreateInstallationDTO, UpdateInstallationDTO } from '@/types/installation';

export class InstallationService {
  async getAllInstallations(): Promise<IInstallation[]> {
    await connectDB();
    return await Installation.find({}).sort({ productType: 1 });
  }

  async getActiveInstallations(): Promise<IInstallation[]> {
    await connectDB();
    return await Installation.find({ isActive: true }).sort({ productType: 1 });
  }

  async getByProductType(productType: string): Promise<IInstallation | null> {
    await connectDB();
    return await Installation.findOne({ productType, isActive: true });
  }

  async upsert(data: CreateInstallationDTO): Promise<IInstallation> {
    await connectDB();
    return await Installation.findOneAndUpdate(
      { productType: data.productType },
      {
        price: data.price,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      { upsert: true, returnDocument: 'after' }
    ) as IInstallation;
  }

  async update(id: string, data: UpdateInstallationDTO): Promise<IInstallation | null> {
    await connectDB();
    return await Installation.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Installation.findByIdAndDelete(id);
    return !!result;
  }
}

export const installationService = new InstallationService();
