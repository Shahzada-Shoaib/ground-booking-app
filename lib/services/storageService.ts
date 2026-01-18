/**
 * Storage Service - Abstraction layer for data persistence
 * Currently uses localStorage, can be easily replaced with database/API calls
 */

const STORAGE_KEYS = {
  GROUNDS: 'cricket_grounds',
  BOOKINGS: 'cricket_bookings',
} as const;

export class StorageService {
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
    }
  }

  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Ground-specific methods
  static getGrounds(): any[] {
    return this.get<any[]>(STORAGE_KEYS.GROUNDS) || [];
  }

  static saveGrounds(grounds: any[]): void {
    this.set(STORAGE_KEYS.GROUNDS, grounds);
  }

  // Booking-specific methods
  static getBookings(): any[] {
    return this.get<any[]>(STORAGE_KEYS.BOOKINGS) || [];
  }

  static saveBookings(bookings: any[]): void {
    this.set(STORAGE_KEYS.BOOKINGS, bookings);
  }
}
