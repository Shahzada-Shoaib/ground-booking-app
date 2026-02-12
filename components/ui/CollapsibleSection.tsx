'use client';

import React, { ReactNode } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  icon,
  className = '',
}) => {
  return (
    <div className={`border-2 border-[var(--border)] rounded-xl overflow-hidden shadow-md ${className}`}>
      {/* Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-4 bg-[var(--muted)] hover:bg-[var(--gray-200)] dark:hover:bg-[var(--gray-700)] transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-[var(--primary-100)] dark:bg-[var(--primary-900)] rounded-lg flex items-center justify-center text-[var(--primary-500)] dark:text-[var(--primary-400)]">
              {icon}
            </div>
          )}
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">{title}</h3>
        </div>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <FiChevronDown className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary-600)] transition-colors" />
        </div>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--card)]">
          {children}
        </div>
      </div>
    </div>
  );
};
