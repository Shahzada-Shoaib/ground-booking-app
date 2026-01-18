'use client';

import React, { useState } from 'react';
import { TimeSlot } from '@/lib/types';
import { formatTime } from '@/lib/utils/dateUtils';

interface TimeSlotTimelineProps {
  slots: TimeSlot[];
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  onTimeSelection: (startTime: number, endTime: number) => void;
}

export const TimeSlotTimeline: React.FC<TimeSlotTimelineProps> = ({
  slots,
  selectedStartTime,
  selectedEndTime,
  onTimeSelection,
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const handleSlotClick = (startHour: number, endHour: number) => {
    const slot = slots.find((s) => s.hour === startHour);
    if (slot && slot.available && !slot.booked) {
      if (selectedStartTime === null) {
        onTimeSelection(startHour, endHour);
      } else if (selectedStartTime === startHour && selectedEndTime === endHour) {
        onTimeSelection(-1, -1);
      } else if (startHour > selectedStartTime) {
        let allAvailable = true;
        for (let h = selectedStartTime; h < endHour; h++) {
          const slot = slots.find((s) => s.hour === h);
          if (!slot || !slot.available || slot.booked) {
            allAvailable = false;
            break;
          }
        }
        if (allAvailable) {
          onTimeSelection(selectedStartTime, endHour);
        }
      } else {
        onTimeSelection(startHour, endHour);
      }
    }
  };

  const isSlotInRange = (startHour: number, endHour: number): boolean => {
    if (selectedStartTime === null || selectedEndTime === null || selectedStartTime < 0 || selectedEndTime < 0) return false;
    return startHour >= selectedStartTime && endHour <= selectedEndTime;
  };

  const isSlotStart = (hour: number): boolean => {
    return selectedStartTime === hour;
  };

  const isSlotEnd = (hour: number): boolean => {
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
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-400"></div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Selected</span>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {timeRanges.map((range) => {
          const isSelected = isSlotInRange(range.start, range.end);
          const isStart = isSlotStart(range.start);
          const isEnd = isSlotEnd(range.end);
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
                relative group p-3 sm:p-4 lg:p-5 rounded-xl border-2 transition-all duration-300
                transform hover:scale-105 active:scale-95 min-h-[80px] sm:min-h-[100px]
                focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2
                ${
                  range.status === 'booked'
                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 cursor-not-allowed opacity-75'
                    : isSelected
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 shadow-xl scale-105'
                    : isHovered
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer shadow-sm hover:shadow-md'
                }
              `}
              aria-label={`Time slot ${formatTime(range.start)} - ${formatTime(range.end)} - ${range.status === 'booked' ? 'booked' : 'available'}`}
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                {range.status === 'booked' ? (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : isSelected ? (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>

              {/* Time Display */}
              <div className="text-center">
                <div className={`
                  text-xl sm:text-2xl lg:text-3xl font-bold mb-1
                  ${range.status === 'booked' ? 'text-red-700' : isSelected ? 'text-white' : 'text-gray-900'}
                `}>
                  {formatTime(range.start).split(':')[0]}
                </div>
                <div className={`
                  text-[10px] sm:text-xs lg:text-sm font-medium mb-1 sm:mb-2
                  ${range.status === 'booked' ? 'text-red-600' : isSelected ? 'text-blue-100' : 'text-gray-500'}
                `}>
                  {formatTime(range.start).split(' ')[1]}
                </div>
                
                {/* Time Range */}
                <div className={`
                  text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md
                  ${
                    range.status === 'booked'
                      ? 'bg-red-200 text-red-800'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-green-100 text-green-700'
                  }
                `}>
                  {formatTime(range.start).split(':')[0]} - {formatTime(range.end).split(':')[0]}
                </div>

                {/* Status Text */}
                <div className={`
                  mt-1 sm:mt-2 text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wide
                  ${range.status === 'booked' ? 'text-red-600' : isSelected ? 'text-white' : 'text-gray-400'}
                `}>
                  {range.status === 'booked' ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                </div>
              </div>

              {/* Selection Indicators */}
              {isStart && (
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-blue-600"></div>
              )}
              {isEnd && (
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-blue-600"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Range Summary */}
      {selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0 && (
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg border-2 border-blue-700 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1">
                  {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
                </p>
                <p className="text-blue-100 text-sm">
                  {selectedEndTime - selectedStartTime} hour{selectedEndTime - selectedStartTime > 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => onTimeSelection(-1, -1)}
              className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              aria-label="Clear selection"
              title="Clear selection"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-5 text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          💡 <span className="font-medium">Tip:</span> Click on any available time slot to select. Click again to extend your selection.
        </p>
      </div>
    </div>
  );
};
