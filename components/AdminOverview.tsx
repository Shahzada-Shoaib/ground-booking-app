'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OverallStats } from './OverallStats';
import { GroundsOverview } from './GroundsOverview';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

export const AdminOverview: React.FC = () => {
  const router = useRouter();

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-[var(--border)] min-h-[80px] sm:min-h-[100px] flex items-center" onClick={() => router.push('/admin/bookings')}>
          <CardContent className="p-3 sm:p-4 w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">Booking History</p>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate">View all bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-[var(--border)] min-h-[80px] sm:min-h-[100px] flex items-center" onClick={() => router.push('/admin/users')}>
          <CardContent className="p-3 sm:p-4 w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">User Management</p>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate">Manage users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-[var(--border)] min-h-[80px] sm:min-h-[100px] flex items-center" onClick={() => router.push('/admin/grounds/new')}>
          <CardContent className="p-3 sm:p-4 w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">Create Ground</p>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate">Add new ground</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-[var(--border)] min-h-[80px] sm:min-h-[100px] flex items-center" onClick={() => router.push('/')}>
          <CardContent className="p-3 sm:p-4 w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">Dashboard</p>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate">Overview</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Statistics */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">Overall Statistics</h2>
        <OverallStats />
      </div>

      {/* Grounds Overview */}
      <div>
        <GroundsOverview />
      </div>
    </div>
  );
};
