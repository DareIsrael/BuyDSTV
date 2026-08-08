import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/services/package.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType') as 'dstv' | 'gotv' | 'dstv-with-dish' | null;

    let packages;
    if (productType) {
      packages = await packageService.getPackagesByProductType(productType);
    } else {
      packages = await packageService.getAllPackages();
    }

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, price, productType } = await request.json();

    if (!name || !price || !productType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPackage = await packageService.createPackage({
      name,
      price: price * 100, // Convert to kobo
      productType,
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID required' },
        { status: 400 }
      );
    }

    const deleted = await packageService.deletePackage(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}