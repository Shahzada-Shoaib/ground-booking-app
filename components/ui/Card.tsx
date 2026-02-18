import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated' | 'accentTop';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 md:p-6',
    lg: 'p-4 sm:p-6 md:p-8',
  };

  const variantClasses = {
    default: 'bg-[var(--card)] border border-[var(--border)] backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20',
    bordered: 'bg-[var(--card)] border-2 border-[var(--border)] backdrop-blur-xl rounded-2xl',
    elevated: 'bg-[var(--card)] border border-[var(--border)] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30',
    accentTop: 'bg-[var(--card)] border border-[var(--border)] backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 relative overflow-hidden',
  };

  const hasAccentBar = variant === 'accentTop';

  return (
    <div
      className={`transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {hasAccentBar && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a3e635] via-[#84cc16] to-[#65a30d]" />
      )}
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-3 sm:p-4 md:p-6 pb-0 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    <h3 className={`text-xl font-semibold text-[var(--card-foreground)] ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return <div className={`p-3 sm:p-4 md:p-6 ${className}`}>{children}</div>;
};
