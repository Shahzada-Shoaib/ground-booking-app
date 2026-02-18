'use client';

import React from 'react';
import { Ground } from '@/lib/types';
import { formatTimeRange } from '@/lib/utils/dateUtils';
import { getGroundTypeLabel, getGroundTypeColor } from '@/lib/utils/groundUtils';

interface BookingHeroProps {
  ground: Ground;
}

export const BookingHero: React.FC<BookingHeroProps> = ({
  ground,
}) => {
  return (
    <div className="relative overflow-hidden bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-lg">
      <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-12">
        {/* Ground Name */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--foreground)]">
                {ground.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getGroundTypeColor(ground.type || 'other')}`}>
                {getGroundTypeLabel(ground.type || 'other')}
              </span>
            </div>
            {ground.description && (
              <p className="text-[var(--muted-foreground)] text-sm sm:text-base mb-2">
                {ground.description}
              </p>
            )}
            <p className="text-[var(--muted-foreground)] text-xs sm:text-sm lg:text-base">
              Book your perfect time slot
            </p>
          </div>
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-[var(--primary-500)] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info Cards - Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide sm:scrollbar-default">
          <div className="flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 min-w-max sm:min-w-0 pb-1 sm:pb-0">
          {/* Price Card */}
            <div className="bg-[var(--card)] rounded-xl p-3 sm:p-4 md:p-5 border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-[140px] sm:w-auto">
            <div className="flex items-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Price</p>
                  <p className="text-sm sm:text-lg md:text-xl font-bold text-[var(--foreground)] truncate">Rs. {ground.pricePerHour.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">per hour</p>
              </div>
            </div>
          </div>

          {/* Hours Card */}
            <div className="bg-[var(--card)] rounded-xl p-3 sm:p-4 md:p-5 border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-[140px] sm:w-auto">
            <div className="flex items-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Hours</p>
                  <p className="text-sm sm:text-lg md:text-xl font-bold text-[var(--foreground)] truncate">
                  {formatTimeRange(ground.operatingHours.start, ground.operatingHours.end)}
                </p>
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">daily</p>
              </div>
            </div>
          </div>

          {/* Owner Card */}
            <div className="bg-[var(--card)] rounded-xl p-3 sm:p-4 md:p-5 border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-[140px] sm:w-auto">
            <div className="flex items-center mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Owner</p>
                  <p className="text-sm sm:text-lg md:text-xl font-bold text-[var(--foreground)] truncate">{ground.ownerName}</p>
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">ground owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
