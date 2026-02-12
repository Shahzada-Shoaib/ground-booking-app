import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  groundId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5
  comment?: string;
  bookingId?: string;
  isVerified: boolean; // Verified booking
  isApproved: boolean; // Admin approval
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    bookingId: {
      type: String,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ groundId: 1, isApproved: 1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

