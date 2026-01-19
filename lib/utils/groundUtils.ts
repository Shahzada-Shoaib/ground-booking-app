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
    cricket: 'bg-green-100 text-green-800 border-green-300',
    padel: 'bg-blue-100 text-blue-800 border-blue-300',
    football: 'bg-purple-100 text-purple-800 border-purple-300',
    tennis: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    basketball: 'bg-orange-100 text-orange-800 border-orange-300',
    badminton: 'bg-pink-100 text-pink-800 border-pink-300',
    other: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[type] || colors.other;
};

export const GROUND_TYPES: GroundType[] = ['cricket', 'padel', 'football', 'tennis', 'basketball', 'badminton', 'other'];
