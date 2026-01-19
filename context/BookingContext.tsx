'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Ground, Booking } from '@/lib/types';
import { BookingService } from '@/lib/services/bookingService';

interface BookingContextType {
  grounds: Ground[];
  bookings: Booking[];
  currentGround: Ground | null;
  setCurrentGround: (ground: Ground | null) => void;
  refreshBookings: () => void;
  refreshGrounds: () => void;
  deleteGround: (id: string) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentGround, setCurrentGround] = useState<Ground | null>(null);

  const refreshGrounds = useCallback(() => {
    const allGrounds = BookingService.getAllGrounds();
    setGrounds(allGrounds);
    
    // If no current ground and grounds exist, set the first one
    // Use functional update to avoid dependency on currentGround
    setCurrentGround(prev => {
      if (!prev && allGrounds.length > 0) {
        return allGrounds[0];
    }
      return prev;
    });
  }, []);

  const refreshBookings = useCallback(() => {
    const allBookings = BookingService.getBookings();
    setBookings(allBookings);
  }, []);

  const deleteGround = useCallback((id: string): boolean => {
    const success = BookingService.deleteGround(id);
    if (success) {
      // If deleted ground was current, set to first available or null
      setCurrentGround(prev => {
        if (prev?.id === id) {
        const remainingGrounds = BookingService.getAllGrounds();
          return remainingGrounds.length > 0 ? remainingGrounds[0] : null;
      }
        return prev;
      });
      refreshGrounds();
      return true;
    }
    return false;
  }, [refreshGrounds]);

  useEffect(() => {
    refreshGrounds();
    refreshBookings();
  }, [refreshGrounds, refreshBookings]);

  return (
    <BookingContext.Provider
      value={{
        grounds,
        bookings,
        currentGround,
        setCurrentGround,
        refreshBookings,
        refreshGrounds,
        deleteGround,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};
