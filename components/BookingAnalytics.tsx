'use client';

import React from 'react';
import { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatDateShort } from '@/lib/utils/dateUtils';

interface BookingAnalyticsProps {
  bookings: Booking[];
}

export const BookingAnalytics: React.FC<BookingAnalyticsProps> = ({
  bookings,
}) => {
  // Calculate statistics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalHours = bookings.reduce((sum, b) => sum + b.hours, 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Bookings by day of week
  const bookingsByDay: Record<string, number> = {};
  bookings.forEach(booking => {
    const date = new Date(booking.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    bookingsByDay[dayName] = (bookingsByDay[dayName] || 0) + 1;
  });

  // Recent bookings (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= sevenDaysAgo;
  });

  // Top time slots
  const timeSlotCounts: Record<string, number> = {};
  bookings.forEach(booking => {
    const key = `${booking.startTime}-${booking.endTime}`;
    timeSlotCounts[key] = (timeSlotCounts[key] || 0) + 1;
  });
  const topTimeSlots = Object.entries(timeSlotCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatTimeSlot = (key: string): string => {
    const [start, end] = key.split('-').map(Number);
    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour}:00 ${period}`;
    };
    return `${formatHour(start)} - ${formatHour(end)}`;
  };

  return (
    <Card className="shadow-xl border-2 border-gray-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Analytics & Insights</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Booking statistics and trends</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <p className="text-xs font-medium text-blue-700 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-blue-900">{totalBookings}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <p className="text-xs font-medium text-green-700 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-900">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
            <p className="text-xs font-medium text-purple-700 mb-1">Total Hours</p>
            <p className="text-3xl font-bold text-purple-900">{totalHours}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">Avg. Booking</p>
            <p className="text-3xl font-bold text-orange-900">Rs. {Math.round(avgBookingValue).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Bookings (Last 7 Days)
            </h3>
            {recentBookings.length > 0 ? (
              <div className="space-y-2">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDateShort(booking.date)}</p>
                      </div>
                      <p className="font-bold text-green-600">Rs. {booking.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent bookings</p>
            )}
          </div>

          {/* Popular Time Slots */}
          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Most Popular Time Slots
            </h3>
            {topTimeSlots.length > 0 ? (
              <div className="space-y-2">
                {topTimeSlots.map(([slot, count], index) => (
                  <div key={slot} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatTimeSlot(slot)}</p>
                        <p className="text-xs text-gray-500">{count} booking{count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="w-16 bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / topTimeSlots[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No booking data available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
