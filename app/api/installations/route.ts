import { NextRequest, NextResponse } from 'next/server';
import { installationService } from '@/services/installation.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.publicApi);
    if (rateLimited) return rateLimited;
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType');

    if (productType) {
      const installation = await installationService.getByProductType(productType);
      return NextResponse.json(installation);
    }

    const installations = await installationService.getActiveInstallations();
    return NextResponse.json(installations);
  } catch (error) {
    console.error('Error fetching installations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.adminApi);
    if (rateLimited) return rateLimited;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { productType, price, isActive } = await request.json();

    if (!productType || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const validTypes = ['dstv', 'gotv', 'dstv-with-dish', 'dstv-explora'];
    if (!validTypes.includes(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      );
    }

    const installation = await installationService.upsert({
      productType,
      price: Math.round(price * 100), // Convert to kobo
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(installation);
  } catch (error) {
    console.error('Error upserting installation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rateLimited = await applyRateLimit(request, RATE_LIMITS.adminApi);
    if (rateLimited) return rateLimited;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Installation ID required' },
        { status: 400 }
      );
    }

    const deleted = await installationService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Installation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting installation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
