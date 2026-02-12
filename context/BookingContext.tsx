'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Ground } from '@/lib/types';
import { BookingService } from '@/lib/services/bookingService';

interface BookingContextType {
  grounds: Ground[];
  bookings: any[];
  currentGround: Ground | null;
  setCurrentGround: (ground: Ground | null) => void;
  refreshGrounds: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  deleteGround: (id: string) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentGround, setCurrentGround] = useState<Ground | null>(null);

  const refreshGrounds = useCallback(async () => {
    try {
      const allGrounds = await BookingService.getAllGrounds();
      setGrounds(allGrounds);
      
      // If no current ground and grounds exist, set the first one
      setCurrentGround(prev => {
        if (!prev && allGrounds.length > 0) {
          return allGrounds[0];
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to refresh grounds:', error);
    }
  }, []);

  const refreshBookings = useCallback(async () => {
    try {
      const allBookings = await BookingService.getBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  }, []);

  const deleteGround = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await BookingService.deleteGround(id);
      if (success) {
        // If deleted ground was current, set to first available or null
        setCurrentGround(prev => {
          if (prev?.id === id) {
            const remainingGrounds = grounds.filter(g => g.id !== id);
            return remainingGrounds.length > 0 ? remainingGrounds[0] : null;
          }
          return prev;
        });
        await refreshGrounds();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete ground:', error);
      return false;
    }
  }, [grounds, refreshGrounds]);

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
