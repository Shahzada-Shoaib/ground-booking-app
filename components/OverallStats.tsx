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
    const updateStats = () => {
      setStats({
        totalGrounds: BookingService.getAllGrounds().length,
        totalBookings: BookingService.getTotalBookings(),
        totalRevenue: BookingService.getTotalRevenue(),
        todayBookings: BookingService.getTodayTotalBookings(),
        activeGrounds: BookingService.getActiveGroundsCount(),
      });
    };

    updateStats();
  }, [grounds]);

  const { totalGrounds, totalBookings, totalRevenue, todayBookings, activeGrounds } = stats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
      {/* Total Grounds */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-0.5 sm:mb-1 truncate">Total Grounds</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalGrounds}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Bookings */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-green-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-0.5 sm:mb-1 truncate">Total Bookings</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalBookings}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-purple-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-0.5 sm:mb-1 truncate">Total Revenue</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Bookings */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-orange-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-0.5 sm:mb-1 truncate">Today's Bookings</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{todayBookings}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Grounds */}
      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-teal-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-0.5 sm:mb-1 truncate">Active Grounds</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{activeGrounds}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
