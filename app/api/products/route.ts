import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await productService.getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { dstvPrice, gotvPrice, dstvWithDishPrice } = await request.json();

    if (
      typeof dstvPrice !== 'number' || 
      typeof gotvPrice !== 'number' || 
      typeof dstvWithDishPrice !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid price values' },
        { status: 400 }
      );
    }

    await productService.updateProductByType('dstv', Math.round(dstvPrice * 100));
    await productService.updateProductByType('gotv', Math.round(gotvPrice * 100));
    await productService.updateProductByType('dstv-with-dish', Math.round(dstvWithDishPrice * 100));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}