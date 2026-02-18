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

    // Handle overnight operating hours: endHour < startHour (e.g., 9 AM to 5 AM)
    if (ground.operatingHours.end < ground.operatingHours.start) {
      // For overnight grounds, we need to determine if the requested date shows:
      // - Start hours (startHour to 23) - when ground opens
      // - End hours (0 to endHour) - when ground closes (next day)
      
      // Check previous date for overnight bookings that might extend to this date
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      // Get bookings for this date
      const bookingsToday = await Booking.find({
        groundId,
        date,
        status: { $in: ['pending', 'confirmed'] },
      });

      // Get bookings from previous date that might extend into this date
      const bookingsPrev = await Booking.find({
        groundId,
        date: prevDateStr,
        status: { $in: ['pending', 'confirmed'] },
      });

      // Get bookings from next date to determine if it's a start date
      const bookingsNext = await Booking.find({
        groundId,
        date: nextDateStr,
        status: { $in: ['pending', 'confirmed'] },
      });

      const slots = [];
      
      // For overnight grounds, determine which hours to show for this date:
      // - Start hours (startHour to 23): When ground opens on this date
      // - End hours (0 to endHour): When ground closes on this date (previous date was start date)
      // - BOTH: When this date is a transition date (previous date had start hours AND next date has start hours)
      
      // Get today's date to help with the decision when there are no bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Check if previous date would show start hours
      const prevDateHasStartHourBookings = bookingsPrev.some(b => 
        b.startTime >= ground.operatingHours.start
      );
      const prevDateHasOvernightBookings = bookingsPrev.some(b => b.endTime < b.startTime);
      const prevDateIsToday = prevDateStr === todayStr;
      const prevDateWouldShowStartHours = prevDateHasStartHourBookings || prevDateHasOvernightBookings || prevDateIsToday;
      
      // Check if next date would show start hours
      const nextDateHasStartHourBookings = bookingsNext.some(b => 
        b.startTime >= ground.operatingHours.start
      );
      const nextDateHasOvernightBookings = bookingsNext.some(b => b.endTime < b.startTime);
      const nextDateIsTomorrow = nextDateStr === tomorrowStr;
      
      // For overnight grounds, next date will show start hours if:
      // - It has start hour bookings, OR
      // - It has overnight bookings, OR
      // - It's tomorrow (default behavior), OR
      // - It's any future date (for overnight grounds, every future date shows start hours by default)
      const nextDateObj = new Date(nextDateStr + 'T00:00:00');
      const todayObj = new Date(todayStr + 'T00:00:00');
      const nextDateIsFuture = nextDateObj > todayObj;
      
      // For overnight grounds, any future date (after today) will show start hours by default
      // This is because overnight grounds operate in cycles: each date starts a new cycle
      const nextDateWouldShowStartHours = nextDateHasStartHourBookings || nextDateHasOvernightBookings || nextDateIsTomorrow || nextDateIsFuture;
      
      // Determine which hours to show:
      // 1. Transition date: Previous date has start hours AND next date has start hours → Show BOTH end hours and start hours
      // 2. End date only: Previous date has start hours BUT next date doesn't → Show only end hours (rare case)
      // 3. Start date only: Previous date doesn't have start hours → Show only start hours
      // 4. Default: Show start hours (likely a start date)
      
      const isTransitionDate = prevDateWouldShowStartHours && nextDateWouldShowStartHours;
      
      // For overnight grounds:
      // - Show end hours (0 to endHour) if previous date has start hours
      // - Show start hours (startHour to 23) if next date has start hours (which is almost always true for future dates)
      // - Transition dates show both
      const showEndHours = prevDateWouldShowStartHours;
      const showStartHours = nextDateWouldShowStartHours;
      
      // Generate booked hours sets for both end hours and start hours
      const bookedHoursEnd = new Set<number>();
      const bookedHoursStart = new Set<number>();
      
      // Check bookings on this date that affect end hours (0 to endHour)
      bookingsToday.forEach(booking => {
        if (booking.endTime < booking.startTime) {
          // Overnight booking: affects end hours from 0 to endTime
          for (let hour = 0; hour < booking.endTime; hour++) {
            if (hour < ground.operatingHours.end) {
              bookedHoursEnd.add(hour);
            }
          }
          // Also affects start hours from startTime to 23
          for (let hour = booking.startTime; hour <= 23; hour++) {
            if (hour >= ground.operatingHours.start) {
              bookedHoursStart.add(hour);
            }
          }
        } else {
          // Normal booking - check which range it affects
          for (let hour = booking.startTime; hour < booking.endTime; hour++) {
            if (hour >= 0 && hour < ground.operatingHours.end) {
              bookedHoursEnd.add(hour);
            }
            if (hour >= ground.operatingHours.start && hour <= 23) {
              bookedHoursStart.add(hour);
            }
          }
        }
      });
      
      // Check previous day's overnight bookings that extend into this date (affect end hours)
      bookingsPrev.forEach(booking => {
        if (booking.endTime < booking.startTime) {
          // Overnight booking from previous day extends into this date
          for (let hour = 0; hour < booking.endTime; hour++) {
            if (hour < ground.operatingHours.end) {
              bookedHoursEnd.add(hour);
            }
          }
        }
      });
      
      // Check next day's bookings that might affect this date's start hours
      // (if there are overnight bookings starting on this date that extend to next day)
      bookingsNext.forEach(booking => {
        // This doesn't directly affect today's slots, but we track it for reference
      });
      
      // Generate end hours (0 to endHour-1) if needed
      // Note: endHour is the closing hour, so last slot is (endHour-1) to endHour
      // e.g., if endHour is 5, last slot is 4-5, not 5-6
      if (showEndHours) {
        for (let hour = 0; hour < ground.operatingHours.end; hour++) {
          const isBooked = bookedHoursEnd.has(hour);
          slots.push({
            hour,
            available: !isBooked,
            booked: isBooked,
            bookingId: isBooked
              ? bookingsToday.find(b => {
                  if (b.endTime < b.startTime) {
                    return hour >= 0 && hour < b.endTime;
                  }
                  return hour >= b.startTime && hour < b.endTime;
                })?._id.toString() || bookingsPrev.find(b => 
                  b.endTime < b.startTime && hour < b.endTime
                )?._id.toString()
              : undefined,
          });
        }
      }
      
      // Generate start hours (startHour to 23) if needed
      if (showStartHours) {
        for (let hour = ground.operatingHours.start; hour <= 23; hour++) {
          const isBooked = bookedHoursStart.has(hour);
          slots.push({
            hour,
            available: !isBooked,
            booked: isBooked,
            bookingId: isBooked
              ? bookingsToday.find(b => {
                  if (b.endTime < b.startTime) {
                    return hour >= b.startTime && hour <= 23;
                  }
                  return hour >= b.startTime && hour < b.endTime;
                })?._id.toString()
              : undefined,
          });
        }
      }

      // Safety check: If no slots were generated, default to start hours
      if (slots.length === 0) {
        for (let hour = ground.operatingHours.start; hour <= 23; hour++) {
          slots.push({
            hour,
            available: true,
            booked: false,
            bookingId: undefined,
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: slots,
      });
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
      if (booking.endTime < booking.startTime) {
        // Overnight booking: from startTime to 23
        for (let hour = booking.startTime; hour <= 23; hour++) {
          bookedHours.add(hour);
        }
      } else {
        // Normal booking
        for (let hour = booking.startTime; hour < booking.endTime; hour++) {
          bookedHours.add(hour);
        }
      }
    });

    // Generate available slots
    const slots = [];
    // Handle case where endHour is 0 (12 AM) - it means open until midnight
    if (ground.operatingHours.end === 0) {
      // Generate slots from start to 23, then include hour 0
      for (let hour = ground.operatingHours.start; hour <= 23; hour++) {
        const isBooked = bookedHours.has(hour);
        slots.push({
          hour,
          available: !isBooked,
          booked: isBooked,
          bookingId: isBooked
            ? bookings.find(b => {
                if (b.endTime < b.startTime) {
                  return hour >= b.startTime && hour <= 23;
                }
                return hour >= b.startTime && hour < b.endTime;
              })?._id.toString()
            : undefined,
        });
      }
      // Include hour 0 (12 AM)
      const isBooked = bookedHours.has(0);
      slots.push({
        hour: 0,
        available: !isBooked,
        booked: isBooked,
        bookingId: isBooked
          ? bookings.find(b => {
              if (b.endTime < b.startTime) {
                return 0 < b.endTime;
              }
              return 0 >= b.startTime && 0 < b.endTime;
            })?._id.toString()
          : undefined,
      });
    } else {
      // Normal case: endHour is between 1 and 23, and endHour > startHour
      // Note: endHour is the closing hour, so last slot is (endHour-1) to endHour
      // e.g., if endHour is 22 (10 PM), last slot is 21-22, not 22-23
      for (let hour = ground.operatingHours.start; hour < ground.operatingHours.end; hour++) {
        const isBooked = bookedHours.has(hour);
        slots.push({
          hour,
          available: !isBooked,
          booked: isBooked,
          bookingId: isBooked
            ? bookings.find(b => {
                if (b.endTime < b.startTime) {
                  return hour >= b.startTime && hour <= 23;
                }
                return hour >= b.startTime && hour < b.endTime;
              })?._id.toString()
            : undefined,
        });
      }
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

