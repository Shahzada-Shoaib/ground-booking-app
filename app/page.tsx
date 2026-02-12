'use client';

import { BookingProvider } from '@/context/BookingContext';
import { AdminOverview } from '@/components/AdminOverview';

export default function Home() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-[var(--background)] pb-16 md:pb-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] shadow-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 break-words">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg">
                  Overview of all grounds, bookings, and revenue
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <AdminOverview />
        </div>
      </div>
    </BookingProvider>
  );
}
