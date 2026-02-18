import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking, { IBooking } from '@/lib/models/Booking';
import Ground from '@/lib/models/Ground';
import { requireAuth } from '@/lib/utils/middleware';
import { z } from 'zod';

const bookingSchema = z.object({
  groundId: z.string().min(1, 'Ground ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerEmail: z.string().email('Invalid email address'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.number().min(0).max(23),
  endTime: z.number().min(0).max(23),
  type: z.enum(['single', 'recurring']).default('single'),
  recurringPattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    endDate: z.string(),
    occurrences: z.number().optional(),
  }).optional(),
  specialRequests: z.string().optional(),
  discountCode: z.string().optional(),
});

// GET - Get all bookings (with filters) - Auth optional for development
export async function GET(request: NextRequest) {
  try {
    // Try to authenticate, but don't block if not authenticated (for development)
    const authResult = requireAuth(request);
    // If authentication fails, we'll still allow fetching bookings (for development)
    // In production, you should uncomment the check below:
    // if (!authResult.user) {
    //   return (authResult as any).response;
    // }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const groundId = searchParams.get('groundId');
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};

    // Admin can see all, customers see only their bookings
    if (authResult.user && authResult.user.role === 'customer') {
      query.userId = authResult.user.userId;
    } else if (userId) {
      query.userId = userId;
    }

    if (groundId) {
      query.groundId = groundId;
    }
    if (date) {
      query.date = date;
    }
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query)
      .sort({ date: -1, startTime: -1 })
      .limit(1000);

    return NextResponse.json({
      success: true,
      data: bookings.map(booking => ({
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
      })),
    });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bookings' },
      { status: 500 }
    );
  }
}

// POST - Create new booking (Auth optional for development)
export async function POST(request: NextRequest) {
  try {
    // Try to authenticate, but don't block if not authenticated (for development)
    const authResult = requireAuth(request);
    // If authentication fails, we'll still allow booking creation (for development)
    // In production, you should uncomment the check below:
    // if (!authResult.user) {
    //   return (authResult as any).response;
    // }

    await connectDB();
    
    // Use userId if authenticated, otherwise null
    const userId = authResult.user?.userId || undefined;

    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    // Validate time range - allow overnight bookings (endTime < startTime)
    if (validatedData.endTime === validatedData.startTime) {
      return NextResponse.json(
        { error: 'Start time and end time cannot be the same' },
        { status: 400 }
      );
    }

    // Check if ground exists
    const ground = await Ground.findById(validatedData.groundId);
    if (!ground) {
      return NextResponse.json(
        { error: 'Ground not found' },
        { status: 404 }
      );
    }

    if (!ground.isActive) {
      return NextResponse.json(
        { error: 'Ground is currently inactive' },
        { status: 400 }
      );
    }

    // Check if date is in maintenance
    if (ground.maintenanceDates?.includes(validatedData.date)) {
      return NextResponse.json(
        { error: 'Ground is under maintenance on this date' },
        { status: 400 }
      );
    }

    // Helper function to calculate hours (handles overnight)
    const calculateHours = (startTime: number, endTime: number): number => {
      if (endTime < startTime) {
        // Overnight: from startTime to 24, then 0 to endTime
        return (24 - startTime) + endTime;
      }
      return endTime - startTime;
    };

    const hours = calculateHours(validatedData.startTime, validatedData.endTime);

    // Check availability for all time slots (handles overnight bookings)
    const isOvernightBooking = validatedData.endTime < validatedData.startTime;
    
    if (isOvernightBooking) {
      // Check today's date from startTime to 23
      for (let hour = validatedData.startTime; hour <= 23; hour++) {
        const conflictingBooking = await Booking.findOne({
          groundId: validatedData.groundId,
          date: validatedData.date,
          status: { $in: ['pending', 'confirmed'] },
          $or: [
            // Normal booking that overlaps
            { startTime: { $lte: hour }, endTime: { $gt: hour } },
            // Overnight booking that overlaps (from startTime to 23)
            { 
              $expr: { 
                $and: [
                  { $lt: ['$endTime', '$startTime'] },
                  { $gte: ['$startTime', hour] }
                ]
              }
            }
          ],
        });

        if (conflictingBooking) {
          return NextResponse.json(
            { error: `Time slot ${hour}:00 on ${validatedData.date} is already booked` },
            { status: 400 }
          );
        }
      }

      // Check next day's date from 0 to endTime
      const nextDate = new Date(validatedData.date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      // Also check if next day is in maintenance
      if (ground.maintenanceDates?.includes(nextDateStr)) {
        return NextResponse.json(
          { error: 'Ground is under maintenance on the next day' },
          { status: 400 }
        );
      }

      for (let hour = 0; hour < validatedData.endTime; hour++) {
        const conflictingBooking = await Booking.findOne({
          groundId: validatedData.groundId,
          date: nextDateStr,
          status: { $in: ['pending', 'confirmed'] },
          $or: [
            // Normal booking that overlaps
            { startTime: { $lte: hour }, endTime: { $gt: hour } },
            // Overnight booking that overlaps (from 0 to endTime)
            { 
              $expr: { 
                $and: [
                  { $lt: ['$endTime', '$startTime'] },
                  { $lt: [hour, '$endTime'] }
                ]
              }
            }
          ],
        });

        if (conflictingBooking) {
          return NextResponse.json(
            { error: `Time slot ${hour}:00 on ${nextDateStr} is already booked` },
            { status: 400 }
          );
        }
      }
    } else {
      // Normal booking: same day
      for (let hour = validatedData.startTime; hour < validatedData.endTime; hour++) {
        const conflictingBooking = await Booking.findOne({
          groundId: validatedData.groundId,
          date: validatedData.date,
          status: { $in: ['pending', 'confirmed'] },
          $or: [
            // Normal booking that overlaps
            { startTime: { $lte: hour }, endTime: { $gt: hour } },
            // Overnight booking that overlaps (from startTime to 23)
            { 
              $expr: { 
                $and: [
                  { $lt: ['$endTime', '$startTime'] },
                  { $gte: ['$startTime', hour] }
                ]
              }
            }
          ],
        });

        if (conflictingBooking) {
          return NextResponse.json(
            { error: `Time slot ${hour}:00 is already booked` },
            { status: 400 }
          );
        }
      }
    }

    // Calculate price
    let basePrice = ground.pricePerHour * hours;

    // Apply seasonal pricing if applicable
    const today = new Date(validatedData.date);
    const seasonalPrice = ground.seasonalPricing?.find(sp => {
      const start = new Date(sp.startDate);
      const end = new Date(sp.endDate);
      return today >= start && today <= end;
    });

    if (seasonalPrice) {
      basePrice = seasonalPrice.pricePerHour * hours;
    }

    // Apply peak pricing if applicable (handles overnight bookings)
    if (ground.peakPricing && ground.peakPricing.length > 0) {
      const peakPrice = ground.peakPricing.find(pp => {
        if (isOvernightBooking) {
          // For overnight bookings, check if booking spans peak hours
          // Peak hours could be on same day (startHour to 23) or next day (0 to endHour)
          const peakIsOvernight = pp.endHour < pp.startHour;
          
          if (peakIsOvernight) {
            // Peak hours are overnight: check if booking overlaps
            // Booking from startTime to 23 overlaps if startTime >= pp.startHour
            // Booking from 0 to endTime overlaps if endTime <= pp.endHour
            return (validatedData.startTime >= pp.startHour) || (validatedData.endTime <= pp.endHour);
          } else {
            // Peak hours are normal: check if booking overlaps
            // Booking from startTime to 23 overlaps if startTime >= pp.startHour
            // Or booking from 0 to endTime overlaps if endTime <= pp.endHour
            return (validatedData.startTime >= pp.startHour && validatedData.startTime <= pp.endHour) ||
                   (validatedData.endTime >= pp.startHour && validatedData.endTime <= pp.endHour);
          }
        } else {
          // Normal booking: check if fully within peak hours
          return validatedData.startTime >= pp.startHour && validatedData.endTime <= pp.endHour;
        }
      });
      if (peakPrice) {
        basePrice = basePrice * peakPrice.multiplier;
      }
    }

    // Apply discount if code provided
    let discountAmount = 0;
    if (validatedData.discountCode) {
      // TODO: Implement discount code validation
      // For now, skip discount
    }

    const totalPrice = basePrice - discountAmount;

    // Create booking(s)
    const bookings: IBooking[] = [];
    
    if (validatedData.type === 'recurring' && validatedData.recurringPattern) {
      // Create recurring bookings
      const startDate = new Date(validatedData.date);
      const endDate = new Date(validatedData.recurringPattern.endDate);
      const frequency = validatedData.recurringPattern.frequency;
      
      let currentDate = new Date(startDate);
      let count = 0;
      const maxOccurrences = validatedData.recurringPattern.occurrences || 365;

      while (currentDate <= endDate && count < maxOccurrences) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check availability for this date (handles overnight bookings)
        let isAvailable = true;
        
        if (isOvernightBooking) {
          // Check today's date from startTime to 23
          for (let hour = validatedData.startTime; hour <= 23; hour++) {
            const conflictingBooking = await Booking.findOne({
              groundId: validatedData.groundId,
              date: dateStr,
              status: { $in: ['pending', 'confirmed'] },
              $or: [
                { startTime: { $lte: hour }, endTime: { $gt: hour } },
                { 
                  $expr: { 
                    $and: [
                      { $lt: ['$endTime', '$startTime'] },
                      { $gte: ['$startTime', hour] }
                    ]
                  }
                }
              ],
            });

            if (conflictingBooking) {
              isAvailable = false;
              break;
            }
          }

          if (isAvailable) {
            // Check next day's date from 0 to endTime
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextDateStr = nextDate.toISOString().split('T')[0];

            for (let hour = 0; hour < validatedData.endTime; hour++) {
              const conflictingBooking = await Booking.findOne({
                groundId: validatedData.groundId,
                date: nextDateStr,
                status: { $in: ['pending', 'confirmed'] },
                $or: [
                  { startTime: { $lte: hour }, endTime: { $gt: hour } },
                  { 
                    $expr: { 
                      $and: [
                        { $lt: ['$endTime', '$startTime'] },
                        { $lt: [hour, '$endTime'] }
                      ]
                    }
                  }
                ],
              });

              if (conflictingBooking) {
                isAvailable = false;
                break;
              }
            }
          }
        } else {
          // Normal booking: same day
          for (let hour = validatedData.startTime; hour < validatedData.endTime; hour++) {
            const conflictingBooking = await Booking.findOne({
              groundId: validatedData.groundId,
              date: dateStr,
              status: { $in: ['pending', 'confirmed'] },
              $or: [
                { startTime: { $lte: hour }, endTime: { $gt: hour } },
                { 
                  $expr: { 
                    $and: [
                      { $lt: ['$endTime', '$startTime'] },
                      { $gte: ['$startTime', hour] }
                    ]
                  }
                }
              ],
            });

            if (conflictingBooking) {
              isAvailable = false;
              break;
            }
          }
        }

        if (isAvailable) {
          const booking = await Booking.create({
            groundId: validatedData.groundId,
            userId: userId,
            customerName: validatedData.customerName,
            customerPhone: validatedData.customerPhone,
            customerEmail: validatedData.customerEmail,
            date: dateStr,
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
            hours: hours,
            totalPrice: totalPrice,
            status: 'confirmed',
            type: 'recurring',
            recurringPattern: validatedData.recurringPattern,
            parentBookingId: count === 0 ? undefined : bookings[0]._id.toString(),
            specialRequests: validatedData.specialRequests,
            discountCode: validatedData.discountCode,
            discountAmount: discountAmount,
          });

          bookings.push(booking);
          count++;
        }

        // Move to next date based on frequency
        if (frequency === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (frequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      if (bookings.length === 0) {
        return NextResponse.json(
          { error: 'No available slots found for recurring booking' },
          { status: 400 }
        );
      }
    } else {
      // Single booking
      const booking = await Booking.create({
        groundId: validatedData.groundId,
        userId: userId,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        date: validatedData.date,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        hours: hours,
        totalPrice: totalPrice,
        status: 'confirmed',
        type: 'single',
        specialRequests: validatedData.specialRequests,
        discountCode: validatedData.discountCode,
        discountAmount: discountAmount,
      });

      bookings.push(booking);
    }

    return NextResponse.json({
      success: true,
      data: bookings.map(booking => ({
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
        specialRequests: booking.specialRequests,
        discountCode: booking.discountCode,
        discountAmount: booking.discountAmount,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      })),
      message: bookings.length > 1 
        ? `${bookings.length} recurring bookings created successfully`
        : 'Booking created successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

