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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDateShort, formatTimeRange } from '@/lib/utils/dateUtils';
import { getTodayDate } from '@/lib/utils/dateUtils';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

function BookingPageContent() {
  const params = useParams();
  const router = useRouter();
  const groundId = params.id as string;

  const [ground, setGround] = useState<Ground | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<number | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<number | null>(null);
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
  } | null>(null);

  // Calculate current step
  const getCurrentStep = () => {
    if (selectedDate && selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0) {
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
    const loadGround = () => {
      try {
        const foundGround = BookingService.getGround(groundId);
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
    } else {
      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);
      // Smooth scroll to form
      setTimeout(() => {
        const formElement = document.getElementById('booking-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  const handleSubmit = async (formData: BookingFormData) => {
    if (!ground || !selectedStartTime || !selectedEndTime) return;

    const isAvailable = BookingService.isSlotAvailable(
      ground.id,
      selectedDate,
      selectedStartTime,
      selectedEndTime
    );

    if (!isAvailable) {
      showError('Sorry, this time slot is no longer available. Please select another time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = BookingService.createBooking(
        {
          ...formData,
          date: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
        },
        ground.id
      );

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
    } catch (error) {
      showError('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading ground details...</p>
        </div>
      </div>
    );
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ground Not Found</h2>
          <p className="text-gray-600 mb-6">The ground you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <BookingProgress currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
          <BookingHero ground={ground} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Booking Flow */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time Selection */}
            <div className="animate-slide-up">
              <BookingCalendar
              ground={ground}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              selectedStartTime={selectedStartTime}
              selectedEndTime={selectedEndTime}
              onTimeSelection={handleTimeSelection}
            />
            </div>

            {/* Booking Form */}
            {selectedStartTime !== null && selectedEndTime !== null && selectedStartTime >= 0 && selectedEndTime >= 0 && (
              <div id="booking-form" className="animate-fade-in">
                <BookingForm
                  onSubmit={handleSubmit}
                  isLoading={isSubmitting}
                  selectedStartTime={selectedStartTime}
                  selectedEndTime={selectedEndTime}
                  selectedDate={selectedDate}
                />
              </div>
            )}
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="animate-slide-in-right">
              <BookingSummary
                ground={ground}
                selectedDate={selectedDate}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
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
          <div className="text-center py-2 sm:py-4">
            {/* Success Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8">Your booking has been successfully created.</p>

            {/* Booking Details Card */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-green-200">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-600">Ground</span>
                  <span className="text-base font-bold text-gray-900">{ground.name}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-600">Customer</span>
                  <span className="text-base font-semibold text-gray-900">{bookingDetails.customerName}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-600">Date</span>
                  <span className="text-base font-semibold text-gray-900">{formatDateShort(bookingDetails.date)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-600">Time</span>
                  <span className="text-base font-semibold text-gray-900">{bookingDetails.time}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-600">Duration</span>
                  <span className="text-base font-semibold text-gray-900">{bookingDetails.hours} hour{bookingDetails.hours !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">Rs. {bookingDetails.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              A confirmation has been sent to your email. We look forward to seeing you!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  if (typeof window !== 'undefined') {
                    setSelectedDate(getTodayDate());
                    setSelectedStartTime(null);
                    setSelectedEndTime(null);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl min-h-[44px]"
              >
                Book Another Slot
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

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
