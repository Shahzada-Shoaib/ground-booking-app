'use client';

import { useParams } from 'next/navigation';
import { BookingProvider } from '@/context/BookingContext';
import { UserProfile } from '@/components/UserProfile';
import { PageHeader } from '@/components/ui/PageHeader';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <BookingProvider>
      <div className="min-h-screen pb-16 md:pb-0">
        <PageHeader
          title="User Profile"
          subtitle="View user details, bookings, and favorites"
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <UserProfile userId={userId} />
        </div>
      </div>
    </BookingProvider>
  );
}

