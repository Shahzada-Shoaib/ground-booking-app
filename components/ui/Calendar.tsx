'use client';

import React, { useState, useEffect } from 'react';
import {
  formatMonthYear,
  getCalendarDays,
  dateToISOString,
  isToday,
  isPastDate,
  isSameDate,
  getNextMonth,
  getPreviousMonth,
  parseDateString,
  getTodayDate,
} from '@/lib/utils/dateUtils';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string; // Minimum selectable date (default: today)
  maxDate?: string; // Maximum selectable date (optional)
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [effectiveMinDate, setEffectiveMinDate] = useState<string>('');
  
  const [currentYear, setCurrentYear] = useState<number>(() => {
    // Always use a consistent default for SSR
    const today = new Date();
    return today.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    // Always use a consistent default for SSR
    const today = new Date();
    return today.getMonth();
  });

  // Set minDate only on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setEffectiveMinDate(minDate || getTodayDate());
    
    // Set initial month/year from selectedDate
    if (selectedDate) {
      const { year, month } = parseDateString(selectedDate);
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  }, [minDate, selectedDate]);

  // Update current month/year when selectedDate changes externally
  useEffect(() => {
    if (selectedDate && mounted) {
      const { year, month } = parseDateString(selectedDate);
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  }, [selectedDate, mounted]);

  const days = getCalendarDays(currentYear, currentMonth);
  const monthYearLabel = formatMonthYear(currentYear, currentMonth);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day: number) => {
    const dateString = dateToISOString(currentYear, currentMonth, day);
    
    // Check if date is in the past
    if (isPastDate(dateString)) {
      return;
    }

    // Check min date
    if (effectiveMinDate && dateString < effectiveMinDate) {
      return;
    }

    // Check max date
    if (maxDate && dateString > maxDate) {
      return;
    }

    onDateChange(dateString);
  };

  const handlePreviousMonth = () => {
    const { year, month } = getPreviousMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleNextMonth = () => {
    const { year, month } = getNextMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const isDateSelectable = (day: number): boolean => {
    if (!mounted) return false; // Don't allow selection until mounted
    
    const dateString = dateToISOString(currentYear, currentMonth, day);
    
    if (isPastDate(dateString)) {
      return false;
    }

    if (effectiveMinDate && dateString < effectiveMinDate) {
      return false;
    }

    if (maxDate && dateString > maxDate) {
      return false;
    }

    return true;
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate || !mounted) return false;
    const dateString = dateToISOString(currentYear, currentMonth, day);
    return isSameDate(dateString, selectedDate);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden w-full ${className}`}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-full ${className}`}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <button
          onClick={handlePreviousMonth}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-green-100 active:bg-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          aria-label="Previous month"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 hover:text-green-700 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 className="text-sm sm:text-base font-semibold text-gray-900 px-1 sm:px-2 text-center">
          {monthYearLabel}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-green-100 active:bg-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          aria-label="Next month"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 hover:text-green-700 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-0.5 p-1 sm:p-1.5 bg-gray-50 border-b border-gray-100">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 py-1 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 p-1 sm:p-1.5 min-h-[280px] sm:min-h-[300px]">
        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square"
              />
            );
          }

          const selectable = isDateSelectable(day);
          const selected = isDateSelected(day);
          const today = isToday(currentYear, currentMonth, day);

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDateClick(day)}
              disabled={!selectable}
              className={`
                aspect-square flex items-center justify-center text-xs sm:text-sm font-medium rounded
                transition-all duration-200 ease-in-out min-h-[36px] sm:min-h-[40px]
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                ${
                  selected
                    ? 'bg-green-600 text-white shadow-md transform scale-105 font-semibold z-10 relative'
                    : selectable
                    ? 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border hover:border-green-300 cursor-pointer active:scale-95'
                    : 'text-gray-300 cursor-not-allowed bg-gray-50'
                }
                ${
                  today && !selected
                    ? 'border border-green-400 bg-green-50 text-green-700 font-semibold'
                    : ''
                }
                ${!selectable && !today ? 'opacity-50' : ''}
              `}
              aria-label={`Select ${day} ${monthYearLabel}`}
              aria-selected={selected}
              aria-disabled={!selectable}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
