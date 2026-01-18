import { useState, useEffect } from 'react';
import { TimeSlot } from '@/lib/types';
import { BookingService } from '@/lib/services/bookingService';

export const useTimeSlots = (groundId: string, date: string) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groundId || !date) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const availableSlots = BookingService.getAvailableSlots(groundId, date);
      setSlots(availableSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [groundId, date]);

  const refreshSlots = () => {
    if (!groundId || !date) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const availableSlots = BookingService.getAvailableSlots(groundId, date);
      setSlots(availableSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    slots,
    isLoading,
    error,
    refreshSlots,
  };
};
