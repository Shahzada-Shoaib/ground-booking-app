'use client';

import React from 'react';
import { Booking, Ground } from '@/lib/types';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface BookingReceiptProps {
  booking: Booking;
  ground: Ground;
  onClose?: () => void;
}

export const BookingReceipt: React.FC<BookingReceiptProps> = ({
  booking,
  ground,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:block">
      <Card className="shadow-xl border-2 border-gray-200 print:shadow-none print:border-0">
        <CardContent className="p-4 sm:p-6 print:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-gray-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{ground.name}</h2>
            <p className="text-sm sm:text-base text-gray-600">Booking Receipt</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 mb-6 sm:mb-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                <p className="font-semibold text-gray-900">{booking.id.slice(0, 12)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-gray-900">{formatDateShort(booking.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Time</p>
                <p className="font-semibold text-gray-900">{formatTimeRange(booking.startTime, booking.endTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">{booking.hours} hour{booking.hours > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Customer Name</p>
              <p className="text-lg font-bold text-gray-900">{booking.customerName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{booking.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Price per hour</span>
              <span className="font-semibold">Rs. {ground.pricePerHour.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Hours</span>
              <span className="font-semibold">{booking.hours}</span>
            </div>
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-green-600">Rs. {booking.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Thank you for your booking! We look forward to seeing you.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Receipt generated on {new Date().toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          {onClose && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
              <Button onClick={handlePrint} variant="outline" className="flex-1 min-h-[44px]">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Receipt
              </Button>
              <Button onClick={onClose} className="flex-1 min-h-[44px]">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
