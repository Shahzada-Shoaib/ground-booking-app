'use client';

import React, { useState } from 'react';
import { Booking } from '@/lib/types';
import { CalendarWithBookings } from './CalendarWithBookings';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';
import { Modal } from './ui/Modal';

interface BookingCalendarViewProps {
  bookings: Booking[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  getBookingsCount?: (date: string) => number;
}

export const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
  bookings,
  selectedDate,
  onDateSelect,
  getBookingsCount: externalGetBookingsCount,
}) => {
  const [viewDate, setViewDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Get bookings count per date
  const getBookingsForDate = (date: string): Booking[] => {
    return bookings.filter(b => b.date === date);
  };

  const getBookingsCount = (date: string): number => {
    if (externalGetBookingsCount) {
      return externalGetBookingsCount(date);
    }
    return getBookingsForDate(date).length;
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Custom calendar render (we'll enhance the Calendar component or create a wrapper)
  const dateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-2 border-[var(--primary-200)]" variant="elevated">
        <CardHeader className="bg-[var(--primary-50)] border-b border-[var(--primary-200)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--primary-600)] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[var(--foreground)]">Bookings Calendar</CardTitle>
              <p className="text-sm text-[var(--primary-700)] mt-1 font-medium">View bookings by date</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="w-full max-w-md mx-auto mb-4 sm:mb-6">
            <CalendarWithBookings
              selectedDate={viewDate}
              onDateChange={(date) => {
                setViewDate(date);
                onDateSelect(date);
              }}
              bookings={bookings}
            />
          </div>

          {/* Selected Date Bookings */}
          {selectedDate && dateBookings.length > 0 && (
            <div className="mt-6 p-4 bg-[var(--primary-50)] border-2 border-[var(--primary-200)] rounded-xl">
              <h3 className="font-bold text-[var(--foreground)] mb-3">
                {dateBookings.length} Booking{dateBookings.length > 1 ? 's' : ''} on {formatDateShort(selectedDate)}
              </h3>
              <div className="space-y-2">
                {dateBookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full text-left p-3 bg-[var(--card)] rounded-lg border-2 border-[var(--primary-200)] hover:border-[var(--primary-400)] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{booking.customerName}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {formatTimeRange(booking.startTime, booking.endTime)} • Rs. {booking.totalPrice}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && dateBookings.length === 0 && (
            <div className="mt-6 p-6 text-center bg-[var(--muted)] rounded-xl border-2 border-dashed border-[var(--border)]">
              <p className="text-[var(--muted-foreground)] font-medium">No bookings on this date</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--primary-50)] rounded-lg">
                <p className="text-xs text-[var(--primary-700)] mb-1 font-medium">Customer</p>
                <p className="font-semibold text-[var(--primary-800)]">{selectedBooking.customerName}</p>
              </div>
              <div className="p-3 bg-[var(--primary-50)] rounded-lg">
                <p className="text-xs text-[var(--primary-700)] mb-1 font-medium">Date</p>
                <p className="font-semibold text-[var(--primary-800)]">{formatDateShort(selectedBooking.date)}</p>
              </div>
              <div className="p-3 bg-[var(--primary-50)] rounded-lg">
                <p className="text-xs text-[var(--primary-700)] mb-1 font-medium">Time</p>
                <p className="font-semibold text-[var(--primary-800)]">{formatTimeRange(selectedBooking.startTime, selectedBooking.endTime)}</p>
              </div>
              <div className="p-3 bg-[var(--primary-50)] rounded-lg">
                <p className="text-xs text-[var(--primary-700)] mb-1 font-medium">Amount</p>
                <p className="font-semibold text-[var(--primary-800)]">Rs. {selectedBooking.totalPrice}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <p className="text-sm text-[var(--foreground)]"><span className="font-medium">Phone:</span> {selectedBooking.customerPhone}</p>
              <p className="text-sm text-[var(--foreground)]"><span className="font-medium">Email:</span> {selectedBooking.customerEmail}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
