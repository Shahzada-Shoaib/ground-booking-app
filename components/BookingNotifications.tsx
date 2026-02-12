'use client';

import React from 'react';
import { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';

interface BookingNotificationsProps {
  bookings: Booking[];
}

export const BookingNotifications: React.FC<BookingNotificationsProps> = ({
  bookings,
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's bookings
  const todayBookings = bookings.filter(b => b.date === today);
  
  // Get upcoming bookings (next 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate > new Date(today) && bookingDate <= sevenDaysFromNow;
  }).slice(0, 5);

  if (todayBookings.length === 0 && upcomingBookings.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-2 border-[var(--warning)]/30 bg-[var(--warning)]/10">
      <CardHeader className="bg-[var(--warning)]/20 border-b border-[var(--warning)]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--warning)] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-[var(--foreground)]">Today's Schedule</CardTitle>
            <p className="text-xs text-[var(--muted-foreground)]">Bookings for today and upcoming days</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {todayBookings.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-[var(--foreground)] mb-2">
              📅 Today ({todayBookings.length} booking{todayBookings.length > 1 ? 's' : ''})
            </p>
            <div className="space-y-2">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="p-3 bg-[var(--card)] rounded-lg border-2 border-[var(--warning)]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{booking.customerName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatTimeRange(booking.startTime, booking.endTime)} • Rs. {booking.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingBookings.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)] mb-2">
              🔜 Upcoming (Next 7 Days)
            </p>
            <div className="space-y-2">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{booking.customerName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatDateShort(booking.date)} • {formatTimeRange(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
