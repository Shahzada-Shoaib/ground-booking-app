import mongoose, { Schema, Document, Model } from 'mongoose';

export type GroundType = 'cricket' | 'padel' | 'football' | 'tennis' | 'basketball' | 'badminton' | 'other';

export interface IGround extends Document {
  name: string;
  type: GroundType;
  ownerName: string;
  description?: string;
  operatingHours: {
    start: number;
    end: number;
  };
  pricePerHour: number;
  images?: string[];
  location?: {
    address?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    mapLink?: string; // Google Maps or other map service URL
  };
  amenities?: string[];
  isActive: boolean;
  maintenanceDates?: string[]; // Dates when ground is under maintenance
  peakPricing?: {
    startHour: number;
    endHour: number;
    multiplier: number; // e.g., 1.5 for 50% increase
  }[];
  seasonalPricing?: {
    startDate: string;
    endDate: string;
    pricePerHour: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const GroundSchema = new Schema<IGround>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['cricket', 'padel', 'football', 'tennis', 'basketball', 'badminton', 'other'],
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    operatingHours: {
      start: {
        type: Number,
        required: true,
        min: 0,
        max: 23,
      },
      end: {
        type: Number,
        required: true,
        min: 0,
        max: 23,
      },
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      mapLink: String, // Google Maps or other map service URL
    },
    amenities: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maintenanceDates: {
      type: [String],
      default: [],
    },
    peakPricing: {
      type: [
        {
          startHour: Number,
          endHour: Number,
          multiplier: Number,
        },
      ],
      default: [],
    },
    seasonalPricing: {
      type: [
        {
          startDate: String,
          endDate: String,
          pricePerHour: Number,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Ground: Model<IGround> = mongoose.models.Ground || mongoose.model<IGround>('Ground', GroundSchema);

export default Ground;

