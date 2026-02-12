import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/utils/middleware';

// GET - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminResult = requireAdmin(request);
    if (!adminResult.user) {
      return (adminResult as any).response;
    }

    await connectDB();

    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        favoriteGrounds: user.favoriteGrounds,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}

