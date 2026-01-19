/**
 * URL utility functions for generating booking URLs
 * Supports both client and server-side rendering
 * Uses environment variables for production deployment
 */

/**
 * Get the base URL for the application
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL (environment variable for production)
 * 2. window.location.origin (client-side fallback)
 * 3. http://localhost:3000 (server-side fallback for development)
 */
export function getBaseUrl(): string {
  // Check for environment variable first (production)
  // NEXT_PUBLIC_* variables are available on both client and server in Next.js
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side fallback (development only)
  // In production, NEXT_PUBLIC_BASE_URL should always be set
  return 'http://localhost:3000';
}

/**
 * Generate a booking URL for a given ground ID
 * @param groundId - The ID of the ground
 * @returns The full booking URL
 */
export function getBookingUrl(groundId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/booking/${groundId}`;
}

/**
 * Get the base URL for API routes (if needed in future)
 * @returns The base URL for API calls
 */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}
