import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { customerService } from '@/services/customer.service';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getPaginationParams } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.adminApi);
    if (rateLimited) return rateLimited;

    // Verify admin session server-side
    const session = await getServerSession(authOptions);

    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single customer detail + orders
    if (id) {
      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      const { page, limit } = getPaginationParams(searchParams);
      const orders = await customerService.getCustomerOrders(id, page, limit);

      return NextResponse.json({ customer, orders });
    }

    // Paginated customer list
    const { page, limit } = getPaginationParams(searchParams);
    const search = searchParams.get('search') || undefined;
    const sort = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest';

    const result = await customerService.getCustomersPaginated(
      page,
      limit,
      search,
      sort
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
