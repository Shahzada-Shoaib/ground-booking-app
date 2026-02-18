'use client';

import { BookingProvider } from '@/context/BookingContext';
import { AdminOverview } from '@/components/AdminOverview';
import { UserMenu } from '@/components/UserMenu';
import { PageHeader } from '@/components/ui/PageHeader';

export default function DashboardPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen pb-16 md:pb-0">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Overview of all grounds, bookings, and revenue"
          actions={
            <>
              <UserMenu />
              <div className="hidden sm:block">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </>
          }
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <AdminOverview />
        </div>
      </div>
    </BookingProvider>
  );
}

