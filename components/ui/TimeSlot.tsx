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
      return 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
    }
    if (isSelected) {
      return 'bg-green-600 text-white border-green-700 shadow-md transform scale-105';
    }
    if (slot.available) {
      return 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400 cursor-pointer';
    }
    return 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || slot.booked || !slot.available}
      className={`
        px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
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
