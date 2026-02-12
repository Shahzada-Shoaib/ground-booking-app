import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

  const variants = {
    primary:
      'bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)]',
    secondary:
      'bg-[var(--gray-100)] text-[var(--gray-900)] hover:bg-[var(--gray-200)] dark:bg-[var(--gray-800)] dark:text-[var(--gray-100)] dark:hover:bg-[var(--gray-700)]',
    outline:
      'border-2 border-[var(--primary-600)] bg-transparent hover:bg-[var(--primary-600)] hover:text-white text-[var(--primary-600)]',
    ghost:
      'hover:bg-[var(--muted)] text-[var(--foreground)]',
    danger:
      'bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90',
    success:
      'bg-[var(--success)] text-white hover:bg-[var(--success)]/90',
    link:
      'text-[var(--primary-600)] underline-offset-4 hover:underline p-0',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
    icon: 'h-10 w-10 p-0',
  };

  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
          {size !== 'icon' && 'Loading...'}
        </>
      ) : (
        children
      )}
    </button>
  );
};
