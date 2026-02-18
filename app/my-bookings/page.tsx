'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingProvider } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { BookingService } from '@/lib/services/bookingService';
import { Booking, Ground } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookingsList } from '@/components/BookingsList';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { formatDateShort } from '@/lib/utils/dateUtils';
import { PageHeader } from '@/components/ui/PageHeader';

function MyBookingsContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showError, toasts, removeToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      loadBookings();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const allBookings = await BookingService.getBookings();
      // Filter bookings for current user (API should already filter, but double-check)
      const userBookings = allBookings.filter(
        (booking) => !booking.userId || booking.userId === user?.id
      );
      setBookings(userBookings);

      // Load grounds for display
      const allGrounds = await BookingService.getAllGrounds();
      setGrounds(allGrounds);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      showError('Failed to load your bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const success = await BookingService.cancelBooking(bookingId);
      if (success) {
        // Reload bookings
        await loadBookings();
      } else {
        showError('Failed to cancel booking. Please try again.');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      showError('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center pb-16 md:pb-0">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title="My Bookings" subtitle="View and manage your ground bookings" />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <Card className="shadow-xl border-2 border-[var(--border)]">
          <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  Your Bookings
                </CardTitle>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                  All your ground bookings in one place
                </p>
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | 'confirmed' | 'cancelled')
                }
                className="px-4 py-2.5 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--input)] text-[var(--foreground)] min-h-[44px] text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-3 bg-[var(--muted)] rounded-lg">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Bookings</p>
                <p className="text-xl font-bold text-[var(--foreground)]">{bookings.length}</p>
              </div>
              <div className="text-center p-3 bg-[var(--muted)] rounded-lg">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Confirmed</p>
                <p className="text-xl font-bold text-[var(--success)]">{confirmedBookings}</p>
              </div>
              <div className="text-center p-3 bg-[var(--muted)] rounded-lg col-span-2 sm:col-span-1">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Spent</p>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  Rs. {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[var(--foreground)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  No Bookings Found
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  {statusFilter !== 'all'
                    ? 'No bookings with this status'
                    : "You haven't made any bookings yet"}
                </p>
                <Button onClick={() => router.push('/')} className="min-h-[44px]">
                  Browse Grounds
                </Button>
              </div>
            ) : (
              <BookingsList
                bookings={filteredBookings}
                showGroundName={true}
                onCancelBooking={handleCancelBooking}
                ground={undefined}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <BookingProvider>
      <MyBookingsContent />
    </BookingProvider>
  );
}

