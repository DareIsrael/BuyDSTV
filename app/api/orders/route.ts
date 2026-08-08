import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    // If looking up by reference, allow both admin and order owner
    if (reference) {
      const order = await orderService.getOrderByReference(reference);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      // Only allow admin or the customer who owns this order
      if (user.role !== 'admin' && order.customerId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return NextResponse.json(order);
    }

    // Admin can see all orders
    if (user.role === 'admin') {
      const orders = await orderService.getAllOrders();
      return NextResponse.json(orders);
    }

    // Customer can only see their own orders
    if (user.role === 'customer') {
      const orders = await orderService.getOrdersByCustomerId(user.id);
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { reference, orderStatus } = await request.json();

    if (!reference || !orderStatus) {
      return NextResponse.json(
        { error: 'Reference and order status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    const order = await orderService.updateOrderStatus(reference, orderStatus);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}