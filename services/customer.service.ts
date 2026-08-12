import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { Order } from '@/models/Order';

// Fields to never return to the client
const SENSITIVE_FIELDS = '-password -resetPasswordToken -resetPasswordExpires';

export interface PaginatedCustomers {
  customers: SafeCustomer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SafeCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  orderCount?: number;
}

export class CustomerService {
  async getCustomersPaginated(
    page: number = 1,
    limit: number = 20,
    search?: string,
    sort: 'newest' | 'oldest' = 'newest'
  ): Promise<PaginatedCustomers> {
    await connectDB();

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;

    // Build query filter
    const filter: Record<string, unknown> = { role: 'customer' };
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .select(SENSITIVE_FIELDS)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    // Get order counts for the current page of customers in one query
    const customerIds = customers.map((c) => String(c._id));
    const orderCounts = await this.getOrderCounts(customerIds);

    const customersWithCounts: SafeCustomer[] = customers.map((c) => ({
      ...c,
      _id: String(c._id),
      orderCount: orderCounts.get(String(c._id)) || 0,
    })) as SafeCustomer[];

    return {
      customers: customersWithCounts,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getCustomerById(id: string): Promise<SafeCustomer | null> {
    await connectDB();
    const customer = await Customer.findById(id)
      .select(SENSITIVE_FIELDS)
      .lean();

    if (!customer) return null;

    const orderCounts = await this.getOrderCounts([String(customer._id)]);

    return {
      ...customer,
      _id: String(customer._id),
      orderCount: orderCounts.get(String(customer._id)) || 0,
    } as SafeCustomer;
  }

  async getCustomerOrders(customerId: string) {
    await connectDB();
    return await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();
  }

  private async getOrderCounts(customerIds: string[]): Promise<Map<string, number>> {
    if (customerIds.length === 0) return new Map();

    const counts = await Order.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { $group: { _id: '$customerId', count: { $sum: 1 } } },
    ]);

    const map = new Map<string, number>();
    for (const item of counts) {
      map.set(String(item._id), item.count);
    }
    return map;
  }
}

export const customerService = new CustomerService();
