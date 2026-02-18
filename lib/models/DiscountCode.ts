import mongoose, { Schema, Document, Model } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';
export type DiscountStatus = 'active' | 'inactive' | 'expired';

export interface IDiscountCode extends Document {
  code: string;
  type: DiscountType;
  value: number; // Percentage (0-100) or fixed amount
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  applicableGrounds?: string[]; // Empty = all grounds
  status: DiscountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: Number,
    maxDiscount: Number,
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: Number,
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableGrounds: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

DiscountCodeSchema.index({ code: 1, status: 1 });
DiscountCodeSchema.index({ validFrom: 1, validUntil: 1 });

const DiscountCode: Model<IDiscountCode> = mongoose.models.DiscountCode || mongoose.model<IDiscountCode>('DiscountCode', DiscountCodeSchema);

export default DiscountCode;

