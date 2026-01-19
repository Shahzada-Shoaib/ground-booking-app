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
    const loadGround = () => {
      try {
        const foundGround = BookingService.getGround(groundId);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading ground details...</p>
        </div>
      </div>
    );
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ground Not Found</h2>
          <p className="text-gray-600 mb-6">The ground you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Button>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2">
                {ground.name}
              </h1>
              <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                Manage bookings, settings, and details for this ground
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
