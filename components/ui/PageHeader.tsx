'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  topContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, topContent }) => {
  return (
    <div className="bg-[var(--background)] border-b border-[var(--border)]">
      <div className="h-1 w-full bg-gradient-to-r from-[#a3e635] via-[#84cc16] to-[#65a30d]" />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            {topContent && <div className="mb-2">{topContent}</div>}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 break-words">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
