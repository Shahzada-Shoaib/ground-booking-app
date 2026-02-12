import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/utils/middleware';
import { z } from 'zod';

const favoriteSchema = z.object({
  groundId: z.string().min(1, 'Ground ID is required'),
  action: z.enum(['add', 'remove']),
});

// POST - Add or remove favorite ground
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (!authResult.user) {
      return (authResult as any).response;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = favoriteSchema.parse(body);

    const user = await User.findById(authResult.user.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (validatedData.action === 'add') {
      if (!user.favoriteGrounds.includes(validatedData.groundId)) {
        user.favoriteGrounds.push(validatedData.groundId);
      }
    } else {
      user.favoriteGrounds = user.favoriteGrounds.filter(
        id => id !== validatedData.groundId
      );
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        favoriteGrounds: user.favoriteGrounds,
      },
      message: `Ground ${validatedData.action === 'add' ? 'added to' : 'removed from'} favorites`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update favorites error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update favorites' },
      { status: 500 }
    );
  }
}

