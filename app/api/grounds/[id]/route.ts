import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Ground from '@/lib/models/Ground';
import { requireAdmin } from '@/lib/utils/middleware';
import { z } from 'zod';

const groundUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['cricket', 'padel', 'football', 'tennis', 'basketball', 'badminton', 'other']).optional(),
  ownerName: z.string().min(1).optional(),
  description: z.string().optional(),
  operatingHours: z.object({
    start: z.number().min(0).max(23),
    end: z.number().min(0).max(23),
  }).optional(),
  pricePerHour: z.number().min(0).optional(),
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
  isActive: z.boolean().optional(),
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

// GET - Get single ground
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const ground = await Ground.findById(id);
    
    if (!ground) {
      return NextResponse.json(
        { error: 'Ground not found' },
        { status: 404 }
      );
    }

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
    });
  } catch (error: any) {
    console.error('Get ground error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get ground' },
      { status: 500 }
    );
  }
}

// PUT - Update ground (Admin only, but optional for development)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try to authenticate, but don't block if not authenticated (for development)
    const adminResult = requireAdmin(request);
    // If authentication fails, we'll still allow update (for development)
    // In production, you should uncomment the check below:
    // if (!adminResult.user) {
    //   return (adminResult as any).response;
    // }

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const validatedData = groundUpdateSchema.parse(body);

    const ground = await Ground.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!ground) {
      return NextResponse.json(
        { error: 'Ground not found' },
        { status: 404 }
      );
    }

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
      message: 'Ground updated successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update ground error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ground' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ground (Admin only, but optional for development)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try to authenticate, but don't block if not authenticated (for development)
    const adminResult = requireAdmin(request);
    // If authentication fails, we'll still allow delete (for development)
    // In production, you should uncomment the check below:
    // if (!adminResult.user) {
    //   return (adminResult as any).response;
    // }

    await connectDB();
    const { id } = await params;

    const ground = await Ground.findByIdAndDelete(id);

    if (!ground) {
      return NextResponse.json(
        { error: 'Ground not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ground deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete ground error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete ground' },
      { status: 500 }
    );
  }
}

