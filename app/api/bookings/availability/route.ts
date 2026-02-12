import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import Ground from '@/lib/models/Ground';

// GET - Get available time slots for a ground and date
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const groundId = searchParams.get('groundId');
    const date = searchParams.get('date');

    if (!groundId || !date) {
      return NextResponse.json(
        { error: 'groundId and date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const ground = await Ground.findById(groundId);
    if (!ground) {
      return NextResponse.json(
        { error: 'Ground not found' },
        { status: 404 }
      );
    }

    // Get all confirmed bookings for this date
    const bookings = await Booking.find({
      groundId,
      date,
      status: { $in: ['pending', 'confirmed'] },
    });

    // Create booked hours set
    const bookedHours = new Set<number>();
    bookings.forEach(booking => {
      for (let hour = booking.startTime; hour < booking.endTime; hour++) {
        bookedHours.add(hour);
      }
    });

    // Generate available slots
    const slots = [];
    for (let hour = ground.operatingHours.start; hour < ground.operatingHours.end; hour++) {
      const isBooked = bookedHours.has(hour);
      slots.push({
        hour,
        available: !isBooked,
        booked: isBooked,
        bookingId: isBooked
          ? bookings.find(b => hour >= b.startTime && hour < b.endTime)?._id.toString()
          : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      data: slots,
    });
  } catch (error: any) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get availability' },
      { status: 500 }
    );
  }
}

