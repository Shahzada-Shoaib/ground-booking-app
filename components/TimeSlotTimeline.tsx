'use client';

import React, { useState } from 'react';
import { TimeSlot } from '@/lib/types';
import { formatTime } from '@/lib/utils/dateUtils';

interface TimeSlotTimelineProps {
  slots: TimeSlot[];
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  onTimeSelection: (startTime: number, endTime: number) => void;
  selectedSlots?: number[]; // Array of selected slot hours
  onSlotToggle?: (hour: number) => void; // Toggle individual slot selection
}

export const TimeSlotTimeline: React.FC<TimeSlotTimelineProps> = ({
  slots,
  selectedStartTime,
  selectedEndTime,
  onTimeSelection,
  selectedSlots = [],
  onSlotToggle,
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const handleSlotClick = (startHour: number, endHour: number) => {
    const slot = slots.find((s) => s.hour === startHour);
    
    // Prevent clicking on booked or unavailable slots
    if (!slot || !slot.available || slot.booked) {
      return;
    }
    
    // If using new multi-select system (onSlotToggle provided)
    if (onSlotToggle) {
      onSlotToggle(startHour);
      return;
    }
    
    // Legacy single-select behavior (for backward compatibility)
    // If no slot is selected, select this one
      if (selectedStartTime === null) {
        onTimeSelection(startHour, endHour);
    } 
    // If clicking the same slot, deselect it
    else if (selectedStartTime === startHour && selectedEndTime === endHour) {
        onTimeSelection(-1, -1);
    } 
    // If clicking a different slot, replace selection with the new slot (don't extend range)
    else {
        onTimeSelection(startHour, endHour);
      }
  };

  const isSlotSelected = (hour: number): boolean => {
    // If using new multi-select system
    if (selectedSlots && selectedSlots.length > 0) {
      return selectedSlots.includes(hour);
    }
    // Legacy single-select behavior
    if (selectedStartTime === null || selectedEndTime === null || selectedStartTime < 0 || selectedEndTime < 0) return false;
    return hour >= selectedStartTime && hour < selectedEndTime;
  };

  const isSlotInRange = (startHour: number, endHour: number): boolean => {
    // If using new multi-select system, check if this specific slot is selected
    if (selectedSlots && selectedSlots.length > 0) {
      return selectedSlots.includes(startHour);
    }
    // Legacy single-select behavior
    if (selectedStartTime === null || selectedEndTime === null || selectedStartTime < 0 || selectedEndTime < 0) return false;
    return startHour >= selectedStartTime && endHour <= selectedEndTime;
  };

  const isSlotStart = (hour: number): boolean => {
    if (selectedSlots && selectedSlots.length > 0) {
      const sorted = [...selectedSlots].sort((a, b) => a - b);
      return sorted[0] === hour;
    }
    return selectedStartTime === hour;
  };

  const isSlotEnd = (hour: number): boolean => {
    if (selectedSlots && selectedSlots.length > 0) {
      const sorted = [...selectedSlots].sort((a, b) => a - b);
      return sorted[sorted.length - 1] === hour;
    }
    return selectedEndTime === hour;
  };

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 font-medium">No time slots available</p>
        <p className="text-sm text-gray-400 mt-1">Please select a different date</p>
      </div>
    );
  }

  // Group slots into time ranges
  const timeRanges: Array<{ start: number; end: number; status: 'available' | 'booked'; slot: TimeSlot }> = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const endHour = slot.hour + 1;
    timeRanges.push({
      start: slot.hour,
      end: endHour,
      status: slot.booked || !slot.available ? 'booked' : 'available',
      slot,
    });
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--border)] flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[var(--gray-400)]"></div>
          <span className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[var(--danger)]"></div>
          <span className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[var(--primary-600)]"></div>
          <span className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">Selected</span>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
        {timeRanges.map((range) => {
          const isSelected = isSlotSelected(range.start);
          const isInRange = isSlotInRange(range.start, range.end);
          const isStart = isSlotStart(range.start);
          const isEnd = isSlotEnd(range.start);
          const isHovered = hoveredSlot === range.start;

          return (
            <button
              key={`${range.start}-${range.end}`}
              type="button"
              onClick={() => handleSlotClick(range.start, range.end)}
              onMouseEnter={() => setHoveredSlot(range.start)}
              onMouseLeave={() => setHoveredSlot(null)}
              disabled={range.status === 'booked'}
              className={`
                relative group p-3 sm:p-3.5 md:p-4 lg:p-5 rounded-xl border-2 transition-all duration-300
                transform hover:scale-105 active:scale-[0.95] min-h-[90px] sm:min-h-[100px] md:min-h-[110px]
                focus:outline-none focus:ring-4 focus:ring-[var(--primary-300)] focus:ring-offset-2
                ${
                  range.status === 'booked'
                    ? 'bg-[var(--danger)]/15 border-[var(--danger)]/30 cursor-not-allowed opacity-75'
                    : isSelected
                    ? 'bg-[var(--primary-600)] border-[var(--primary-600)] shadow-xl scale-105 text-white'
                    : isHovered
                    ? 'bg-gradient-to-br from-[var(--primary-100)] to-[var(--primary-200)] border-[var(--primary-400)] shadow-lg'
                    : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary-300)] hover:bg-[var(--primary-50)] cursor-pointer shadow-sm hover:shadow-md'
                }
              `}
              aria-label={`Time slot ${formatTime(range.start)} - ${formatTime(range.end)} - ${range.status === 'booked' ? 'booked' : 'available'}`}
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                {range.status === 'booked' ? (
                  <div className="w-6 h-6 bg-[var(--danger)] rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : isSelected ? (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-2 h-2 bg-[var(--gray-400)] rounded-full"></div>
                )}
              </div>

              {/* Time Display */}
              <div className="text-center w-full">
                <div className={`
                  text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1
                  ${range.status === 'booked' ? 'text-[var(--danger)]' : isSelected ? 'text-white' : 'text-[var(--foreground)]'}
                `}>
                  {formatTime(range.start).split(':')[0]}
                </div>
                <div className={`
                  text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-medium mb-1 sm:mb-1.5 md:mb-2
                  ${range.status === 'booked' ? 'text-[var(--danger)]' : isSelected ? 'text-white/80' : 'text-[var(--muted-foreground)]'}
                `}>
                  {formatTime(range.start).split(' ')[1]}
                </div>
                
                {/* Time Range */}
                <div className={`
                  text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md
                  ${
                    range.status === 'booked'
                      ? 'bg-[var(--danger)]/20 text-[var(--danger)]'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--muted)] text-[var(--foreground)]'
                  }
                `}>
                  {formatTime(range.start).split(':')[0]} - {formatTime(range.end).split(':')[0]}
                </div>

                {/* Status Text */}
                <div className={`
                  mt-1 sm:mt-1.5 md:mt-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-wide
                  ${range.status === 'booked' ? 'text-[var(--danger)]' : isSelected ? 'text-white' : 'text-[var(--muted-foreground)]'}
                `}>
                  {range.status === 'booked' ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                </div>
              </div>

              {/* Selection Indicators */}
              {isStart && (
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-[var(--primary-600)]"></div>
              )}
              {isEnd && (
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-[var(--primary-600)]"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Slots Summary */}
      {((selectedSlots && selectedSlots.length > 0) || (selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0)) && (
        <div className="mt-6 p-5 bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] rounded-xl shadow-lg border-2 border-[var(--primary-600)] animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                {selectedSlots && selectedSlots.length > 0 ? (
                  <>
                    <p className="text-white font-bold text-lg mb-1">
                      {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-white/80 text-sm">
                      {selectedSlots.sort((a, b) => a - b).map(h => formatTime(h).split(':')[0]).join(', ')}
                    </p>
                  </>
                ) : (
                  <>
                <p className="text-white font-bold text-lg mb-1">
                      {formatTime(selectedStartTime!)} - {formatTime(selectedEndTime!)}
                </p>
                <p className="text-white/80 text-sm">
                      {selectedEndTime! - selectedStartTime!} hour{selectedEndTime! - selectedStartTime! > 1 ? 's' : ''} selected
                </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (selectedSlots && selectedSlots.length > 0 && onSlotToggle) {
                  // Clear all selected slots
                  selectedSlots.forEach(hour => {
                    if (onSlotToggle) onSlotToggle(hour);
                  });
                } else {
                  onTimeSelection(-1, -1);
                }
              }}
              className="ml-2 sm:ml-4 p-2 sm:p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label="Clear selection"
              title="Clear selection"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-5 text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          💡 <span className="font-medium">Tip:</span> {selectedSlots && selectedSlots.length > 0 ? 'Click on slots to select multiple. Click again to deselect.' : 'Click on any available time slot to select. Click again to deselect.'}
        </p>
      </div>
    </div>
  );
};
