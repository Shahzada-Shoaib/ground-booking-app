'use client';

import React from 'react';
import { Ground } from '@/lib/types';
import { formatTimeRange } from '@/lib/utils/dateUtils';

interface BookingHeroProps {
  ground: Ground;
}

export const BookingHero: React.FC<BookingHeroProps> = ({
  ground,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl border border-green-100 shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-12">
        {/* Ground Name */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex-1 pr-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
              {ground.name}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
              Book your perfect time slot
            </p>
          </div>
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Price Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Price</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">Rs. {ground.pricePerHour.toLocaleString()}</p>
                <p className="text-xs text-gray-500">per hour</p>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Hours</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatTimeRange(ground.operatingHours.start, ground.operatingHours.end)}
                </p>
                <p className="text-xs text-gray-500">daily</p>
              </div>
            </div>
          </div>

          {/* Owner Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Owner</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{ground.ownerName}</p>
                <p className="text-xs text-gray-500">ground owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
