'use client';

import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--foreground)] mb-1"
        >
          {label}
          {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors min-h-[44px] bg-[var(--input)] text-[var(--foreground)] border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] ${
          error
            ? 'border-[var(--danger)] focus:ring-[var(--danger)]'
            : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{helperText}</p>
      )}
    </div>
  );
};
