import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Ground from '@/lib/models/Ground';
import { requireAuth, requireAdmin } from '@/lib/utils/middleware';
import { z } from 'zod';

const groundSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['cricket', 'padel', 'football', 'tennis', 'basketball', 'badminton', 'other']),
  ownerName: z.string().min(1, 'Owner name is required'),
  description: z.string().optional(),
  operatingHours: z.object({
    start: z.number().min(0).max(23),
    end: z.number().min(0).max(23),
  }),
  pricePerHour: z.number().min(0),
  images: z.array(z.string()).optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    mapLink: z.string().optional(),
  }).optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  maintenanceDates: z.array(z.string()).optional(),
  peakPricing: z.array(z.object({
    startHour: z.number(),
    endHour: z.number(),
    multiplier: z.number(),
  })).optional(),
  seasonalPricing: z.array(z.object({
    startDate: z.string(),
    endDate: z.string(),
    pricePerHour: z.number(),
  })).optional(),
});

// GET - Get all grounds
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');

    const query: any = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    if (type) {
      query.type = type;
    }

    const grounds = await Ground.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: grounds.map(ground => ({
        id: ground._id.toString(),
        name: ground.name,
        type: ground.type,
        ownerName: ground.ownerName,
        description: ground.description,
        operatingHours: ground.operatingHours,
        pricePerHour: ground.pricePerHour,
        images: ground.images || [],
        location: ground.location,
        amenities: ground.amenities || [],
        isActive: ground.isActive,
        maintenanceDates: ground.maintenanceDates || [],
        peakPricing: ground.peakPricing || [],
        seasonalPricing: ground.seasonalPricing || [],
        createdAt: ground.createdAt.toISOString(),
        updatedAt: ground.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get grounds error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get grounds' },
      { status: 500 }
    );
  }
}

// POST - Create new ground (Admin only, but optional for development)
export async function POST(request: NextRequest) {
  try {
    // Try to authenticate, but don't block if not authenticated (for development)
    const adminResult = requireAdmin(request);
    // If authentication fails, we'll still allow creation (for development)
    // In production, you should uncomment the check below:
    // if (!adminResult.user) {
    //   return (adminResult as any).response;
    // }

    await connectDB();

    const body = await request.json();
    const validatedData = groundSchema.parse(body);

    const ground = await Ground.create(validatedData);

    return NextResponse.json({
      success: true,
      data: {
        id: ground._id.toString(),
        name: ground.name,
        type: ground.type,
        ownerName: ground.ownerName,
        description: ground.description,
        operatingHours: ground.operatingHours,
        pricePerHour: ground.pricePerHour,
        images: ground.images || [],
        location: ground.location,
        amenities: ground.amenities || [],
        isActive: ground.isActive,
        maintenanceDates: ground.maintenanceDates || [],
        peakPricing: ground.peakPricing || [],
        seasonalPricing: ground.seasonalPricing || [],
        createdAt: ground.createdAt.toISOString(),
        updatedAt: ground.updatedAt.toISOString(),
      },
      message: 'Ground created successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create ground error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ground' },
      { status: 500 }
    );
  }
}

