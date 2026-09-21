import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { IOrder, CreateOrderDTO } from '@/types/order';

export interface PaginatedOrders {
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export type PaymentStatus = IOrder['paymentStatus'];

export class OrderService {
  async getAllOrders(): Promise<IOrder[]> {
    await connectDB();
    return await Order.find({}).sort({ createdAt: -1 });
  }

  async getAllOrdersPaginated(
    page = 1,
    limit = 20,
    paymentStatus?: PaymentStatus,
    customerId?: string
  ): Promise<PaginatedOrders> {
    await connectDB();
    const requestedPage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Cap at 100
    const filter: Record<string, unknown> = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customerId = customerId;

    const total = await Order.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const safePage = Math.min(requestedPage, totalPages);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();

    return {
      orders: orders as IOrder[],
      total,
      page: safePage,
      totalPages,
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

  async getOrdersByCustomerIdPaginated(
    customerId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedOrders> {
    return this.getAllOrdersPaginated(page, limit, undefined, customerId);
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
      { returnDocument: 'after' }
    );
  }

  async updateOrderStatus(reference: string, status: string): Promise<IOrder | null> {
    await connectDB();
    return await Order.findOneAndUpdate(
      { reference },
      { orderStatus: status },
      { returnDocument: 'after' }
    );
  }
}

export const orderService = new OrderService();
