'use client';

import React from 'react';
import { OverallStats } from './OverallStats';
import { GroundsOverview } from './GroundsOverview';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Statistics</h2>
        <OverallStats />
      </div>

      {/* Grounds Overview */}
      <div>
        <GroundsOverview />
      </div>
    </div>
  );
};
