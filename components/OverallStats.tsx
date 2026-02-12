'use client';

import React, { useEffect, useState } from 'react';
import { useBookingContext } from '@/context/BookingContext';
import { Card, CardContent } from './ui/Card';
import { BookingService } from '@/lib/services/bookingService';

export const OverallStats: React.FC = () => {
  const { grounds, refreshGrounds } = useBookingContext();
  const [stats, setStats] = useState({
    totalGrounds: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    activeGrounds: 0,
  });

  useEffect(() => {
    const updateStats = async () => {
      try {
        const [totalBookings, totalRevenue, todayBookings, activeGrounds] = await Promise.all([
          BookingService.getTotalBookings(),
          BookingService.getTotalRevenue(),
          BookingService.getTodayTotalBookings(),
          BookingService.getActiveGroundsCount(),
        ]);

        setStats({
          totalGrounds: grounds.length,
          totalBookings,
          totalRevenue,
          todayBookings,
          activeGrounds,
        });
      } catch (error) {
        console.error('Failed to update stats:', error);
      }
    };

    updateStats();
  }, [grounds]);

  const { totalGrounds, totalBookings, totalRevenue, todayBookings, activeGrounds } = stats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
      {/* Total Grounds */}
      <Card className="bg-gradient-to-br from-[var(--primary-600)] to-[var(--primary-700)] text-white border-0 shadow-lg" variant="elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-1">Total Grounds</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalGrounds}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Bookings */}
      <Card className="bg-gradient-to-br from-[var(--success)] to-[var(--success)]/80 text-white border-0 shadow-lg" variant="elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-1">Total Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalBookings}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="bg-gradient-to-br from-[var(--warning)] to-[var(--warning)]/80 text-white border-0 shadow-lg" variant="elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Bookings */}
      <Card className="bg-gradient-to-br from-[var(--info)] to-[var(--info)]/80 text-white border-0 shadow-lg" variant="elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-1">Today's Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold">{todayBookings}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Grounds */}
      <Card className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white border-0 shadow-lg" variant="elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-1">Active Grounds</p>
              <p className="text-2xl sm:text-3xl font-bold">{activeGrounds}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
