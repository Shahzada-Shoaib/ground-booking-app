export interface Ground {
  id: string;
  name: string;
  ownerName: string;
  operatingHours: {
    start: number; // Hour in 24-hour format (e.g., 9 for 9 AM)
    end: number; // Hour in 24-hour format (e.g., 22 for 10 PM)
  };
  pricePerHour: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  groundId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: number; // Hour in 24-hour format
  endTime: number; // Hour in 24-hour format
  hours: number; // Number of hours booked
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface TimeSlot {
  hour: number; // Start hour in 24-hour format
  available: boolean;
  booked: boolean;
  bookingId?: string; // If booked, reference to booking
}

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  startTime: number;
  endTime: number;
}

export interface GroundSettings {
  name: string;
  ownerName: string;
  startHour: number;
  endHour: number;
  pricePerHour: number;
}
