'use client';

import React, { useState } from 'react';
import { Ground, TimeSlot } from '@/lib/types';
import { useTimeSlots } from '@/lib/hooks/useTimeSlots';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Calendar } from './ui/Calendar';
import { TimeSlotTimeline } from './TimeSlotTimeline';
import { Card, CardContent } from './ui/Card';

interface BookingCalendarProps {
  ground: Ground;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  onTimeSelection: (startTime: number, endTime: number) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  ground,
  selectedDate,
  onDateChange,
  selectedStartTime,
  selectedEndTime,
  onTimeSelection,
}) => {
  const { slots, isLoading } = useTimeSlots(ground.id, selectedDate);

  return (
    <Card className="shadow-lg border-2 border-green-100">
      <CardContent>
        <div className="space-y-6">
          {/* Date Selection - Calendar */}
          <div id="date-calendar">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-900">
                  Step 1: Select Date
                </label>
                <p className="text-xs text-gray-500 mt-0.5">Pick a date for your booking</p>
              </div>
            </div>
            <div className="w-full max-w-md">
              <Calendar
                selectedDate={selectedDate}
                onDateChange={onDateChange}
              />
            </div>
          </div>

          {/* Time Slots Timeline */}
          <div id="time-selection">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-900">
                  Step 2: Select Time Slot
                </label>
                <p className="text-xs text-gray-500 mt-0.5">Choose your preferred time range</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No time slots available for this date
              </div>
            ) : (
              <TimeSlotTimeline
                slots={slots}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                onTimeSelection={onTimeSelection}
              />
            )}
          </div>

          {/* Price Summary */}
          {selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0 && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Booking Summary
              </p>
              <p className="text-sm text-blue-700">
                Total: Rs. {(selectedEndTime - selectedStartTime) * ground.pricePerHour} ({selectedEndTime - selectedStartTime} hour
                {selectedEndTime - selectedStartTime > 1 ? 's' : ''} × Rs. {ground.pricePerHour}/hour)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
