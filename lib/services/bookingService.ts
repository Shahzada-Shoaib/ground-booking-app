import { Ground, Booking, TimeSlot, BookingFormData } from '@/lib/types';
import apiService from '@/lib/utils/apiService';

/**
 * Booking Service - MongoDB API integration
 * All data operations go through API calls to MongoDB
 */

export class BookingService {
  // Ground operations
  static async getGround(id: string): Promise<Ground | null> {
    try {
      const response = await apiService.get<Ground>(`/grounds/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get ground error:', error);
      return null;
    }
  }

  static async getAllGrounds(): Promise<Ground[]> {
    try {
      const response = await apiService.get<Ground[]>('/grounds');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Get all grounds error:', error);
      return [];
    }
  }

  static async createGround(ground: Omit<Ground, 'id' | 'createdAt'>): Promise<Ground | null> {
    try {
      const response = await apiService.post<Ground>('/grounds', ground);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create ground');
    } catch (error: any) {
      console.error('Create ground error:', error);
      throw error;
    }
  }

  static async updateGround(id: string, updates: Partial<Ground>): Promise<Ground | null> {
    try {
      const response = await apiService.put<Ground>(`/grounds/${id}`, updates);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Update ground error:', error);
      return null;
    }
  }

  static async deleteGround(id: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`/grounds/${id}`);
      return response.success;
    } catch (error) {
      console.error('Delete ground error:', error);
      return false;
    }
  }

  // Booking operations
  static async createBooking(bookingData: BookingFormData, groundId: string): Promise<Booking | Booking[]> {
    try {
      const response = await apiService.post<Booking | Booking[]>('/bookings', {
        ...bookingData,
        groundId,
        type: 'single',
      });
      
      if (response.success && response.data) {
        // Handle both single and array responses (for recurring bookings)
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      throw new Error(response.error || 'Failed to create booking');
    } catch (error: any) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  static async getBookings(groundId?: string): Promise<Booking[]> {
    try {
      const params = groundId ? `?groundId=${groundId}` : '';
      const response = await apiService.get<Booking[]>(`/bookings${params}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Get bookings error:', error);
      return [];
    }
  }

  static async getBooking(id: string): Promise<Booking | null> {
    try {
      const response = await apiService.get<Booking>(`/bookings/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get booking error:', error);
      return null;
    }
  }

  static async cancelBooking(id: string): Promise<Booking | null> {
    try {
      const response = await apiService.delete<{ id: string; status: string; cancelledAt: string }>(`/bookings/${id}`);
      if (response.success && response.data) {
        // Fetch updated booking
        return this.getBooking(id);
      }
      return null;
    } catch (error) {
      console.error('Cancel booking error:', error);
      return null;
    }
  }

  static async rescheduleBooking(
    id: string,
    newDate: string,
    newStartTime: number,
    newEndTime: number
  ): Promise<Booking | null> {
    try {
      const response = await apiService.patch<Booking>(`/bookings/${id}`, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      });
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Reschedule booking error:', error);
      return null;
    }
  }

  // Time slot operations
  static async getAvailableSlots(groundId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response = await apiService.get<TimeSlot[]>(`/bookings/availability?groundId=${groundId}&date=${date}`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Get available slots error:', error);
      return [];
    }
  }

  static async isSlotAvailable(
    groundId: string,
    date: string,
    startTime: number,
    endTime: number
  ): Promise<boolean> {
    try {
      const slots = await this.getAvailableSlots(groundId, date);
      for (let hour = startTime; hour < endTime; hour++) {
        const slot = slots.find((s) => s.hour === hour);
        if (!slot || !slot.available) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Check slot availability error:', error);
      return false;
    }
  }

  // Aggregate statistics operations
  static async getTotalBookings(): Promise<number> {
    try {
      const bookings = await this.getBookings();
      return bookings.length;
    } catch (error) {
      console.error('Get total bookings error:', error);
      return 0;
    }
  }

  static async getTotalRevenue(): Promise<number> {
    try {
      const bookings = await this.getBookings();
      return bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    } catch (error) {
      console.error('Get total revenue error:', error);
      return 0;
    }
  }

  static async getTodayTotalBookings(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const bookings = await this.getBookings();
      return bookings.filter((b) => b.date === today).length;
    } catch (error) {
      console.error('Get today bookings error:', error);
      return 0;
    }
  }

  static async getRevenueByGround(): Promise<Array<{ groundId: string; groundName: string; revenue: number }>> {
    try {
      const bookings = await this.getBookings();
      const grounds = await this.getAllGrounds();
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
    } catch (error) {
      console.error('Get revenue by ground error:', error);
      return [];
    }
  }

  static async getBookingsByGround(): Promise<Array<{ groundId: string; groundName: string; count: number }>> {
    try {
      const bookings = await this.getBookings();
      const grounds = await this.getAllGrounds();
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
    } catch (error) {
      console.error('Get bookings by ground error:', error);
      return [];
    }
  }

  static async getActiveGroundsCount(): Promise<number> {
    try {
      const grounds = await this.getAllGrounds();
      const bookings = await this.getBookings();
      const groundsWithBookings = new Set(bookings.map((b) => b.groundId));
      return groundsWithBookings.size;
    } catch (error) {
      console.error('Get active grounds count error:', error);
      return 0;
    }
  }

  // Utility
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
