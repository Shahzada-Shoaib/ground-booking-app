'use client';

import { useEffect } from 'react';
import { BookingProvider, useBookingContext } from '@/context/BookingContext';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { Ground } from '@/lib/types';

function DashboardContent() {
  const { currentGround, setCurrentGround, refreshGrounds } = useBookingContext();

  const handleGroundUpdate = (ground: Ground) => {
    setCurrentGround(ground);
    refreshGrounds();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2">
                Ground Management
              </h1>
              <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                Manage your cricket ground bookings and settings
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <OwnerDashboard ground={currentGround} onGroundUpdate={handleGroundUpdate} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <BookingProvider>
      <DashboardContent />
    </BookingProvider>
  );
}
