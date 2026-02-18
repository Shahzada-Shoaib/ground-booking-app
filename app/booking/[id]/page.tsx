'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingProvider } from '@/context/BookingContext';
import { BookingService } from '@/lib/services/bookingService';
import { Ground, BookingFormData } from '@/lib/types';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingForm } from '@/components/BookingForm';
import { BookingHero } from '@/components/BookingHero';
import { BookingProgress } from '@/components/BookingProgress';
import { BookingSummary } from '@/components/BookingSummary';
import { MapSection } from '@/components/MapSection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDateShort, formatTimeRange, formatTime } from '@/lib/utils/dateUtils';
import { getTodayDate } from '@/lib/utils/dateUtils';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

function BookingPageContent() {
  const params = useParams();
  const router = useRouter();
  const groundId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [ground, setGround] = useState<Ground | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<number | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, number[]>>({}); // Date-wise selected slot hours: { "2026-02-19": [9, 10, 11], "2026-02-20": [14, 15] }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { showError, toasts, removeToast } = useToast();
  const [bookingDetails, setBookingDetails] = useState<{
    bookingId: string;
    customerName: string;
    date: string;
    time: string;
    hours: number;
    totalPrice: number;
    datesWithSlots?: Array<{ date: string; slots: number[] }>; // For multi-date bookings
  } | null>(null);
  
  // Mobile two-step flow states
  const [pendingFormData, setPendingFormData] = useState<BookingFormData | null>(null);
  const [showSummaryForConfirmation, setShowSummaryForConfirmation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate current step
  const getCurrentStep = () => {
    // Calculate total slots across all dates
    const totalSelectedSlots = Object.values(selectedSlots).reduce((sum, slots) => sum + slots.length, 0);
    if (selectedDate && ((totalSelectedSlots > 0) || (selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0))) {
      return 3; // Form step
    } else if (selectedDate) {
      return 2; // Time selection step
    }
    return 1; // Date selection step
  };

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getTodayDate());
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadGround = async () => {
      try {
        const foundGround = await BookingService.getGround(groundId);
        if (!foundGround) {
          router.push('/');
          return;
        }
        setGround(foundGround);
      } catch (error) {
        console.error('Error loading ground:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (groundId) {
      loadGround();
    }
  }, [groundId, router]);

  const handleTimeSelection = (startTime: number, endTime: number) => {
    if (startTime < 0 || endTime < 0) {
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      // Clear slots for current date only
      setSelectedSlots(prev => {
        const newState = { ...prev };
        delete newState[selectedDate];
        return newState;
      });
    } else {
      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);
      // Also update selectedSlots for multi-select (date-wise)
      setSelectedSlots(prev => ({ ...prev, [selectedDate]: [startTime] }));
      // Smooth scroll to form
      setTimeout(() => {
        const formElement = document.getElementById('booking-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleSlotToggle = (hour: number) => {
    setSelectedSlots(prev => {
      const currentDateSlots = prev[selectedDate] || [];
      const isSelected = currentDateSlots.includes(hour);
      let newSlots: number[];
      
      if (isSelected) {
        // Remove slot
        newSlots = currentDateSlots.filter(h => h !== hour);
      } else {
        // Add slot
        newSlots = [...currentDateSlots, hour].sort((a, b) => a - b);
      }
      
      // Update selectedStartTime and selectedEndTime based on selected slots for current date
      if (newSlots.length === 0) {
        setSelectedStartTime(null);
        setSelectedEndTime(null);
      } else {
        const minSlot = newSlots[0];
        const maxSlot = newSlots[newSlots.length - 1];
        
        // Check if this is an overnight booking (ground is overnight and we're selecting late hours)
        const isOvernightGround = ground && ground.operatingHours.end < ground.operatingHours.start;
        
        if (isOvernightGround && maxSlot >= 23) {
          // User is selecting slots that go into the next day
          // For overnight bookings, endTime will be < startTime
          // We'll handle this in the booking creation
          setSelectedStartTime(minSlot);
          // For overnight, endTime should be the last selected hour + 1, but if it's from next day, it will be < startTime
          // We'll calculate this properly when creating the booking
          setSelectedEndTime(maxSlot + 1);
        } else {
          setSelectedStartTime(minSlot);
          setSelectedEndTime(maxSlot + 1);
        }
      }
      
      // Smooth scroll to form if slots are selected
      if (newSlots.length > 0) {
        setTimeout(() => {
          const formElement = document.getElementById('booking-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
      
      // Return updated state with current date's slots
      return { ...prev, [selectedDate]: newSlots };
    });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // Don't clear slots - they are stored per date and should persist
    // Only reset time selection for the new date
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  // Handler for mobile: just validates and shows summary
  const handleFormSubmit = async (formData: BookingFormData) => {
    if (!ground) return;
    
    const currentDateSlots = selectedSlots[selectedDate] || [];
    
    // Check if we have selected slots for current date
    if (currentDateSlots.length > 0) {
      // Check availability for all selected slots
      for (const slotHour of currentDateSlots) {
        const isAvailable = await BookingService.isSlotAvailable(
          ground.id,
          selectedDate,
          slotHour,
          slotHour + 1
        );
        if (!isAvailable) {
          showError(`Sorry, the ${formatTime(slotHour)} slot is no longer available. Please select another time.`);
          return;
        }
      }
    } else if (!selectedStartTime || !selectedEndTime) {
      return;
    } else {
      // Check availability for single range
      const isAvailable = await BookingService.isSlotAvailable(
        ground.id,
        selectedDate,
        selectedStartTime,
        selectedEndTime
      );
      if (!isAvailable) {
        showError('Sorry, this time slot is no longer available. Please select another time.');
        return;
      }
    }

    // Store form data and show summary for confirmation
    setPendingFormData(formData);
    setShowSummaryForConfirmation(true);
    
    // Scroll to summary
    setTimeout(() => {
      const summaryElement = document.getElementById('booking-summary-confirm');
      if (summaryElement) {
        summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handler for desktop: directly creates booking
  const handleSubmit = async (formData: BookingFormData) => {
    if (!ground) return;

    setIsSubmitting(true);
    try {
      // Get all dates with selected slots
      const datesWithSlots = Object.entries(selectedSlots).filter(([_, slots]) => slots.length > 0);
      
      // If we have slots selected for any date, create bookings for all dates
      if (datesWithSlots.length > 0) {
        const allBookings = [];
        let totalPrice = 0;
        let totalHours = 0;
        let totalSlots = 0;

        // Loop through all dates with selected slots
        for (const [date, slots] of datesWithSlots) {
          for (const slotHour of slots) {
            // Check availability
            const isAvailable = await BookingService.isSlotAvailable(
              ground.id,
              date,
              slotHour,
              slotHour + 1
            );

            if (!isAvailable) {
              showError(`Sorry, the ${formatTime(slotHour)} slot on ${formatDateShort(date)} is no longer available. Please select another time.`);
              setIsSubmitting(false);
              return;
            }

            // Create booking for this slot
            const bookingResult = await BookingService.createBooking(
              {
                ...formData,
                date: date,
                startTime: slotHour,
                endTime: slotHour + 1,
              },
              ground.id
            );

            const booking = Array.isArray(bookingResult) ? bookingResult[0] : bookingResult;
            allBookings.push(booking);
            totalPrice += booking.totalPrice;
            totalHours += booking.hours;
            totalSlots += 1;
          }
        }

        // Use the first booking for display, but show combined info
        setBookingDetails({
          bookingId: allBookings[0].id,
          customerName: allBookings[0].customerName,
          date: datesWithSlots.length === 1 ? allBookings[0].date : `${datesWithSlots.length} dates`,
          time: `${totalSlots} slot${totalSlots > 1 ? 's' : ''}`,
          hours: totalHours,
          totalPrice: totalPrice,
          datesWithSlots: datesWithSlots.map(([date, slots]) => ({ date, slots })),
        });

        setShowSuccessModal(true);
        // Clear all selected slots after successful booking
        setSelectedSlots({});
        setSelectedStartTime(null);
        setSelectedEndTime(null);
      } else if (selectedStartTime !== null && selectedEndTime !== null) {
        // Single range booking (legacy behavior)
        // Check if this is an overnight booking
        const isOvernightGround = ground.operatingHours.end < ground.operatingHours.start;
        let finalStartTime = selectedStartTime;
        let finalEndTime = selectedEndTime;
        
        // If ground is overnight and endTime would be >= 24, it's an overnight booking
        if (isOvernightGround && selectedEndTime > 23) {
          // This is an overnight booking
          // endTime should be the hour on the next day (0-23), so we need to calculate it
          // If selectedEndTime is 24, it means 0 (midnight next day)
          // If selectedEndTime is 25, it means 1 AM next day, etc.
          finalEndTime = selectedEndTime - 24;
        }
        
        const isAvailable = await BookingService.isSlotAvailable(
          ground.id,
          selectedDate,
          finalStartTime,
          finalEndTime
        );

        if (!isAvailable) {
          showError('Sorry, this time slot is no longer available. Please select another time.');
          setIsSubmitting(false);
          return;
        }

        const bookingResult = await BookingService.createBooking(
          {
            ...formData,
            date: selectedDate,
            startTime: finalStartTime,
            endTime: finalEndTime,
          },
          ground.id
        );
        const booking = Array.isArray(bookingResult) ? bookingResult[0] : bookingResult;

        setBookingDetails({
          bookingId: booking.id,
          customerName: booking.customerName,
          date: booking.date,
          time: formatTimeRange(booking.startTime, booking.endTime),
          hours: booking.hours,
          totalPrice: booking.totalPrice,
        });

        setShowSuccessModal(true);
        setSelectedStartTime(null);
        setSelectedEndTime(null);
      }
    } catch (error) {
      showError('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for mobile: actually creates booking after confirmation
  const handleConfirmBooking = async () => {
    if (!ground || !pendingFormData) return;

    setIsSubmitting(true);
    try {
      // Get all dates with selected slots
      const datesWithSlots = Object.entries(selectedSlots).filter(([_, slots]) => slots.length > 0);
      
      // If we have slots selected for any date, create bookings for all dates
      if (datesWithSlots.length > 0) {
        const allBookings = [];
        let totalPrice = 0;
        let totalHours = 0;
        let totalSlots = 0;

        // Loop through all dates with selected slots
        for (const [date, slots] of datesWithSlots) {
          for (const slotHour of slots) {
            // Check availability
            const isAvailable = await BookingService.isSlotAvailable(
              ground.id,
              date,
              slotHour,
              slotHour + 1
            );

            if (!isAvailable) {
              showError(`Sorry, the ${formatTime(slotHour)} slot on ${formatDateShort(date)} is no longer available. Please select another time.`);
              setShowSummaryForConfirmation(false);
              setPendingFormData(null);
              setIsSubmitting(false);
              return;
            }

            // Create booking for this slot
            const bookingResult = await BookingService.createBooking(
              {
                ...pendingFormData,
                date: date,
                startTime: slotHour,
                endTime: slotHour + 1,
              },
              ground.id
            );

            const booking = Array.isArray(bookingResult) ? bookingResult[0] : bookingResult;
            allBookings.push(booking);
            totalPrice += booking.totalPrice;
            totalHours += booking.hours;
            totalSlots += 1;
          }
        }

        // Use the first booking for display, but show combined info
        setBookingDetails({
          bookingId: allBookings[0].id,
          customerName: allBookings[0].customerName,
          date: datesWithSlots.length === 1 ? allBookings[0].date : `${datesWithSlots.length} dates`,
          time: `${totalSlots} slot${totalSlots > 1 ? 's' : ''}`,
          hours: totalHours,
          totalPrice: totalPrice,
          datesWithSlots: datesWithSlots.map(([date, slots]) => ({ date, slots })),
        });

        setShowSuccessModal(true);
        setShowSummaryForConfirmation(false);
        setPendingFormData(null);
        // Clear all selected slots after successful booking
        setSelectedSlots({});
        setSelectedStartTime(null);
        setSelectedEndTime(null);
      } else if (selectedStartTime !== null && selectedEndTime !== null) {
        // Single range booking (legacy behavior)
        const isAvailable = await BookingService.isSlotAvailable(
          ground.id,
          selectedDate,
          selectedStartTime,
          selectedEndTime
        );

        if (!isAvailable) {
          showError('Sorry, this time slot is no longer available. Please select another time.');
          setShowSummaryForConfirmation(false);
          setPendingFormData(null);
          setIsSubmitting(false);
          return;
        }

        const bookingResult = await BookingService.createBooking(
          {
            ...pendingFormData,
            date: selectedDate,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
          },
          ground.id
        );
        const booking = Array.isArray(bookingResult) ? bookingResult[0] : bookingResult;

        setBookingDetails({
          bookingId: booking.id,
          customerName: booking.customerName,
          date: booking.date,
          time: formatTimeRange(booking.startTime, booking.endTime),
          hours: booking.hours,
          totalPrice: booking.totalPrice,
        });

        setShowSuccessModal(true);
        setShowSummaryForConfirmation(false);
        setPendingFormData(null);
        setSelectedStartTime(null);
        setSelectedEndTime(null);
      }
    } catch (error) {
      showError('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[var(--muted-foreground)]">Loading ground details...</p>
        </div>
      </div>
    );
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="bg-[var(--card)] rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-[var(--danger)]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Ground Not Found</h2>
          <p className="text-[var(--muted-foreground)] mb-6">The ground you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
                className="px-6 py-3 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--primary-700)] transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header with Progress */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-40 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          <BookingProgress currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 animate-fade-in">
          <BookingHero ground={ground} />
        </div>

        {/* Map Section */}
        {ground.location?.mapLink && (
          <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 animate-fade-in">
            <MapSection ground={ground} />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Main Booking Flow */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Date & Time Selection */}
            <div className="animate-slide-up">
              <BookingCalendar
              ground={ground}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              selectedStartTime={selectedStartTime}
              selectedEndTime={selectedEndTime}
              onTimeSelection={handleTimeSelection}
              selectedSlots={selectedSlots[selectedDate] || []}
              allSelectedSlots={selectedSlots}
              onSlotToggle={handleSlotToggle}
            />
            </div>

            {/* Booking Form */}
            {(() => {
              // Calculate total slots across all dates
              const totalSelectedSlots = Object.values(selectedSlots).reduce((sum, slots) => sum + slots.length, 0);
              const hasAnySlots = totalSelectedSlots > 0 || (selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0);
              
              return hasAnySlots && !showSummaryForConfirmation && (
                <div id="booking-form" className="animate-fade-in">
                  <BookingForm
                    onSubmit={handleSubmit}
                    onFormSubmit={handleFormSubmit}
                    isLoading={isSubmitting}
                    selectedStartTime={selectedStartTime}
                    selectedEndTime={selectedEndTime}
                    selectedDate={selectedDate}
                  />
                </div>
              );
            })()}

            {/* Booking Summary - Regular view (Mobile) - Hidden on mobile, only show on desktop */}
          </div>

          {/* Right Column - Sticky Summary (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="animate-slide-in-right">
              <BookingSummary
                ground={ground}
                selectedDate={selectedDate}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                selectedSlots={selectedSlots}
                onEditDate={() => {
                  const calendarElement = document.getElementById('date-calendar');
                  if (calendarElement) {
                    calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                onEditTime={() => {
                  const timeElement = document.getElementById('time-selection');
                  if (timeElement) {
                    timeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
        size="lg"
      >
        {bookingDetails && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="text-center py-2 sm:py-3 md:py-4">
                {/* Success Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[var(--success)]/15 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">Booking Confirmed!</h2>
                <p className="text-xs sm:text-sm md:text-base text-[var(--muted-foreground)] mb-3 sm:mb-4 md:mb-6">Your booking has been successfully created.</p>

                {/* Booking Details Card */}
                <div className="bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/20 rounded-xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 border-2 border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                  <div className="space-y-3 sm:space-y-4 text-left">
                    <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                      <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)]">Ground</span>
                      <span className="text-sm sm:text-base font-bold text-[var(--primary-800)] break-words ml-2 text-right">{ground.name}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                      <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)]">Customer</span>
                      <span className="text-sm sm:text-base font-semibold text-[var(--primary-800)] break-words ml-2 text-right">{bookingDetails.customerName}</span>
                    </div>
                    {bookingDetails.datesWithSlots && bookingDetails.datesWithSlots.length > 1 ? (
                      <div className="pb-2 sm:pb-3 border-b border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                        <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] block mb-2">Dates & Times</span>
                        <div className="space-y-2.5">
                          {bookingDetails.datesWithSlots.map(({ date, slots }) => (
                            <div key={date} className="bg-white/70 dark:bg-[var(--gray-800)]/70 rounded-lg p-2.5 space-y-1.5 border border-[var(--primary-200)]">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-[var(--primary-200)] rounded flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3.5 h-3.5 text-[var(--primary-700)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-sm font-semibold text-[var(--primary-800)]">{formatDateShort(date)}</p>
                              </div>
                              <div className="pl-8 space-y-1">
                                {slots.map((slotHour) => (
                                  <div key={slotHour} className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-[var(--primary-200)] rounded flex items-center justify-center flex-shrink-0">
                                      <svg className="w-2.5 h-2.5 text-[var(--primary-700)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <p className="text-xs font-medium text-[var(--primary-800)]">
                                      {formatTime(slotHour)} - {formatTime(slotHour + 1)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                          <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)]">Date</span>
                          <span className="text-sm sm:text-base font-semibold text-[var(--primary-800)]">{formatDateShort(bookingDetails.date)}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                          <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)]">Time</span>
                          <span className="text-sm sm:text-base font-semibold text-[var(--primary-800)]">{bookingDetails.time}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                      <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)]">Duration</span>
                      <span className="text-sm sm:text-base font-semibold text-[var(--primary-800)]">{bookingDetails.hours} hour{bookingDetails.hours !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base sm:text-lg font-semibold text-[var(--primary-800)]">Total Amount</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--primary-700)]">Rs. {bookingDetails.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4 px-2">
                  A confirmation has been sent to your email. We look forward to seeing you!
                </p>
              </div>
            </div>

            {/* Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 pt-3 sm:pt-4 pb-2 sm:pb-4 border-t border-[var(--border)] mt-auto">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (typeof window !== 'undefined') {
                      setSelectedDate(getTodayDate());
                      setSelectedStartTime(null);
                      setSelectedEndTime(null);
                    }
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--primary-700)] transition-colors font-medium shadow-lg hover:shadow-xl min-h-[44px] text-sm sm:text-base"
                >
                  Book Another Slot
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--gray-100)] text-[var(--gray-700)] rounded-lg hover:bg-[var(--gray-200)] transition-colors font-medium min-h-[44px] dark:bg-[var(--gray-800)] dark:text-[var(--gray-100)] dark:hover:bg-[var(--gray-700)] text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking Summary Modal for Confirmation (Mobile) */}
      {showSummaryForConfirmation && pendingFormData && (
        <Modal
          isOpen={showSummaryForConfirmation}
          onClose={() => {
            setShowSummaryForConfirmation(false);
            setPendingFormData(null);
          }}
          title="Review Your Booking"
          size="xl"
          showCloseButton={true}
        >
          <BookingSummary
            ground={ground}
            selectedDate={selectedDate}
            selectedStartTime={selectedStartTime}
            selectedEndTime={selectedEndTime}
            selectedSlots={selectedSlots}
            formData={pendingFormData}
            showConfirmButton={true}
            onConfirmBooking={handleConfirmBooking}
            isConfirming={isSubmitting}
            onEditDate={() => {
              setShowSummaryForConfirmation(false);
              setPendingFormData(null);
              setTimeout(() => {
                const calendarElement = document.getElementById('date-calendar');
                if (calendarElement) {
                  calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }}
            onEditTime={() => {
              setShowSummaryForConfirmation(false);
              setPendingFormData(null);
              setTimeout(() => {
                const timeElement = document.getElementById('time-selection');
                if (timeElement) {
                  timeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }}
          />
        </Modal>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function BookingPage() {
  return (
    <BookingProvider>
      <BookingPageContent />
    </BookingProvider>
  );
}
