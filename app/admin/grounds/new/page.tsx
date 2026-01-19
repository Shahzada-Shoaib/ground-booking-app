'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingProvider } from '@/context/BookingContext';
import { BookingService } from '@/lib/services/bookingService';
import { GroundSettings, GroundType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { formatTime, formatTimeRange } from '@/lib/utils/dateUtils';
import { GROUND_TYPES, getGroundTypeLabel } from '@/lib/utils/groundUtils';

function NewGroundPageContent() {
  const router = useRouter();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [settings, setSettings] = useState<GroundSettings>({
    name: '',
    type: 'cricket',
    ownerName: '',
    description: '',
    startHour: 9,
    endHour: 22,
    pricePerHour: 2000,
  });

  const [isSaving, setIsSaving] = useState(false);
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  const handleSave = async () => {
    if (!settings.name.trim() || !settings.ownerName.trim() || settings.startHour >= settings.endHour) {
      showError('Please fill in all required fields correctly.');
      return;
    }

    setIsSaving(true);
    try {
      const newGround = BookingService.createGround({
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
      showSuccess('Ground created successfully!');
      router.push(`/admin/grounds/${newGround.id}`);
    } catch (error) {
      showError('Failed to create ground. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
                Create New Ground
              </h1>
              <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                Set up a new ground for bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card className="shadow-xl border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-gray-900">Ground Information</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Fill in the details to create your new ground</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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
                  ✨ Create Ground
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function NewGroundPage() {
  return (
    <BookingProvider>
      <NewGroundPageContent />
    </BookingProvider>
  );
}
