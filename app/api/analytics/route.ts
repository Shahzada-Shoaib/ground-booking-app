import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import Ground from '@/lib/models/Ground';
import { requireAuth, requireAdmin } from '@/lib/utils/middleware';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const adminResult = requireAdmin(request);
    if (!adminResult.user) {
      return (adminResult as any).response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const groundId = searchParams.get('groundId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { status: 'confirmed' };
    
    if (groundId) {
      query.groundId = groundId;
    }
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query);
    const grounds = await Ground.find(groundId ? { _id: groundId } : {});

    // Calculate statistics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalHours = bookings.reduce((sum, b) => sum + b.hours, 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Today's bookings
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today).length;

    // Revenue by ground
    const revenueByGround: Record<string, number> = {};
    const bookingsByGround: Record<string, number> = {};
    
    bookings.forEach(booking => {
      revenueByGround[booking.groundId] = (revenueByGround[booking.groundId] || 0) + booking.totalPrice;
      bookingsByGround[booking.groundId] = (bookingsByGround[booking.groundId] || 0) + 1;
    });

    // Bookings by day of week
    const bookingsByDay: Record<string, number> = {};
    bookings.forEach(booking => {
      const date = new Date(booking.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      bookingsByDay[dayName] = (bookingsByDay[dayName] || 0) + 1;
    });

    // Popular time slots
    const timeSlotCounts: Record<string, number> = {};
    bookings.forEach(booking => {
      const key = `${booking.startTime}-${booking.endTime}`;
      timeSlotCounts[key] = (timeSlotCounts[key] || 0) + 1;
    });

    const topTimeSlots = Object.entries(timeSlotCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([slot, count]) => {
        const [start, end] = slot.split('-').map(Number);
        return { startTime: start, endTime: end, count };
      });

    // Revenue trends (last 30 days)
    const revenueTrends: Array<{ date: string; revenue: number; bookings: number }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(b => b.date === dateStr);
      const dayRevenue = dayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      
      revenueTrends.push({
        date: dateStr,
        revenue: dayRevenue,
        bookings: dayBookings.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          totalRevenue,
          totalHours,
          avgBookingValue,
          todayBookings,
          activeGrounds: grounds.filter(g => g.isActive).length,
        },
        revenueByGround: Object.entries(revenueByGround).map(([id, revenue]) => {
          const ground = grounds.find(g => g._id.toString() === id);
          return {
            groundId: id,
            groundName: ground?.name || 'Unknown',
            revenue,
            bookings: bookingsByGround[id] || 0,
          };
        }),
        bookingsByDay,
        topTimeSlots,
        revenueTrends,
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

