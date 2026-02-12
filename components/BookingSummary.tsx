'use client';

import React from 'react';
import { Ground, BookingFormData } from '@/lib/types';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface BookingSummaryProps {
  ground: Ground;
  selectedDate: string | null;
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  formData?: BookingFormData; // Customer details for confirmation
  showConfirmButton?: boolean; // Show confirm button (mobile flow)
  onConfirmBooking?: () => void; // Callback for confirm action
  isConfirming?: boolean; // Loading state for confirmation
  onEditDate?: () => void;
  onEditTime?: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  ground,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  formData,
  showConfirmButton = false,
  onConfirmBooking,
  isConfirming = false,
  onEditDate,
  onEditTime,
}) => {
  const hours = selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0
    ? selectedEndTime - selectedStartTime
    : 0;
  const totalPrice = hours * ground.pricePerHour;

  const hasSelection = selectedDate && selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0;

  // If showing in modal (with confirm button), don't use Card wrapper
  if (showConfirmButton) {
    return (
      <div className="space-y-2.5 flex flex-col h-full">
        {/* Ground Info */}
        <div className="pb-2 border-b border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--muted-foreground)] mb-0.5">Ground</p>
          <p className="text-sm font-semibold text-[var(--foreground)]">{ground.name}</p>
          <p className="text-[10px] text-[var(--muted-foreground)]">Rs. {ground.pricePerHour.toLocaleString()}/hr</p>
        </div>

        {/* Date & Time - Side by Side */}
        <div className="grid grid-cols-2 gap-2.5 pb-2 border-b border-[var(--border)]">
          {/* Date Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Date</p>
              {selectedDate && onEditDate && (
                <button
                  onClick={onEditDate}
                  className="text-[10px] text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {selectedDate ? (
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 bg-[var(--muted)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[var(--foreground)] leading-tight">{formatDateShort(selectedDate)}</p>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--muted-foreground)] italic">Not selected</p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Time</p>
              {hasSelection && onEditTime && (
                <button
                  onClick={onEditTime}
                  className="text-[10px] text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {hasSelection ? (
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 bg-[var(--muted)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] leading-tight">
                    {formatTimeRange(selectedStartTime!, selectedEndTime!)}
                  </p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">{hours}h</p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--muted-foreground)] italic">Not selected</p>
            )}
          </div>
        </div>

        {/* Customer Details - Compact Grid */}
        {formData && (
          <div className="pt-2 border-t border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">Customer Details</p>
            <div className="space-y-1">
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Name</p>
                <p className="text-xs font-semibold text-[var(--foreground)]">{formData.customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Phone</p>
                  <p className="text-xs font-semibold text-[var(--foreground)]">{formData.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Email</p>
                  <p className="text-xs font-semibold text-[var(--foreground)] break-words line-clamp-1">{formData.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {hasSelection && (
          <div className="pt-2 border-t border-[var(--border)] space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">Hours</span>
              <span className="font-medium text-[var(--foreground)]">{hours} × Rs. {ground.pricePerHour.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--border)]">
              <span className="text-sm font-semibold text-[var(--foreground)]">Total</span>
              <span className="text-base font-bold text-[var(--primary-600)]">Rs. {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Confirm Booking Button */}
        {showConfirmButton && onConfirmBooking && (
          <div className="pt-2 border-t border-[var(--border)] space-y-1.5 mt-auto pb-0">
            <Button
              onClick={onConfirmBooking}
              isLoading={isConfirming}
              disabled={isConfirming || !hasSelection || !formData}
              className="w-full py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Booking'}
            </Button>
            {onEditDate && (
              <Button
                onClick={onEditDate}
                variant="outline"
                disabled={isConfirming}
                className="w-full py-2 text-xs font-medium min-h-[40px]"
              >
                Edit Details
              </Button>
            )}
            <p className="text-[9px] text-center text-[var(--muted-foreground)] pb-0">
              Please review all details before confirming
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="lg:sticky lg:top-4 shadow-lg border-2 border-[var(--border)]" variant="elevated">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Ground Info */}
          <div className="pb-4 border-b border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Ground</p>
            <p className="text-base font-semibold text-[var(--foreground)]">{ground.name}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Rs. {ground.pricePerHour.toLocaleString()} per hour</p>
          </div>

          {/* Date Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Date</p>
              {selectedDate && onEditDate && (
                <button
                  onClick={onEditDate}
                  className="text-xs text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {selectedDate ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{formatDateShort(selectedDate)}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] italic">Not selected</p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Time</p>
              {hasSelection && onEditTime && (
                <button
                  onClick={onEditTime}
                  className="text-xs text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {hasSelection ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatTimeRange(selectedStartTime!, selectedEndTime!)}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">{hours} hour{hours !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] italic">Not selected</p>
            )}
          </div>

          {/* Customer Details (shown when formData is provided) */}
          {formData && (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Customer Details</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Name</p>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{formData.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Phone</p>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{formData.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Email</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] break-words">{formData.customerEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {hasSelection && (
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Hours</span>
                <span className="font-medium text-[var(--foreground)]">{hours} × Rs. {ground.pricePerHour.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                <span className="text-base font-semibold text-[var(--foreground)]">Total</span>
                <span className="text-xl font-bold text-[var(--primary-600)]">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Progress Indicator - Only show if not showing confirm button */}
          {!showConfirmButton && (
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${selectedDate ? 'text-[var(--primary-600)]' : 'text-[var(--muted-foreground)]'}`}>
                  {selectedDate ? '✓' : '○'} Date Selected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${hasSelection ? 'text-[var(--primary-600)]' : 'text-[var(--muted-foreground)]'}`}>
                  {hasSelection ? '✓' : '○'} Time Selected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${formData ? 'text-[var(--primary-600)]' : 'text-[var(--muted-foreground)]'}`}>
                    {formData ? '✓' : '○'} Details {formData ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Booking Button (Mobile) */}
          {showConfirmButton && onConfirmBooking && (
            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <Button
                onClick={onConfirmBooking}
                isLoading={isConfirming}
                disabled={isConfirming || !hasSelection || !formData}
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all min-h-[48px]"
              >
                {isConfirming ? 'Confirming...' : 'Confirm Booking'}
              </Button>
              {onEditDate && (
                <Button
                  onClick={onEditDate}
                  variant="outline"
                  disabled={isConfirming}
                  className="w-full py-2.5 text-sm font-medium min-h-[44px]"
                >
                  Edit Details
                </Button>
              )}
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                Please review all details before confirming
              </p>
          </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
