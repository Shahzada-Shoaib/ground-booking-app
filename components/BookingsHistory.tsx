'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { BookingsList } from './BookingsList';
import apiService from '@/lib/utils/apiService';
import { BookingService } from '@/lib/services/bookingService';
import { Booking, Ground } from '@/lib/types';
import { exportToCSV, exportToJSON } from '@/lib/utils/exportUtils';

export const BookingsHistory: React.FC = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groundFilter, setGroundFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load bookings
      const bookingsResponse = await apiService.get<Booking[]>('/bookings');
      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data);
      }

      // Load grounds
      const allGrounds = await BookingService.getAllGrounds();
      setGrounds(allGrounds);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerPhone.includes(searchTerm)
      );
    }

    // Ground filter
    if (groundFilter !== 'all') {
      filtered = filtered.filter(booking => booking.groundId === groundFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startDate;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  };

  const handleExport = (format: 'csv' | 'json') => {
    const filtered = getFilteredBookings();
    const data = filtered.map(booking => {
      const ground = grounds.find(g => g.id === booking.groundId);
      return {
        'Booking ID': booking.id,
        'Ground': ground?.name || 'Unknown',
        'Customer Name': booking.customerName,
        'Customer Email': booking.customerEmail,
        'Customer Phone': booking.customerPhone,
        'Date': booking.date,
        'Time': `${booking.startTime}:00 - ${booking.endTime}:00`,
        'Hours': booking.hours,
        'Total Price': booking.totalPrice,
        'Status': booking.status,
        'Created At': booking.createdAt,
      };
    });

    if (format === 'csv') {
      exportToCSV(data, `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      exportToJSON(data, `bookings-${new Date().toISOString().split('T')[0]}.json`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <Card className="shadow-xl border-2 border-[var(--border)]">
      <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Booking History</CardTitle>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">View and manage all bookings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="text-xs sm:text-sm min-h-[44px] w-full sm:w-auto"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              className="text-xs sm:text-sm min-h-[44px] w-full sm:w-auto"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <select
            value={groundFilter}
            onChange={(e) => setGroundFilter(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--input)] text-[var(--foreground)] min-h-[44px]"
          >
            <option value="all">All Grounds</option>
            {grounds.map(ground => (
              <option key={ground.id} value={ground.id}>{ground.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'cancelled')}
            className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--input)] text-[var(--foreground)] min-h-[44px]"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
            className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--input)] text-[var(--foreground)] min-h-[44px]"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Total Bookings</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{filteredBookings.length}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Confirmed</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--success)]">
              {filteredBookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Cancelled</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--danger)]">
              {filteredBookings.filter(b => b.status === 'cancelled').length}
            </p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Total Revenue</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--foreground)] break-words">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Bookings Found</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {searchTerm || groundFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No bookings yet'}
            </p>
          </div>
        ) : (
          <BookingsList
            bookings={filteredBookings}
            showGroundName={true}
            ground={undefined}
          />
        )}
      </CardContent>
    </Card>
  );
};

