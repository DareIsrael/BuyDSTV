import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { IOrder, CreateOrderDTO } from '@/types/order';

export interface PaginatedOrders {
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export class OrderService {
  async getAllOrders(): Promise<IOrder[]> {
    await connectDB();
    return await Order.find({}).sort({ createdAt: -1 });
  }

  async getAllOrdersPaginated(page: number = 1, limit: number = 20): Promise<PaginatedOrders> {
    await connectDB();
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Cap at 100
    const skip = (safePage - 1) * safeLimit;

    const [orders, total] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
      Order.countDocuments({}),
    ]);

    return {
      orders: orders as IOrder[],
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
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