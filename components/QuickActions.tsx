'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface QuickActionsProps {
  onViewTodayBookings?: () => void;
  onViewUpcomingBookings?: () => void;
  onClearAllFilters?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onViewTodayBookings,
  onViewUpcomingBookings,
  onClearAllFilters,
}) => {
  return (
    <Card className="shadow-lg border-2 border-gray-100">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {onViewTodayBookings && (
            <Button
              variant="outline"
              onClick={onViewTodayBookings}
              className="w-full justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Today
            </Button>
          )}
          {onViewUpcomingBookings && (
            <Button
              variant="outline"
              onClick={onViewUpcomingBookings}
              className="w-full justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming
            </Button>
          )}
          {onClearAllFilters && (
            <Button
              variant="outline"
              onClick={onClearAllFilters}
              className="w-full justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
