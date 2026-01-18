/**
 * Validation utility functions
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Accepts formats: +92XXXXXXXXXX, 03XXXXXXXXX, 03XX-XXXXXXX
  const phoneRegex = /^(\+92|0)[0-9]{2,3}[-\s]?[0-9]{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateTimeRange = (startTime: number, endTime: number): boolean => {
  return startTime < endTime && startTime >= 0 && endTime <= 24;
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateBookingForm = (formData: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date?: string;
  startTime: number;
  endTime: number;
}): ValidationResult => {
  const errors: string[] = [];

  if (!validateName(formData.customerName)) {
    errors.push('Name must be between 2 and 50 characters');
  }

  if (!validatePhone(formData.customerPhone)) {
    errors.push('Please enter a valid phone number (e.g., 03XX-XXXXXXX or +92XXXXXXXXXX)');
  }

  if (!validateEmail(formData.customerEmail)) {
    errors.push('Please enter a valid email address');
  }

  if (!validateTimeRange(formData.startTime, formData.endTime)) {
    errors.push('Invalid time range selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
