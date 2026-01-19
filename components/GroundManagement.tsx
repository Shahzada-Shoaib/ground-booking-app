'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ground, GroundSettings, GroundType } from '@/lib/types';
import { BookingService } from '@/lib/services/bookingService';
import { useBookingContext } from '@/context/BookingContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ShareLink } from './ShareLink';
import { BookingsList } from './BookingsList';
import { BookingCalendarView } from './BookingCalendarView';
import { BookingAnalytics } from './BookingAnalytics';
import { QuickActions } from './QuickActions';
import { BookingNotifications } from './BookingNotifications';
import { useBookings } from '@/lib/hooks/useBookings';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from './ui/Toast';
import { Modal } from './ui/Modal';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { formatTime, formatTimeRange } from '@/lib/utils/dateUtils';
import { exportToCSV, exportToJSON } from '@/lib/utils/exportUtils';
import { GROUND_TYPES, getGroundTypeLabel } from '@/lib/utils/groundUtils';

interface GroundManagementProps {
  ground: Ground;
}

export const GroundManagement: React.FC<GroundManagementProps> = ({ ground }) => {
  const router = useRouter();
  const { deleteGround, refreshGrounds } = useBookingContext();
  const [settings, setSettings] = useState<GroundSettings>({
    name: ground.name,
    type: ground.type || 'cricket',
    ownerName: ground.ownerName,
    description: ground.description || '',
    startHour: ground.operatingHours.start,
    endHour: ground.operatingHours.end,
    pricePerHour: ground.pricePerHour,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'analytics'>('list');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openSections, setOpenSections] = useState({
    stats: true,
    settings: false,
    shareLink: false,
    bookings: false,
  });
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const { bookings, isLoading, refreshBookings, cancelBooking } = useBookings(ground.id);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    setSettings({
      name: ground.name,
      type: ground.type || 'cricket',
      ownerName: ground.ownerName,
      description: ground.description || '',
      startHour: ground.operatingHours.start,
      endHour: ground.operatingHours.end,
      pricePerHour: ground.pricePerHour,
    });
  }, [ground]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = BookingService.updateGround(ground.id, {
        name: settings.name,
        type: settings.type,
        ownerName: settings.ownerName,
        description: settings.description,
        operatingHours: {
          start: settings.startHour,
          end: settings.endHour,
        },
        pricePerHour: settings.pricePerHour,
      });
      if (updated) {
        refreshGrounds();
        showSuccess('Settings saved successfully!');
      } else {
        showError('Failed to update settings. Please try again.');
      }
    } catch (error) {
      showError('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGround = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const success = deleteGround(ground.id);
    if (success) {
      showSuccess('Ground deleted successfully!');
      setShowDeleteModal(false);
      router.push('/');
    } else {
      showError('Failed to delete ground. Please try again.');
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const success = cancelBooking(bookingId);
    if (success) {
      refreshBookings();
      showSuccess('Booking cancelled successfully');
    } else {
      showError('Failed to cancel booking. Please try again.');
    }
  };

  const handleExportCSV = () => {
    if (bookings.length > 0) {
      exportToCSV(bookings, ground.name);
      showSuccess('Bookings exported to CSV successfully!');
    }
  };

  const handleExportJSON = () => {
    if (bookings.length > 0) {
      exportToJSON(bookings, ground.name);
      showSuccess('Bookings exported to JSON successfully!');
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  // Calculate stats
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today;
  }).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="space-y-4">
      {/* Stats Cards Section - Always Visible */}
      <Card className="shadow-xl border-2 border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Statistics & Overview</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Ground performance and booking statistics</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold">{totalBookings}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">Today's Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold">{todayBookings}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </CardContent>
      </Card>

      {/* Ground Settings Section */}
      <CollapsibleSection
        title="Ground Settings"
        isOpen={openSections.settings}
        onToggle={() => toggleSection('settings')}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      >
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <Input
              label="Ground Name"
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="e.g., National Cricket Ground"
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Ground Type
                </span>
              </label>
              <select
                value={settings.type}
                onChange={(e) => setSettings({ ...settings, type: e.target.value as GroundType })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
              >
                {GROUND_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getGroundTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Owner Name"
              type="text"
              value={settings.ownerName}
              onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
              placeholder="Your name"
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Add a description for this ground..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Opening Hour
                </span>
              </label>
              <select
                value={settings.startHour}
                onChange={(e) => setSettings({ ...settings, startHour: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
              >
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatTime(hour)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Closing Hour
                </span>
              </label>
              <select
                value={settings.endHour}
                onChange={(e) => setSettings({ ...settings, endHour: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
              >
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatTime(hour)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Price Per Hour
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rs.</span>
                <Input
                  type="number"
                  value={settings.pricePerHour}
                  onChange={(e) => setSettings({ ...settings, pricePerHour: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="100"
                  required
                  className="pl-12"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Operating Hours:</span>{' '}
              {formatTimeRange(settings.startHour, settings.endHour)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!settings.name.trim() || !settings.ownerName.trim() || settings.startHour >= settings.endHour}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl min-h-[44px]"
            >
              💾 Save Settings
            </Button>
            <Button
              onClick={handleDeleteGround}
              variant="outline"
              className="w-full sm:w-auto px-6 py-3 text-red-600 border-red-300 hover:bg-red-50 min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Ground
            </Button>
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Last updated: {new Date(ground.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Share Link Section */}
      <CollapsibleSection
        title="Share Booking Link"
        isOpen={openSections.shareLink}
        onToggle={() => toggleSection('shareLink')}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        }
      >
        <ShareLink groundId={ground.id} groundName={ground.name} />
      </CollapsibleSection>

      {/* Notifications */}
      {bookings.length > 0 && (
        <BookingNotifications bookings={bookings} />
      )}

      {/* Bookings Management Section - Always Visible */}
      <Card className="shadow-xl border-2 border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Bookings Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">View and manage all your ground bookings</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {bookings.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-xs sm:text-sm min-h-[44px]"
                    title="Export to CSV"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-xs sm:text-sm min-h-[44px]"
                    title="Export to JSON"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    JSON
                  </button>
                </div>
              )}
              <button
                onClick={refreshBookings}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === 'list'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                List View
              </span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === 'calendar'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === 'analytics'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {activeTab === 'list' && (
          <QuickActions
            onViewTodayBookings={() => {
              const today = new Date().toISOString().split('T')[0];
              setCalendarSelectedDate(today);
            }}
            onViewUpcomingBookings={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowStr = tomorrow.toISOString().split('T')[0];
              setCalendarSelectedDate(tomorrowStr);
            }}
            onClearAllFilters={() => {
              setCalendarSelectedDate(null);
            }}
          />
        )}

        {/* Tab Content */}
        {activeTab === 'list' && (
          <div id="bookings-list">
            <BookingsList
              bookings={bookings}
              isLoading={isLoading}
              onCancelBooking={handleCancelBooking}
              onDateFilter={(date) => setCalendarSelectedDate(date)}
              ground={ground}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <BookingCalendarView
            bookings={bookings}
            selectedDate={calendarSelectedDate}
            onDateSelect={setCalendarSelectedDate}
          />
        )}

        {activeTab === 'analytics' && (
          <BookingAnalytics bookings={bookings} />
        )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Ground"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{ground.name}</strong>? This action cannot be undone.
          </p>
          <p className="text-sm text-red-600 mb-6">
            All bookings for this ground will be preserved, but the ground will no longer be accessible.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="px-6 py-2 bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
