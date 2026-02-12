import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import Ground from '@/lib/models/Ground';
import { requireAuth, requireAdmin } from '@/lib/utils/middleware';
import { z } from 'zod';

const bookingUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.number().min(0).max(23).optional(),
  endTime: z.number().min(0).max(23).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  cancellationReason: z.string().optional(),
  specialRequests: z.string().optional(),
  rescheduledFrom: z.string().optional(),
});

// GET - Get single booking - Auth optional for development
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try to authenticate, but don't block if not authenticated (for development)
    const authResult = requireAuth(request);
    // If authentication fails, we'll still allow fetching booking (for development)
    // In production, you should uncomment the check below:
    // if (!authResult.user) {
    //   return (authResult as any).response;
    // }

    await connectDB();
    const { id } = await params;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Customers can only see their own bookings (if authenticated)
    if (authResult.user && authResult.user.role === 'customer' && booking.userId !== authResult.user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking._id.toString(),
        groundId: booking.groundId,
        userId: booking.userId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        hours: booking.hours,
        totalPrice: booking.totalPrice,
        status: booking.status,
        type: booking.type,
        recurringPattern: booking.recurringPattern,
        parentBookingId: booking.parentBookingId,
        rescheduledFrom: booking.rescheduledFrom,
        cancellationReason: booking.cancellationReason,
        cancelledAt: booking.cancelledAt?.toISOString(),
        approvedBy: booking.approvedBy,
        approvedAt: booking.approvedAt?.toISOString(),
        waitlistPosition: booking.waitlistPosition,
        specialRequests: booking.specialRequests,
        discountCode: booking.discountCode,
        discountAmount: booking.discountAmount,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (reschedule, cancel, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(request);
    if (!authResult.user) {
      return (authResult as any).response;
    }

    await connectDB();
    const { id } = await params;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Customers can only update their own bookings
    if (authResult.user.role === 'customer' && booking.userId !== authResult.user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = bookingUpdateSchema.parse(body);

    // Handle rescheduling
    if (validatedData.date || validatedData.startTime !== undefined || validatedData.endTime !== undefined) {
      const newDate = validatedData.date || booking.date;
      const newStartTime = validatedData.startTime !== undefined ? validatedData.startTime : booking.startTime;
      const newEndTime = validatedData.endTime !== undefined ? validatedData.endTime : booking.endTime;

      if (newEndTime <= newStartTime) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }

      // Check availability
      const ground = await Ground.findById(booking.groundId);
      if (!ground || !ground.isActive) {
        return NextResponse.json(
          { error: 'Ground is not available' },
          { status: 400 }
        );
      }

      for (let hour = newStartTime; hour < newEndTime; hour++) {
        const conflictingBooking = await Booking.findOne({
          _id: { $ne: id },
          groundId: booking.groundId,
          date: newDate,
          status: { $in: ['pending', 'confirmed'] },
          $or: [
            { startTime: { $lte: hour }, endTime: { $gt: hour } },
          ],
        });

        if (conflictingBooking) {
          return NextResponse.json(
            { error: `Time slot ${hour}:00 is already booked` },
            { status: 400 }
          );
        }
      }

      // Update booking with reschedule info
      // Create update object with rescheduledFrom
      const updateData: any = {
        ...validatedData,
        rescheduledFrom: booking._id.toString(),
      };

      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        success: true,
        data: {
          id: updatedBooking!._id.toString(),
          groundId: updatedBooking!.groundId,
          userId: updatedBooking!.userId,
          customerName: updatedBooking!.customerName,
          customerPhone: updatedBooking!.customerPhone,
          customerEmail: updatedBooking!.customerEmail,
          date: updatedBooking!.date,
          startTime: updatedBooking!.startTime,
          endTime: updatedBooking!.endTime,
          hours: updatedBooking!.hours,
          totalPrice: updatedBooking!.totalPrice,
          status: updatedBooking!.status,
          type: updatedBooking!.type,
          recurringPattern: updatedBooking!.recurringPattern,
          parentBookingId: updatedBooking!.parentBookingId,
          rescheduledFrom: updatedBooking!.rescheduledFrom,
          cancellationReason: updatedBooking!.cancellationReason,
          cancelledAt: updatedBooking!.cancelledAt?.toISOString(),
          approvedBy: updatedBooking!.approvedBy,
          approvedAt: updatedBooking!.approvedAt?.toISOString(),
          waitlistPosition: updatedBooking!.waitlistPosition,
          specialRequests: updatedBooking!.specialRequests,
          discountCode: updatedBooking!.discountCode,
          discountAmount: updatedBooking!.discountAmount,
          createdAt: updatedBooking!.createdAt.toISOString(),
          updatedAt: updatedBooking!.updatedAt.toISOString(),
        },
        message: 'Booking updated successfully',
      });
    }

    // Handle cancellation
    if (validatedData.status === 'cancelled') {
      const updateData: any = {
        ...validatedData,
        cancelledAt: new Date(),
        cancellationReason: validatedData.cancellationReason || 'Cancelled by user',
      };

      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        success: true,
        data: {
          id: updatedBooking!._id.toString(),
          groundId: updatedBooking!.groundId,
          userId: updatedBooking!.userId,
          customerName: updatedBooking!.customerName,
          customerPhone: updatedBooking!.customerPhone,
          customerEmail: updatedBooking!.customerEmail,
          date: updatedBooking!.date,
          startTime: updatedBooking!.startTime,
          endTime: updatedBooking!.endTime,
          hours: updatedBooking!.hours,
          totalPrice: updatedBooking!.totalPrice,
          status: updatedBooking!.status,
          type: updatedBooking!.type,
          recurringPattern: updatedBooking!.recurringPattern,
          parentBookingId: updatedBooking!.parentBookingId,
          rescheduledFrom: updatedBooking!.rescheduledFrom,
          cancellationReason: updatedBooking!.cancellationReason,
          cancelledAt: updatedBooking!.cancelledAt?.toISOString(),
          approvedBy: updatedBooking!.approvedBy,
          approvedAt: updatedBooking!.approvedAt?.toISOString(),
          waitlistPosition: updatedBooking!.waitlistPosition,
          specialRequests: updatedBooking!.specialRequests,
          discountCode: updatedBooking!.discountCode,
          discountAmount: updatedBooking!.discountAmount,
          createdAt: updatedBooking!.createdAt.toISOString(),
          updatedAt: updatedBooking!.updatedAt.toISOString(),
        },
        message: 'Booking updated successfully',
      });
    }

    // Regular update (no reschedule or cancellation)
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updatedBooking!._id.toString(),
        groundId: updatedBooking!.groundId,
        userId: updatedBooking!.userId,
        customerName: updatedBooking!.customerName,
        customerPhone: updatedBooking!.customerPhone,
        customerEmail: updatedBooking!.customerEmail,
        date: updatedBooking!.date,
        startTime: updatedBooking!.startTime,
        endTime: updatedBooking!.endTime,
        hours: updatedBooking!.hours,
        totalPrice: updatedBooking!.totalPrice,
        status: updatedBooking!.status,
        type: updatedBooking!.type,
        recurringPattern: updatedBooking!.recurringPattern,
        parentBookingId: updatedBooking!.parentBookingId,
        rescheduledFrom: updatedBooking!.rescheduledFrom,
        cancellationReason: updatedBooking!.cancellationReason,
        cancelledAt: updatedBooking!.cancelledAt?.toISOString(),
        approvedBy: updatedBooking!.approvedBy,
        approvedAt: updatedBooking!.approvedAt?.toISOString(),
        waitlistPosition: updatedBooking!.waitlistPosition,
        specialRequests: updatedBooking!.specialRequests,
        discountCode: updatedBooking!.discountCode,
        discountAmount: updatedBooking!.discountAmount,
        createdAt: updatedBooking!.createdAt.toISOString(),
        updatedAt: updatedBooking!.updatedAt.toISOString(),
      },
      message: 'Booking updated successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking (soft delete by setting status to cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(request);
    if (!authResult.user) {
      return (authResult as any).response;
    }

    await connectDB();
    const { id } = await params;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Customers can only cancel their own bookings
    if (authResult.user.role === 'customer' && booking.userId !== authResult.user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Cancel booking
    const cancelledBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Cancelled by user',
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: cancelledBooking!._id.toString(),
        status: cancelledBooking!.status,
        cancelledAt: cancelledBooking!.cancelledAt?.toISOString(),
      },
      message: 'Booking cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

