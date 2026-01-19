'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/context/BookingContext';
import { BookingService } from '@/lib/services/bookingService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { getGroundTypeLabel, getGroundTypeColor } from '@/lib/utils/groundUtils';
import { getBookingUrl } from '@/lib/utils/urlUtils';

export const GroundsOverview: React.FC = () => {
  const { grounds, deleteGround, refreshGrounds } = useBookingContext();
  const router = useRouter();

  const handleManageGround = (groundId: string) => {
    router.push(`/admin/grounds/${groundId}`);
  };

  const handleDeleteGround = (groundId: string, groundName: string) => {
    if (confirm(`Are you sure you want to delete "${groundName}"? This action cannot be undone.`)) {
      const success = deleteGround(groundId);
      if (success) {
        refreshGrounds();
      }
    }
  };

  const getGroundStats = (groundId: string) => {
    const groundBookings = BookingService.getBookings(groundId);
    const totalBookings = groundBookings.length;
    const totalRevenue = groundBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    return { totalBookings, totalRevenue };
  };

  return (
    <Card className="shadow-xl border-2 border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">All Grounds</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Manage multiple grounds and their bookings</p>
          </div>
          <Button
            onClick={() => router.push('/admin/grounds/new')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl font-semibold min-h-[44px]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Ground
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {grounds.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grounds Yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first ground</p>
            <Button
              onClick={() => router.push('/admin/grounds/new')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl font-semibold"
            >
              Create Your First Ground
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grounds.map((g) => {
              const stats = getGroundStats(g.id);
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{g.name}</h3>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getGroundTypeColor(g.type || 'other')}`}>
                        {getGroundTypeLabel(g.type || 'other')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGround(g.id, g.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete ground"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {g.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{g.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Bookings</p>
                      <p className="text-lg font-bold text-blue-600">{stats.totalBookings}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">Revenue</p>
                      <p className="text-lg font-bold text-purple-600">Rs. {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <Button
                      onClick={() => handleManageGround(g.id)}
                      className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage Ground
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Booking: <span className="font-mono text-green-600">{getBookingUrl(g.id)}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
