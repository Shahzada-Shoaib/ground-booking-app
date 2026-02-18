import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import { requireAdmin } from '@/lib/utils/middleware';
import { z } from 'zod';

const bulkActionSchema = z.object({
  action: z.enum(['cancel', 'confirm', 'delete']),
  bookingIds: z.array(z.string()).min(1, 'At least one booking ID is required'),
  cancellationReason: z.string().optional(),
});

// POST - Bulk operations on bookings (Admin only)
export async function POST(request: NextRequest) {
  try {
    const adminResult = requireAdmin(request);
    if (!adminResult.user) {
      return (adminResult as any).response;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = bulkActionSchema.parse(body);

    let result;

    switch (validatedData.action) {
      case 'cancel':
        result = await Booking.updateMany(
          { _id: { $in: validatedData.bookingIds } },
          {
            $set: {
              status: 'cancelled',
              cancelledAt: new Date(),
              cancellationReason: validatedData.cancellationReason || 'Cancelled by admin',
            },
          }
        );
        break;

      case 'confirm':
        result = await Booking.updateMany(
          { _id: { $in: validatedData.bookingIds } },
          {
            $set: {
              status: 'confirmed',
              approvedBy: adminResult.user.userId,
              approvedAt: new Date(),
            },
          }
        );
        break;

      case 'delete':
        result = await Booking.deleteMany({
          _id: { $in: validatedData.bookingIds },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const affectedCount =
      'modifiedCount' in result ? (result.modifiedCount ?? 0) : (result.deletedCount ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: affectedCount,
      },
      message: `${validatedData.action} operation completed successfully`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

