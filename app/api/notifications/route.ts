import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/utils/middleware';

// GET - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (!authResult.user) {
      return (authResult as any).response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { userId: authResult.user.userId };
    if (isRead !== null) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      userId: authResult.user.userId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map(notif => ({
          id: notif._id.toString(),
          userId: notif.userId,
          bookingId: notif.bookingId,
          type: notif.type,
          channel: notif.channel,
          title: notif.title,
          message: notif.message,
          isRead: notif.isRead,
          readAt: notif.readAt?.toISOString(),
          sentAt: notif.sentAt?.toISOString(),
          metadata: notif.metadata,
          createdAt: notif.createdAt.toISOString(),
          updatedAt: notif.updatedAt.toISOString(),
        })),
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (!authResult.user) {
      return (authResult as any).response;
    }

    await connectDB();

    const body = await request.json();
    const { notificationIds } = body;

    if (notificationIds && Array.isArray(notificationIds)) {
      await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: authResult.user.userId,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );
    } else {
      // Mark all as read
      await Notification.updateMany(
        { userId: authResult.user.userId, isRead: false },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error: any) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

