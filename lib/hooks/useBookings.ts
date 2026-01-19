import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/lib/types';
import { BookingService } from '@/lib/services/bookingService';

export const useBookings = (groundId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBookings = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const allBookings = BookingService.getBookings(groundId);
      setBookings(allBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [groundId]);

  useEffect(() => {
    refreshBookings();
  }, [groundId, refreshBookings]);

  const cancelBooking = (bookingId: string) => {
    try {
      const cancelled = BookingService.cancelBooking(bookingId);
      if (cancelled) {
        refreshBookings();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      return false;
    }
  };

  return {
    bookings,
    isLoading,
    error,
    refreshBookings,
    cancelBooking,
  };
};
