'use client';

import React, { ReactNode } from 'react';

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
    <div className={`border-2 border-gray-200 rounded-xl overflow-hidden shadow-md ${className}`}>
      {/* Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              {icon}
            </div>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
