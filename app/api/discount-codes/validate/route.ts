import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import DiscountCode from '@/lib/models/DiscountCode';

// POST - Validate discount code
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, groundId, amount } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'Code and amount are required' },
        { status: 400 }
      );
    }

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
      status: 'active',
    });

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (now < discountCode.validFrom || now > discountCode.validUntil) {
      return NextResponse.json(
        { error: 'Discount code has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
      return NextResponse.json(
        { error: 'Discount code usage limit reached' },
        { status: 400 }
      );
    }

    // Check applicable grounds
    if (discountCode.applicableGrounds && discountCode.applicableGrounds.length > 0) {
      if (groundId && !discountCode.applicableGrounds.includes(groundId)) {
        return NextResponse.json(
          { error: 'Discount code not applicable for this ground' },
          { status: 400 }
        );
      }
    }

    // Check minimum purchase
    if (discountCode.minPurchase && amount < discountCode.minPurchase) {
      return NextResponse.json(
        { error: `Minimum purchase of Rs. ${discountCode.minPurchase} required` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (discountCode.type === 'percentage') {
      discountAmount = (amount * discountCode.value) / 100;
      if (discountCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
      }
    } else {
      discountAmount = discountCode.value;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json({
      success: true,
      data: {
        code: discountCode.code,
        type: discountCode.type,
        discountAmount,
        finalAmount,
        originalAmount: amount,
      },
    });
  } catch (error: any) {
    console.error('Validate discount code error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}

