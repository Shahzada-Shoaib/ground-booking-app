'use client';

import React from 'react';
import { OverallStats } from './OverallStats';
import { GroundsOverview } from './GroundsOverview';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Overall Statistics */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">Overall Statistics</h2>
        <OverallStats />
      </div>

      {/* Grounds Overview */}
      <div>
        <GroundsOverview />
      </div>
    </div>
  );
};
