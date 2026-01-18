'use client';

import React from 'react';
import { Ground } from '@/lib/types';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface BookingSummaryProps {
  ground: Ground;
  selectedDate: string | null;
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  onEditDate?: () => void;
  onEditTime?: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  ground,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onEditDate,
  onEditTime,
}) => {
  const hours = selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0
    ? selectedEndTime - selectedStartTime
    : 0;
  const totalPrice = hours * ground.pricePerHour;

  const hasSelection = selectedDate && selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0;

  return (
    <Card className="lg:sticky lg:top-4 shadow-lg border-2 border-green-100">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Ground Info */}
          <div className="pb-4 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Ground</p>
            <p className="text-base font-semibold text-gray-900">{ground.name}</p>
            <p className="text-xs text-gray-500 mt-1">Rs. {ground.pricePerHour.toLocaleString()} per hour</p>
          </div>

          {/* Date Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Date</p>
              {selectedDate && onEditDate && (
                <button
                  onClick={onEditDate}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {selectedDate ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDateShort(selectedDate)}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Not selected</p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Time</p>
              {hasSelection && onEditTime && (
                <button
                  onClick={onEditTime}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {hasSelection ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTimeRange(selectedStartTime!, selectedEndTime!)}
                    </p>
                    <p className="text-xs text-gray-500">{hours} hour{hours !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Not selected</p>
            )}
          </div>

          {/* Price Breakdown */}
          {hasSelection && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hours</span>
                <span className="font-medium text-gray-900">{hours} × Rs. {ground.pricePerHour.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-green-600">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${selectedDate ? 'text-green-600' : 'text-gray-400'}`}>
                  {selectedDate ? '✓' : '○'} Date Selected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${hasSelection ? 'text-green-600' : 'text-gray-400'}`}>
                  {hasSelection ? '✓' : '○'} Time Selected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-400">○ Details Pending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
