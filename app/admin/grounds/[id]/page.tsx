'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingProvider } from '@/context/BookingContext';
import { BookingService } from '@/lib/services/bookingService';
import { Ground } from '@/lib/types';
import { GroundManagement } from '@/components/GroundManagement';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

function GroundManagementPageContent() {
  const params = useParams();
  const router = useRouter();
  const groundId = params.id as string;

  const [ground, setGround] = useState<Ground | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGround = async () => {
      try {
        const foundGround = await BookingService.getGround(groundId);
        if (!foundGround) {
          router.push('/');
          return;
        }
        setGround(foundGround);
      } catch (error) {
        console.error('Error loading ground:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (groundId) {
      loadGround();
    }
  }, [groundId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[var(--muted-foreground)]">Loading ground details...</p>
        </div>
      </div>
    );
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-3 sm:p-4 pb-16 md:pb-4">
        <div className="bg-[var(--card)] rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-3 sm:mx-4 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--danger)]/15 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">Ground Not Found</h2>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-4 sm:mb-6">The ground you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push('/')}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[44px]"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 break-words">
                {ground.name}
              </h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg">
                Manage bookings, settings, and details for this ground
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <GroundManagement ground={ground} />
      </div>
    </div>
  );
}

export default function GroundManagementPage() {
  return (
    <BookingProvider>
      <GroundManagementPageContent />
    </BookingProvider>
  );
}
