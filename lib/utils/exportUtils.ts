/**
 * Export utilities for bookings data
 */

import { Booking } from '@/lib/types';
import { formatDateShort, formatTimeRange } from './dateUtils';

/** Row shape for table-style export (e.g. admin bookings history) */
export type ExportTableRow = Record<string, string | number>;

export const exportTableToCSV = (rows: ExportTableRow[], filename: string): void => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${String(row[h] ?? '')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTableToJSON = (rows: ExportTableRow[], filename: string): void => {
  const jsonContent = JSON.stringify(rows, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (bookings: Booking[], groundName: string): void => {
  const headers = ['Date', 'Time', 'Customer Name', 'Phone', 'Email', 'Hours', 'Amount (Rs.)'];
  
  const rows = bookings.map(booking => [
    formatDateShort(booking.date),
    formatTimeRange(booking.startTime, booking.endTime),
    booking.customerName,
    booking.customerPhone,
    booking.customerEmail,
    booking.hours.toString(),
    booking.totalPrice.toString(),
  ]);

  const csvContent = [
    `Ground: ${groundName}`,
    `Export Date: ${new Date().toLocaleDateString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `bookings-${groundName}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (bookings: Booking[], groundName: string): void => {
  const data = {
    groundName,
    exportDate: new Date().toISOString(),
    totalBookings: bookings.length,
    bookings: bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      time: `${booking.startTime}:00 - ${booking.endTime}:00`,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      hours: booking.hours,
      totalPrice: booking.totalPrice,
    })),
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `bookings-${groundName}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
