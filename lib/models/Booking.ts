import mongoose, { Schema, Document, Model } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type BookingType = 'single' | 'recurring';

export interface IBooking extends Document {
  _id: string;
  groundId: string;
  userId?: string; // If user is logged in
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: number; // Hour in 24-hour format
  endTime: number; // Hour in 24-hour format
  hours: number;
  totalPrice: number;
  status: BookingStatus;
  type: BookingType;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate: string;
    occurrences?: number;
  };
  parentBookingId?: string; // For recurring bookings
  rescheduledFrom?: string; // Original booking ID if rescheduled
  cancellationReason?: string;
  cancelledAt?: Date;
  approvedBy?: string; // Admin user ID
  approvedAt?: Date;
  waitlistPosition?: number;
  specialRequests?: string;
  discountCode?: string;
  discountAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    groundId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    endTime: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    hours: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    type: {
      type: String,
      enum: ['single', 'recurring'],
      default: 'single',
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      endDate: String,
      occurrences: Number,
    },
    parentBookingId: String,
    rescheduledFrom: String,
    cancellationReason: String,
    cancelledAt: Date,
    approvedBy: String,
    approvedAt: Date,
    waitlistPosition: Number,
    specialRequests: String,
    discountCode: String,
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BookingSchema.index({ groundId: 1, date: 1, status: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

