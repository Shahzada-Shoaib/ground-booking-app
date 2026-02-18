'use client';

import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
    // Don't update effectiveMinDate based on selectedDate
    // Only use minDate prop or default to today
    setEffectiveMinDate(minDate || getTodayDate());
    
    // Set initial month/year from selectedDate
    if (selectedDate) {
      const { year, month } = parseDateString(selectedDate);
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  }, [minDate]); // Remove selectedDate from dependencies to prevent previous dates from being disabled

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
    const todayDateStr = getTodayDate();
    
    // Always allow today's date to be selected
    if (dateString === todayDateStr) {
      // Update calendar view to show today's month if not already visible
      const today = new Date();
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
      onDateChange(dateString);
      return;
    }
    
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

    // Always allow date selection, even if it's already selected
    // This allows users to re-select a date if needed
    // Update calendar view to show the selected date's month
    const { year, month } = parseDateString(dateString);
    setCurrentYear(year);
    setCurrentMonth(month);
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

  const handleTodayClick = () => {
    const today = new Date();
    const todayDateStr = getTodayDate();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onDateChange(todayDateStr);
  };

  const isDateSelectable = (day: number): boolean => {
    if (!mounted) return false; // Don't allow selection until mounted
    
    const dateString = dateToISOString(currentYear, currentMonth, day);
    
    // Always allow today's date to be selectable
    const todayDateStr = getTodayDate();
    if (dateString === todayDateStr) {
      return true;
    }
    
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
      <div className={`bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-md overflow-hidden w-full ${className}`}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-pulse text-[var(--muted-foreground)]">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden w-full ${className}`}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-[var(--border)] bg-[var(--muted)]">
        <button
          onClick={handlePreviousMonth}
          className="p-2 sm:p-2.5 rounded-lg hover:bg-[var(--primary-100)] active:bg-[var(--primary-200)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--foreground)] hover:text-[var(--primary-600)] transition-colors" />
        </button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] px-1 sm:px-2 text-center">
            {monthYearLabel}
          </h3>
          <button
            onClick={handleTodayClick}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)] active:bg-[var(--primary-800)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            aria-label="Go to today"
          >
            Today
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 sm:p-2.5 rounded-lg hover:bg-[var(--primary-100)] active:bg-[var(--primary-200)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--foreground)] hover:text-[var(--primary-600)] transition-colors" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-0.5 p-1 sm:p-1.5 bg-[var(--muted)] border-b border-[var(--border)]">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[9px] sm:text-[10px] font-semibold text-[var(--muted-foreground)] py-1 uppercase tracking-wide"
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
              disabled={!selectable && !today}
              className={`
                aspect-square flex items-center justify-center text-sm sm:text-base font-medium rounded-lg
                transition-all duration-200 ease-in-out min-h-[44px] sm:min-h-[48px]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1
                ${
                  selected
                    ? 'bg-[var(--primary-600)] text-white shadow-md transform scale-105 font-semibold z-10 relative'
                    : selectable || today
                    ? 'text-[var(--foreground)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-700)] hover:border hover:border-[var(--primary-300)] cursor-pointer active:scale-[0.95]'
                    : 'text-[var(--muted-foreground)] cursor-not-allowed bg-[var(--muted)]'
                }
                ${
                  today && !selected
                    ? 'border-2 border-[var(--primary-400)] bg-[var(--primary-50)] text-[var(--primary-700)] font-semibold'
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
