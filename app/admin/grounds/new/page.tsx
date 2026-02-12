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
    location: {
      address: '',
      city: '',
      mapLink: '',
    },
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
      const newGround = await BookingService.createGround({
        name: settings.name,
        type: settings.type,
        ownerName: settings.ownerName,
        description: settings.description,
        operatingHours: {
          start: settings.startHour,
          end: settings.endHour,
        },
        pricePerHour: settings.pricePerHour,
        location: settings.location,
      });
      if (newGround) {
        showSuccess('Ground created successfully!');
        router.push(`/admin/grounds/${newGround.id}`);
      } else {
        showError('Failed to create ground. Please try again.');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create ground. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Button
                  onClick={() => router.push('/dashboard')}
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
                Create New Ground
              </h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg">
                Set up a new ground for bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <Card className="shadow-xl border-2 border-[var(--primary-200)]" variant="elevated">
          <CardHeader className="bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/20 border-b border-[var(--primary-200)] p-3 sm:p-4 md:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--foreground)]">Ground Information</CardTitle>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">Fill in the details to create your new ground</p>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5">
                <Input
                  label="Ground Name"
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="e.g., National Cricket Ground"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Ground Type
                    </span>
                  </label>
                  <select
                    value={settings.type}
                    onChange={(e) => setSettings({ ...settings, type: e.target.value as GroundType })}
                    className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all bg-[var(--input)] text-[var(--foreground)]"
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
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={settings.description || ''}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    placeholder="Add a description for this ground..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all bg-[var(--input)] text-[var(--foreground)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address (Optional)
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={settings.location?.address || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      location: { ...settings.location, address: e.target.value }
                    })}
                    placeholder="e.g., Street 123, Area Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    City (Optional)
                  </label>
                  <Input
                    type="text"
                    value={settings.location?.city || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      location: { ...settings.location, city: e.target.value }
                    })}
                    placeholder="e.g., Karachi, Lahore"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Map Link (Optional)
                    </span>
                  </label>
                  <Input
                    type="url"
                    value={settings.location?.mapLink || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      location: { ...settings.location, mapLink: e.target.value }
                    })}
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Paste Google Maps link or any map service URL
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Opening Hour
                    </span>
                  </label>
                  <select
                    value={settings.startHour}
                    onChange={(e) => setSettings({ ...settings, startHour: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all bg-[var(--input)] text-[var(--foreground)] min-h-[44px] text-sm sm:text-base"
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {formatTime(hour)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Closing Hour
                    </span>
                  </label>
                  <select
                    value={settings.endHour}
                    onChange={(e) => setSettings({ ...settings, endHour: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all bg-[var(--input)] text-[var(--foreground)] min-h-[44px] text-sm sm:text-base"
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {formatTime(hour)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Price Per Hour
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] font-medium text-sm sm:text-base">Rs.</span>
                    <Input
                      type="number"
                      value={settings.pricePerHour}
                      onChange={(e) => setSettings({ ...settings, pricePerHour: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="100"
                      required
                      className="pl-10 sm:pl-12 min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[var(--muted)] border-2 border-[var(--border)] rounded-xl">
                <p className="text-xs sm:text-sm text-[var(--foreground)]">
                  <span className="font-semibold">Operating Hours:</span>{' '}
                  {formatTimeRange(settings.startHour, settings.endHour)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 pt-2">
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={!settings.name.trim() || !settings.ownerName.trim() || settings.startHour >= settings.endHour}
                  className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl min-h-[44px]"
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
