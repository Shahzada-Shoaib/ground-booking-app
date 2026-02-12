import React from 'react';
import { TimeSlot as TimeSlotType } from '@/lib/types';
import { formatTime } from '@/lib/utils/dateUtils';

interface TimeSlotProps {
  slot: TimeSlotType;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  slot,
  isSelected = false,
  onClick,
  disabled = false,
}) => {
  const getSlotStyles = () => {
    if (disabled || slot.booked) {
      return 'bg-[var(--gray-200)] text-[var(--gray-500)] cursor-not-allowed border-[var(--gray-300)] dark:bg-[var(--gray-800)] dark:text-[var(--gray-500)] dark:border-[var(--gray-700)]';
    }
    if (isSelected) {
      return 'bg-[var(--primary-600)] text-white border-[var(--primary-600)] shadow-md transform scale-105';
    }
    if (slot.available) {
      return 'bg-white text-[var(--primary-600)] border-[var(--border)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-700)] hover:border-[var(--primary-300)] cursor-pointer';
    }
    return 'bg-[var(--gray-200)] text-[var(--gray-500)] cursor-not-allowed border-[var(--gray-300)] dark:bg-[var(--gray-800)] dark:text-[var(--gray-500)] dark:border-[var(--gray-700)]';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || slot.booked || !slot.available}
      className={`
        px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 active:scale-[0.97]
        ${getSlotStyles()}
        ${!disabled && !slot.booked && slot.available ? 'hover:shadow-md' : ''}
      `}
      aria-label={`Time slot ${formatTime(slot.hour)} - ${slot.available ? 'available' : 'booked'}`}
    >
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold">{formatTime(slot.hour)}</span>
        {slot.booked && (
          <span className="text-xs mt-1 opacity-75">Booked</span>
        )}
      </div>
    </button>
  );
};
