import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'payment_received' | 'system';
export type NotificationChannel = 'email' | 'sms' | 'in_app' | 'push';

export interface INotification extends Document {
  _id: string;
  userId?: string;
  bookingId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  sentAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      index: true,
    },
    bookingId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ['booking_confirmed', 'booking_cancelled', 'booking_reminder', 'payment_received', 'system'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'in_app', 'push'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    sentAt: Date,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

