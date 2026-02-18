'use client';

import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { BookingFormData } from '@/lib/types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { validateBookingForm } from '@/lib/utils/validation';
import { useAuth } from '@/context/AuthContext';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  onFormSubmit?: (data: BookingFormData) => void; // For mobile: just validates and shows summary
  isLoading?: boolean;
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  selectedDate: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  onFormSubmit,
  isLoading = false,
  selectedStartTime,
  selectedEndTime,
  selectedDate,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        customerName: prev.customerName || user.name || '',
        customerPhone: prev.customerPhone || user.phone || '',
        customerEmail: prev.customerEmail || user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof typeof formData) => {
    const newErrors: Record<string, string> = { ...errors };

    switch (field) {
      case 'customerName':
        if (!formData.customerName.trim()) {
          newErrors.customerName = 'Name is required';
        } else if (formData.customerName.trim().length < 2) {
          newErrors.customerName = 'Name must be at least 2 characters';
        } else {
          delete newErrors.customerName;
        }
        break;

      case 'customerPhone':
        if (!formData.customerPhone.trim()) {
          newErrors.customerPhone = 'Phone number is required';
        } else {
          const phoneRegex = /^(\+92|0)[0-9]{2,3}[-\s]?[0-9]{7}$/;
          if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
            newErrors.customerPhone = 'Please enter a valid phone number (e.g., 03XX-XXXXXXX)';
          } else {
            delete newErrors.customerPhone;
          }
        }
        break;

      case 'customerEmail':
        if (!formData.customerEmail.trim()) {
          newErrors.customerEmail = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Please enter a valid email address';
          } else {
            delete newErrors.customerEmail;
          }
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStartTime || !selectedEndTime) {
      alert('Please select a time slot');
      return;
    }

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      validateField(field as keyof typeof formData);
      setTouched((prev) => ({ ...prev, [field]: true }));
    });

    // Check if there are any errors
    const validation = validateBookingForm({
      ...formData,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    });

    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        // Map general errors to specific fields if possible
        if (error.includes('Name')) {
          setErrors((prev) => ({ ...prev, customerName: error }));
        } else if (error.includes('phone')) {
          setErrors((prev) => ({ ...prev, customerPhone: error }));
        } else if (error.includes('email')) {
          setErrors((prev) => ({ ...prev, customerEmail: error }));
        }
      });
      return;
    }

    // Check for individual field errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    const bookingData = {
      ...formData,
      date: selectedDate,
      startTime: selectedStartTime!,
      endTime: selectedEndTime!,
    };

    // On mobile: use onFormSubmit (shows summary), on desktop: use onSubmit (creates booking)
    if (isMobile && onFormSubmit) {
      onFormSubmit(bookingData);
    } else {
      onSubmit(bookingData);
    }
  };

  const isFormValid =
    formData.customerName.trim() &&
    formData.customerPhone.trim() &&
    formData.customerEmail.trim() &&
    Object.keys(errors).length === 0 &&
    selectedStartTime !== null &&
    selectedEndTime !== null;

  return (
    <Card className="border-2 border-[var(--primary-200)] shadow-lg" variant="elevated">
      <CardHeader className="bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/20 border-b border-[var(--primary-200)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl font-bold text-[var(--foreground)]">Your Information</CardTitle>
            <p className="text-xs sm:text-sm text-[var(--primary-700)] mt-1 font-medium">Step 3 of 3 - Almost done!</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary-600)] rounded-full flex items-center justify-center flex-shrink-0">
            <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 md:pt-6 p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
          <Input
            label="Full Name"
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            onBlur={() => handleBlur('customerName')}
            error={touched.customerName ? errors.customerName : undefined}
            required
            placeholder="Enter your full name"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            onBlur={() => handleBlur('customerPhone')}
            error={touched.customerPhone ? errors.customerPhone : undefined}
            required
            placeholder="03XX-XXXXXXX or +92XXXXXXXXXX"
            helperText="Format: 03XX-XXXXXXX or +92XXXXXXXXXX"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            onBlur={() => handleBlur('customerEmail')}
            error={touched.customerEmail ? errors.customerEmail : undefined}
            required
            placeholder="your.email@example.com"
          />

          <Button
            type="submit"
            className="w-full py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Processing...' : isMobile && onFormSubmit ? 'Continue' : 'Complete Booking'}
          </Button>
          
          <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
            By booking, you agree to our terms and conditions
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
