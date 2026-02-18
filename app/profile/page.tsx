'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingProvider } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { BookingService } from '@/lib/services/bookingService';
import { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { formatDateShort } from '@/lib/utils/dateUtils';
import apiService from '@/lib/utils/apiService';
import { PageHeader } from '@/components/ui/PageHeader';

function ProfileContent() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
        loadUserBookings();
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadUserBookings = async () => {
    try {
      const allBookings = await BookingService.getBookings();
      const userBookings = allBookings.filter(
        (booking) => !booking.userId || booking.userId === user?.id
      );
      setBookings(userBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user profile via API
      const response = await apiService.patch(`/users/${user.id}`, {
        name: formData.name,
        phone: formData.phone,
      });

      if (response.success) {
        showSuccess('Profile updated successfully!');
        setIsEditing(false);
        await refreshUser(); // Refresh user data
      } else {
        showError(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      showError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
  };

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center pb-16 md:pb-0">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 md:pb-0">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <Card className="shadow-xl border-2 border-[var(--border)]">
            <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                    Profile Information
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                    Update your personal information
                  </p>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="min-h-[44px]"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-[var(--muted)] rounded-xl text-[var(--foreground)] min-h-[44px] flex items-center">
                      {user.name || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Email Address
                  </label>
                  <p className="px-4 py-3 bg-[var(--muted)] rounded-xl text-[var(--foreground)] min-h-[44px] flex items-center">
                    {user.email}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="03XX-XXXXXXX"
                      className="min-h-[44px]"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-[var(--muted)] rounded-xl text-[var(--foreground)] min-h-[44px] flex items-center">
                      {user.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Account Type
                  </label>
                  <p className="px-4 py-3 bg-[var(--muted)] rounded-xl text-[var(--foreground)] min-h-[44px] flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-[var(--primary-100)] text-[var(--primary-700)]'
                          : 'bg-[var(--muted)] text-[var(--foreground)]'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </p>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={handleSave}
                      isLoading={isLoading}
                      disabled={!formData.name.trim()}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isLoading}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card className="shadow-xl border-2 border-[var(--border)]">
            <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                Account Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[var(--border)]">
                <Button
                  onClick={() => router.push('/my-bookings')}
                  variant="outline"
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <BookingProvider>
      <ProfileContent />
    </BookingProvider>
  );
}

