import { Ground, Booking, TimeSlot, BookingFormData } from '@/lib/types';
import { StorageService } from './storageService';

/**
 * Booking Service - Data abstraction layer
 * All data operations go through this service
 * Easy to replace with API calls/database later
 */

export class BookingService {
  // Ground operations
  static getGround(id: string): Ground | null {
    const grounds = StorageService.getGrounds();
    return grounds.find((g: Ground) => g.id === id) || null;
  }

  static getAllGrounds(): Ground[] {
    return StorageService.getGrounds();
  }

  static createGround(ground: Omit<Ground, 'id' | 'createdAt'>): Ground {
    const grounds = StorageService.getGrounds();
    const newGround: Ground = {
      ...ground,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    grounds.push(newGround);
    StorageService.saveGrounds(grounds);
    return newGround;
  }

  static updateGround(id: string, updates: Partial<Ground>): Ground | null {
    const grounds = StorageService.getGrounds();
    const index = grounds.findIndex((g: Ground) => g.id === id);
    if (index === -1) return null;

    grounds[index] = { ...grounds[index], ...updates };
    StorageService.saveGrounds(grounds);
    return grounds[index];
  }

  static deleteGround(id: string): boolean {
    const grounds = StorageService.getGrounds();
    const index = grounds.findIndex((g: Ground) => g.id === id);
    if (index === -1) return false;

    grounds.splice(index, 1);
    StorageService.saveGrounds(grounds);
    return true;
  }

  // Booking operations
  static createBooking(bookingData: BookingFormData, groundId: string): Booking {
    const ground = this.getGround(groundId);
    if (!ground) {
      throw new Error('Ground not found');
    }

    const hours = bookingData.endTime - bookingData.startTime;
    const totalPrice = hours * ground.pricePerHour;

    const booking: Booking = {
      id: this.generateId(),
      groundId,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerEmail: bookingData.customerEmail,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      hours,
      totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const bookings = StorageService.getBookings();
    bookings.push(booking);
    StorageService.saveBookings(bookings);

    return booking;
  }

  static getBookings(groundId?: string): Booking[] {
    const bookings = StorageService.getBookings();
    if (groundId) {
      return bookings.filter((b: Booking) => b.groundId === groundId && b.status === 'confirmed');
    }
    return bookings.filter((b: Booking) => b.status === 'confirmed');
  }

  static getBooking(id: string): Booking | null {
    const bookings = StorageService.getBookings();
    return bookings.find((b: Booking) => b.id === id) || null;
  }

  static cancelBooking(id: string): Booking | null {
    const bookings = StorageService.getBookings();
    const index = bookings.findIndex((b: Booking) => b.id === id);
    if (index === -1) return null;

    bookings[index] = { ...bookings[index], status: 'cancelled' };
    StorageService.saveBookings(bookings);
    return bookings[index];
  }

  // Time slot operations
  static getAvailableSlots(groundId: string, date: string): TimeSlot[] {
    const ground = this.getGround(groundId);
    if (!ground) return [];

    const bookings = this.getBookings(groundId);
    const dateBookings = bookings.filter(
      (b: Booking) => b.date === date && b.status === 'confirmed'
    );

    const slots: TimeSlot[] = [];
    for (let hour = ground.operatingHours.start; hour < ground.operatingHours.end; hour++) {
      const isBooked = dateBookings.some(
        (b: Booking) => hour >= b.startTime && hour < b.endTime
      );

      slots.push({
        hour,
        available: !isBooked,
        booked: isBooked,
        bookingId: isBooked
          ? dateBookings.find((b: Booking) => hour >= b.startTime && hour < b.endTime)?.id
          : undefined,
      });
    }

    return slots;
  }

  static isSlotAvailable(
    groundId: string,
    date: string,
    startTime: number,
    endTime: number
  ): boolean {
    const slots = this.getAvailableSlots(groundId, date);
    for (let hour = startTime; hour < endTime; hour++) {
      const slot = slots.find((s) => s.hour === hour);
      if (!slot || !slot.available) {
        return false;
      }
    }
    return true;
  }

  // Aggregate statistics operations
  static getTotalBookings(): number {
    return this.getBookings().length;
  }

  static getTotalRevenue(): number {
    const bookings = this.getBookings();
    return bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  }

  static getTodayTotalBookings(): number {
    const today = new Date().toISOString().split('T')[0];
    const bookings = this.getBookings();
    return bookings.filter((b) => b.date === today).length;
  }

  static getRevenueByGround(): Array<{ groundId: string; groundName: string; revenue: number }> {
    const bookings = this.getBookings();
    const grounds = this.getAllGrounds();
    const revenueMap = new Map<string, number>();

    bookings.forEach((b) => {
      const current = revenueMap.get(b.groundId) || 0;
      revenueMap.set(b.groundId, current + b.totalPrice);
    });

    return Array.from(revenueMap.entries()).map(([groundId, revenue]) => {
      const ground = grounds.find((g) => g.id === groundId);
      return {
        groundId,
        groundName: ground?.name || 'Unknown Ground',
        revenue,
      };
    });
  }

  static getBookingsByGround(): Array<{ groundId: string; groundName: string; count: number }> {
    const bookings = this.getBookings();
    const grounds = this.getAllGrounds();
    const countMap = new Map<string, number>();

    bookings.forEach((b) => {
      const current = countMap.get(b.groundId) || 0;
      countMap.set(b.groundId, current + 1);
    });

    return Array.from(countMap.entries()).map(([groundId, count]) => {
      const ground = grounds.find((g) => g.id === groundId);
      return {
        groundId,
        groundName: ground?.name || 'Unknown Ground',
        count,
      };
    });
  }

  static getActiveGroundsCount(): number {
    const grounds = this.getAllGrounds();
    const bookings = this.getBookings();
    const groundsWithBookings = new Set(bookings.map((b) => b.groundId));
    return groundsWithBookings.size;
  }

  // Utility
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
