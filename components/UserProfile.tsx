'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { BookingsList } from './BookingsList';
import apiService from '@/lib/utils/apiService';
import { BookingService } from '@/lib/services/bookingService';
import { Booking, Ground } from '@/lib/types';
import { formatDateShort } from '@/lib/utils/dateUtils';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  favoriteGrounds: string[];
  createdAt: string;
}

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [favoriteGrounds, setFavoriteGrounds] = useState<Ground[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'favorites'>('overview');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load user
      const userResponse = await apiService.get<User>(`/users/${userId}`);
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }

      // Load bookings
      const bookingsResponse = await apiService.get<Booking[]>(`/bookings?userId=${userId}`);
      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data);
      }

      // Load all grounds
      const allGrounds = await BookingService.getAllGrounds();
      setGrounds(allGrounds);

      // Load favorite grounds
      if (userResponse.success && userResponse.data?.favoriteGrounds) {
        const favorites = allGrounds.filter(g => 
          userResponse.data!.favoriteGrounds.includes(g.id)
        );
        setFavoriteGrounds(favorites);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">User Not Found</h3>
        <Button onClick={() => router.push('/admin/users')} variant="outline">
          Back to Users
        </Button>
      </div>
    );
  }

  const totalSpent = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* User Info Card */}
      <Card className="shadow-xl border-2 border-[var(--border)]">
        <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
                {user.name}
              </CardTitle>
              <div className="space-y-1">
                <p className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                {user.phone && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium">Phone:</span> {user.phone}
                  </p>
                )}
                <p className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium">Role:</span>{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-[var(--primary-100)] text-[var(--primary-700)]'
                      : 'bg-[var(--muted)] text-[var(--foreground)]'
                  }`}>
                    {user.role}
                  </span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium">Joined:</span> {formatDateShort(user.createdAt)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/admin/users')}
              variant="outline"
              className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            >
              Back to Users
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Total Bookings</p>
              <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{bookings.length}</p>
            </div>
            <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Confirmed</p>
              <p className="text-lg sm:text-xl font-bold text-[var(--success)]">{confirmedBookings}</p>
            </div>
            <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Cancelled</p>
              <p className="text-lg sm:text-xl font-bold text-[var(--danger)]">{cancelledBookings}</p>
            </div>
            <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Total Spent</p>
              <p className="text-lg sm:text-xl font-bold text-[var(--foreground)] break-words">Rs. {totalSpent.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
            <div className="flex gap-2 border-b border-[var(--border)] mb-4 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                  activeTab === 'overview'
                    ? 'border-[var(--primary-600)] text-[var(--primary-600)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                  activeTab === 'bookings'
                    ? 'border-[var(--primary-600)] text-[var(--primary-600)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                  activeTab === 'favorites'
                    ? 'border-[var(--primary-600)] text-[var(--primary-600)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Favorites ({favoriteGrounds.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Recent Bookings</h3>
                {bookings.slice(0, 5).length > 0 ? (
                  <div className="space-y-2">
                    {bookings.slice(0, 5).map((booking) => {
                      const ground = grounds.find(g => g.id === booking.groundId);
                      return (
                        <div
                          key={booking.id}
                          className="p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm text-[var(--foreground)]">
                                {ground?.name || 'Unknown Ground'}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {formatDateShort(booking.date)} • Rs. {booking.totalPrice.toLocaleString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                : 'bg-[var(--danger)]/20 text-[var(--danger)]'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No bookings yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <BookingsList
              bookings={bookings}
              showGroundName={true}
              ground={undefined}
            />
          )}

          {activeTab === 'favorites' && (
            <div>
              {favoriteGrounds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {favoriteGrounds.map((ground) => (
                    <div
                      key={ground.id}
                      className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary-500)] transition-all cursor-pointer"
                      onClick={() => router.push(`/admin/grounds/${ground.id}`)}
                    >
                      <h4 className="font-bold text-base text-[var(--foreground)] mb-2">{ground.name}</h4>
                      <p className="text-xs text-[var(--muted-foreground)] mb-2">
                        Rs. {ground.pricePerHour.toLocaleString()}/hr
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/grounds/${ground.id}`);
                        }}
                        className="w-full text-xs sm:text-sm min-h-[44px]"
                      >
                        View Ground
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                  No favorite grounds yet
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

