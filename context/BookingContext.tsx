'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const refreshGrounds = () => {
    const allGrounds = BookingService.getAllGrounds();
    setGrounds(allGrounds);
    
    // If no current ground and grounds exist, set the first one
    if (!currentGround && allGrounds.length > 0) {
      setCurrentGround(allGrounds[0]);
    }
  };

  const refreshBookings = () => {
    const allBookings = BookingService.getBookings();
    setBookings(allBookings);
  };

  const deleteGround = (id: string): boolean => {
    const success = BookingService.deleteGround(id);
    if (success) {
      // If deleted ground was current, set to first available or null
      if (currentGround?.id === id) {
        const remainingGrounds = BookingService.getAllGrounds();
        setCurrentGround(remainingGrounds.length > 0 ? remainingGrounds[0] : null);
      }
      refreshGrounds();
      return true;
    }
    return false;
  };

  useEffect(() => {
    refreshGrounds();
    refreshBookings();
  }, []);

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
