import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { IProduct, CreateProductDTO, UpdateProductDTO } from '@/types/product';

export class ProductService {
  async getAllProducts(): Promise<IProduct[]> {
    await connectDB();
    return await Product.find({}).sort({ type: 1 });
  }

  async getProductByType(type: 'dstv' | 'gotv' | 'dstv-with-dish'): Promise<IProduct | null> {
    await connectDB();
    return await Product.findOne({ type });
  }

  async createProduct(data: CreateProductDTO): Promise<IProduct> {
    await connectDB();
    const product = new Product(data);
    return await product.save();
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct | null> {
    await connectDB();
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async updateProductByType(type: 'dstv' | 'gotv' | 'dstv-with-dish', price: number): Promise<IProduct | null> {
    await connectDB();
    return await Product.findOneAndUpdate(
      { type },
      { price, name: type.toUpperCase() },
      { upsert: true, new: true }
    );
  }

  async deleteProduct(id: string): Promise<boolean> {
    await connectDB();
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }
}

export const productService = new ProductService();