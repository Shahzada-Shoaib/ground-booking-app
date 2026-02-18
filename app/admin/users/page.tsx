'use client';

import { BookingProvider } from '@/context/BookingContext';
import { UsersList } from '@/components/UsersList';
import { PageHeader } from '@/components/ui/PageHeader';

export default function UsersPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen pb-16 md:pb-0">
        <PageHeader
          title="User Management"
          subtitle="View and manage all registered users"
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <UsersList />
        </div>
      </div>
    </BookingProvider>
  );
}

