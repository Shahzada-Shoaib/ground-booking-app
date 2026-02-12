'use client';

import React from 'react';
import { FiClock, FiCalendar, FiX } from 'react-icons/fi';
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
    <Card className="shadow-lg border-2 border-[var(--border)]" variant="elevated">
      <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)]">
        <CardTitle className="text-lg font-bold text-[var(--foreground)]">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {onViewTodayBookings && (
            <Button
              variant="outline"
              onClick={onViewTodayBookings}
              className="w-full justify-center"
            >
              <FiClock className="w-4 h-4 mr-2" />
              Today
            </Button>
          )}
          {onViewUpcomingBookings && (
            <Button
              variant="outline"
              onClick={onViewUpcomingBookings}
              className="w-full justify-center"
            >
              <FiCalendar className="w-4 h-4 mr-2" />
              Upcoming
            </Button>
          )}
          {onClearAllFilters && (
            <Button
              variant="outline"
              onClick={onClearAllFilters}
              className="w-full justify-center"
            >
              <FiX className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
