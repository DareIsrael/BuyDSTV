import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { IOrder, CreateOrderDTO } from '@/types/order';

export class OrderService {
  async getAllOrders(): Promise<IOrder[]> {
    await connectDB();
    return await Order.find({}).sort({ createdAt: -1 });
  }

  async getOrderByReference(reference: string): Promise<IOrder | null> {
    await connectDB();
    return await Order.findOne({ reference });
  }

  async getOrdersByCustomerId(customerId: string): Promise<IOrder[]> {
    await connectDB();
    return await Order.find({ customerId }).sort({ createdAt: -1 });
  }

  async getOrdersByEmail(email: string): Promise<IOrder[]> {
    await connectDB();
    return await Order.find({ email }).sort({ createdAt: -1 });
  }

  async createOrder(data: CreateOrderDTO): Promise<IOrder> {
    await connectDB();
    const order = new Order(data);
    return await order.save();
  }

  async updatePaymentStatus(reference: string, status: IOrder['paymentStatus']): Promise<IOrder | null> {
    await connectDB();
    return await Order.findOneAndUpdate(
      { reference },
      { paymentStatus: status },
      { new: true }
    );
  }

  async updateOrderStatus(reference: string, status: string): Promise<IOrder | null> {
    await connectDB();
    return await Order.findOneAndUpdate(
      { reference },
      { orderStatus: status },
      { new: true }
    );
  }
}

export const orderService = new OrderService();