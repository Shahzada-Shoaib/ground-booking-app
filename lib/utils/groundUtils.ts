import { GroundType } from '@/lib/types';

export const getGroundTypeLabel = (type: GroundType): string => {
  const labels: Record<GroundType, string> = {
    cricket: 'Cricket',
    padel: 'Padel Court',
    football: 'Football',
    tennis: 'Tennis',
    basketball: 'Basketball',
    badminton: 'Badminton',
    other: 'Other',
  };
  return labels[type] || 'Other';
};

export const getGroundTypeColor = (type: GroundType): string => {
  const colors: Record<GroundType, string> = {
    cricket: 'bg-[var(--primary-100)] text-[var(--primary-800)] border-[var(--primary-300)] dark:bg-[var(--primary-900)] dark:text-[var(--primary-100)]',
    padel: 'bg-[var(--accent-500)]/15 text-[var(--accent-600)] border-[var(--accent-500)]/30',
    football: 'bg-[var(--primary-200)] text-[var(--primary-900)] border-[var(--primary-400)] dark:bg-[var(--primary-800)] dark:text-[var(--primary-200)]',
    tennis: 'bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30',
    basketball: 'bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30',
    badminton: 'bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30',
    other: 'bg-[var(--gray-100)] text-[var(--gray-800)] border-[var(--gray-300)] dark:bg-[var(--gray-800)] dark:text-[var(--gray-100)]',
  };
  return colors[type] || colors.other;
};

export const GROUND_TYPES: GroundType[] = ['cricket', 'padel', 'football', 'tennis', 'basketball', 'badminton', 'other'];
