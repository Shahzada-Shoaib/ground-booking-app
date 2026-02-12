import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import DiscountCode from '@/lib/models/DiscountCode';
import { requireAdmin } from '@/lib/utils/middleware';
import { z } from 'zod';

const discountCodeSchema = z.object({
  code: z.string().min(1, 'Code is required').toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0),
  minPurchase: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  usageLimit: z.number().min(1).optional(),
  applicableGrounds: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'expired']).default('active'),
});

// GET - Get all discount codes
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const status = searchParams.get('status');

    const query: any = {};
    if (code) {
      query.code = code.toUpperCase();
    }
    if (status) {
      query.status = status;
    }

    const discountCodes = await DiscountCode.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: discountCodes.map(dc => ({
        id: dc._id.toString(),
        code: dc.code,
        type: dc.type,
        value: dc.value,
        minPurchase: dc.minPurchase,
        maxDiscount: dc.maxDiscount,
        validFrom: dc.validFrom.toISOString(),
        validUntil: dc.validUntil.toISOString(),
        usageLimit: dc.usageLimit,
        usedCount: dc.usedCount,
        applicableGrounds: dc.applicableGrounds || [],
        status: dc.status,
        createdAt: dc.createdAt.toISOString(),
        updatedAt: dc.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get discount codes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get discount codes' },
      { status: 500 }
    );
  }
}

// POST - Create discount code (Admin only)
export async function POST(request: NextRequest) {
  try {
    const adminResult = requireAdmin(request);
    if (!adminResult.user) {
      return (adminResult as any).response;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = discountCodeSchema.parse(body);

    // Check if code already exists
    const existingCode = await DiscountCode.findOne({ code: validatedData.code });
    if (existingCode) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discountCode = await DiscountCode.create({
      ...validatedData,
      validFrom: new Date(validatedData.validFrom),
      validUntil: new Date(validatedData.validUntil),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: discountCode._id.toString(),
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        minPurchase: discountCode.minPurchase,
        maxDiscount: discountCode.maxDiscount,
        validFrom: discountCode.validFrom.toISOString(),
        validUntil: discountCode.validUntil.toISOString(),
        usageLimit: discountCode.usageLimit,
        usedCount: discountCode.usedCount,
        applicableGrounds: discountCode.applicableGrounds || [],
        status: discountCode.status,
        createdAt: discountCode.createdAt.toISOString(),
        updatedAt: discountCode.updatedAt.toISOString(),
      },
      message: 'Discount code created successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create discount code error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create discount code' },
      { status: 500 }
    );
  }
}

