'use client';

import React, { useState } from 'react';
import { Booking } from '@/lib/types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';
import { Input } from './ui/Input';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { BookingReceipt } from './BookingReceipt';

import { Ground } from '@/lib/types';

interface BookingsListProps {
  bookings: Booking[];
  isLoading?: boolean;
  onCancelBooking?: (bookingId: string) => void;
  showGroundName?: boolean;
  onDateFilter?: (date: string) => void;
  ground?: Ground;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  isLoading = false,
  onCancelBooking,
  showGroundName = false,
  onDateFilter,
  ground,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [viewReceiptBooking, setViewReceiptBooking] = useState<Booking | null>(null);

  // Handle date filter change
  const handleDateFilterChange = (date: string) => {
    setFilterDate(date);
    if (onDateFilter) {
      onDateFilter(date);
    }
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Get upcoming bookings (future dates)
  const upcomingBookings = bookings.filter(b => b.date > today);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || booking.date === filterDate;
    
    return matchesSearch && matchesDate;
  });

  const handleCancelClick = (bookingId: string) => {
    setCancelBookingId(bookingId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId || !onCancelBooking) return;

    setIsCancelling(true);
    try {
      onCancelBooking(cancelBookingId);
      setCancelBookingId(null);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="shadow-lg border-2 border-[var(--border)]">
        <CardContent>
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-[var(--muted-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Bookings Yet</h3>
            <p className="text-[var(--muted-foreground)]">
              When customers book your ground, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Search and Filter Section */}
      <Card className="shadow-lg border-2 border-[var(--border)] mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Bookings
                  </span>
                </label>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, or email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Filter by Date
                  </span>
                </label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                Showing <span className="font-bold text-[var(--foreground)]">{filteredBookings.length}</span> of{' '}
                <span className="font-bold text-[var(--foreground)]">{bookings.length}</span> booking{bookings.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
                {filterDate && (
                  <button
                    onClick={() => {
                      setFilterDate('');
                      if (onDateFilter) onDateFilter('');
                    }}
                    className="text-sm text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
                  >
                    Clear Date Filter
                  </button>
                )}
                <div className="text-xs text-[var(--muted-foreground)]">
                  {upcomingBookings.length} upcoming
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="shadow-lg hover:shadow-xl transition-shadow border-2 border-[var(--border)] overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.customerName}</h3>
                        <p className="text-white/80 text-xs">Booking ID: {booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-[var(--primary-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                        <p className="font-semibold text-[var(--foreground)]">{formatDateShort(booking.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-[var(--primary-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Time</p>
                        <p className="font-semibold text-[var(--foreground)]">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{booking.hours} hour{booking.hours !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-3 border-t border-[var(--border)] space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-[var(--foreground)]">{booking.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[var(--foreground)] truncate">{booking.customerEmail}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-3 border-t-2 border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">Total Amount</span>
                      <span className="text-2xl font-bold text-[var(--primary-600)]">Rs. {booking.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {ground && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        onClick={() => setViewReceiptBooking(booking)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Receipt
                      </Button>
                    )}
                    {onCancelBooking && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        onClick={() => handleCancelClick(booking.id)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg border-2 border-[var(--border)]">
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--warning)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Results Found</h3>
              <p className="text-[var(--muted-foreground)] mb-4">No bookings match your search criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate('');
                }}
                className="text-sm text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
              >
                Clear all filters
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelBookingId !== null}
        onClose={() => setCancelBookingId(null)}
        title="Cancel Booking"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--danger)]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Confirm Cancellation</h3>
              <p className="text-[var(--foreground)]">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
            <Button
              variant="outline"
              onClick={() => setCancelBookingId(null)}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={isCancelling}
            >
              Yes, Cancel It
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      {viewReceiptBooking && ground && (
        <Modal
          isOpen={viewReceiptBooking !== null}
          onClose={() => setViewReceiptBooking(null)}
          title=""
          size="lg"
        >
          <BookingReceipt
            booking={viewReceiptBooking}
            ground={ground}
            onClose={() => setViewReceiptBooking(null)}
          />
        </Modal>
      )}
    </>
  );
};
