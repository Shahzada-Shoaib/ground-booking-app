'use client';

import React, { useState } from 'react';
import { BookingFormData } from '@/lib/types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { validateBookingForm } from '@/lib/utils/validation';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
  selectedStartTime: number | null;
  selectedEndTime: number | null;
  selectedDate: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  isLoading = false,
  selectedStartTime,
  selectedEndTime,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  });

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

    onSubmit({
      ...formData,
      date: selectedDate,
      startTime: selectedStartTime!,
      endTime: selectedEndTime!,
    });
  };

  const isFormValid =
    formData.customerName.trim() &&
    formData.customerPhone.trim() &&
    formData.customerEmail.trim() &&
    Object.keys(errors).length === 0 &&
    selectedStartTime !== null &&
    selectedEndTime !== null;

  return (
    <Card className="border-2 border-green-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Your Information</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Step 3 of 3 - Almost done!</p>
          </div>
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
            {isLoading ? 'Processing...' : 'Complete Booking'}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            By booking, you agree to our terms and conditions
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
