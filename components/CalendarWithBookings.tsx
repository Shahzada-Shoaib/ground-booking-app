'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/lib/types';
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

interface CalendarWithBookingsProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  bookings: Booking[];
  className?: string;
}

export const CalendarWithBookings: React.FC<CalendarWithBookingsProps> = ({
  selectedDate,
  onDateChange,
  bookings,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [effectiveMinDate, setEffectiveMinDate] = useState<string>('');
  
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const today = new Date();
    return today.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const today = new Date();
    return today.getMonth();
  });

  useEffect(() => {
    setMounted(true);
    setEffectiveMinDate(getTodayDate());
    
    if (selectedDate) {
      const { year, month } = parseDateString(selectedDate);
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && mounted) {
      const { year, month } = parseDateString(selectedDate);
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  }, [selectedDate, mounted]);

  const getBookingsCount = (date: string): number => {
    return bookings.filter(b => b.date === date).length;
  };

  const days = getCalendarDays(currentYear, currentMonth);
  const monthYearLabel = formatMonthYear(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day: number) => {
    const dateString = dateToISOString(currentYear, currentMonth, day);
    if (isPastDate(dateString)) return;
    if (effectiveMinDate && dateString < effectiveMinDate) return;
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
    if (!mounted) return false;
    const dateString = dateToISOString(currentYear, currentMonth, day);
    if (isPastDate(dateString)) return false;
    if (effectiveMinDate && dateString < effectiveMinDate) return false;
    return true;
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate || !mounted) return false;
    const dateString = dateToISOString(currentYear, currentMonth, day);
    return isSameDate(dateString, selectedDate);
  };

  if (!mounted) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden w-full ${className}`}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden w-full ${className}`}>
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <button
          onClick={handlePreviousMonth}
          className="p-2 sm:p-2 rounded-lg hover:bg-green-100 active:bg-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          className="p-2 sm:p-2 rounded-lg hover:bg-green-100 active:bg-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          const dateString = dateToISOString(currentYear, currentMonth, day);
          const bookingsCount = getBookingsCount(dateString);

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDateClick(day)}
              disabled={!selectable}
              className={`
                aspect-square flex flex-col items-center justify-center text-xs sm:text-sm font-medium rounded relative min-h-[36px] sm:min-h-[40px]
                transition-all duration-200 ease-in-out
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
              <span>{day}</span>
              {bookingsCount > 0 && (
                <div className={`
                  absolute bottom-1 w-1.5 h-1.5 rounded-full
                  ${selected ? 'bg-white' : 'bg-green-600'}
                `} />
              )}
              {bookingsCount > 1 && (
                <div className={`
                  absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] font-bold
                  ${selected ? 'text-white' : 'text-green-600'}
                `}>
                  {bookingsCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
