'use client';

import { BookingProvider } from '@/context/BookingContext';
import { BookingsHistory } from '@/components/BookingsHistory';

export default function BookingsPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-[var(--background)] pb-16 md:pb-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] shadow-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 break-words">
                  Booking History
                </h1>
                <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg">
                  View and manage all bookings across all grounds
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <BookingsHistory />
        </div>
      </div>
    </BookingProvider>
  );
}

