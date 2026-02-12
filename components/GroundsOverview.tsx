'use client';

import React, { useState, useEffect } from 'react';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [groundStats, setGroundStats] = useState<Record<string, { totalBookings: number; totalRevenue: number }>>({});

  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, { totalBookings: number; totalRevenue: number }> = {};
      for (const ground of grounds) {
        const bookings = await BookingService.getBookings(ground.id);
        stats[ground.id] = {
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
        };
      }
      setGroundStats(stats);
    };
    if (grounds.length > 0) {
      loadStats();
    }
  }, [grounds]);

  const handleManageGround = (groundId: string) => {
    router.push(`/admin/grounds/${groundId}`);
  };

  const handleDeleteGround = async (groundId: string, groundName: string) => {
    if (confirm(`Are you sure you want to delete "${groundName}"? This action cannot be undone.`)) {
      const success = await deleteGround(groundId);
      if (success) {
        await refreshGrounds();
      }
    }
  };

  const handleCopyLink = async (groundId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getBookingUrl(groundId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(groundId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(groundId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-[var(--border)]" variant="elevated">
      <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">All Grounds</CardTitle>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">Manage multiple grounds and their bookings</p>
          </div>
          <Button
            onClick={() => router.push('/admin/grounds/new')}
            className="px-4 py-2.5 font-semibold min-h-[44px] text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Ground
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {grounds.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-1.5">No Grounds Yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Get started by creating your first ground</p>
            <Button
              onClick={() => router.push('/admin/grounds/new')}
              className="px-4 py-2.5 font-semibold text-sm"
            >
              Create Your First Ground
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {grounds.map((g) => {
              const stats = groundStats[g.id] || { totalBookings: 0, totalRevenue: 0 };
              return (
                <div
                  key={g.id}
                  className="p-3 sm:p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary-500)] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)] truncate">{g.name}</h3>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getGroundTypeColor(g.type || 'other')}`}>
                        {getGroundTypeLabel(g.type || 'other')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGround(g.id, g.name);
                      }}
                      className="p-1.5 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete ground"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {g.description && (
                    <p className="text-xs text-[var(--muted-foreground)] mb-2 line-clamp-2">{g.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-center p-2 bg-[var(--muted)] rounded-lg">
                      <p className="text-[10px] text-[var(--muted-foreground)]">Bookings</p>
                      <p className="text-base font-bold text-[var(--foreground)]">{stats.totalBookings}</p>
                    </div>
                    <div className="text-center p-2 bg-[var(--muted)] rounded-lg">
                      <p className="text-[10px] text-[var(--muted-foreground)]">Revenue</p>
                      <p className="text-base font-bold text-[var(--foreground)]">Rs. {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                    <Button
                      onClick={() => handleManageGround(g.id)}
                      className="w-full font-semibold py-2.5 text-sm min-h-[44px]"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage Ground
                    </Button>
                    <div
                      onClick={(e) => handleCopyLink(g.id, e)}
                      className="cursor-pointer group"
                      title="Click to copy booking link"
                    >
                      <p className="text-[10px] text-[var(--muted-foreground)] text-center break-words">
                        Booking: <span className={`font-mono break-all transition-colors ${copiedId === g.id ? 'text-[var(--primary-500)] font-bold' : 'text-[var(--primary-500)] group-hover:text-[var(--primary-600)]'}`}>
                          {copiedId === g.id ? 'Copied!' : getBookingUrl(g.id)}
                        </span>
                      </p>
                    </div>
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
