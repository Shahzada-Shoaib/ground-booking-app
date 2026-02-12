'use client';

import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

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
    <Card className="shadow-lg border-2 border-[var(--border)]">
      <CardContent>
        <div className="text-center py-12">
          {icon && (
            <div className="mb-4 flex justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">{description}</p>
          {action && (
            <Button
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
