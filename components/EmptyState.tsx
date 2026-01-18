'use client';

import React from 'react';
import { Card, CardContent } from './ui/Card';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Card className="shadow-lg border-2 border-gray-200">
      <CardContent>
        <div className="text-center py-12">
          {icon && (
            <div className="mb-4 flex justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {action.label}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
