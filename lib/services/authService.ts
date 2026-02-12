import apiService from '@/lib/utils/apiService';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  favoriteGrounds: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'admin' | 'customer';
  }): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{ user: User; token: string }>('/auth/register', data);
      
      if (response.success && response.data) {
        // Store token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      }
      
      throw new Error(response.error || 'Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });
      
      if (response.success && response.data) {
        // Store token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      }
      
      throw new Error(response.error || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // Check localStorage first
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            return JSON.parse(userStr);
          } catch {
            // Invalid JSON, continue to API call
          }
        }
      }

      // Fetch from API
      const response = await apiService.get<User>('/auth/me');
      if (response.success && response.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

