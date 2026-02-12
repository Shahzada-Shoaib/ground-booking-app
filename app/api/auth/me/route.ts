import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/utils/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    
    if (!authResult.user) {
      return (authResult as any).response;
    }

    await connectDB();

    const user = await User.findById(authResult.user.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        favoriteGrounds: user.favoriteGrounds,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

