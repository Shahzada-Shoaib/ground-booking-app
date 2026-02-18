'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';

export const UserMenu: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/'); // Redirect to login page (home)
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => router.push('/')}
        variant="outline"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-h-[44px] px-4 py-2 text-sm sm:text-base"
      >
        Login
      </Button>
    );
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px]"
        aria-label="User menu"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
          {userInitials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-white text-sm font-medium truncate max-w-[120px]">
            {user?.name || 'User'}
          </p>
          <p className="text-white/80 text-xs truncate max-w-[120px]">
            {user?.role === 'admin' ? 'Admin' : 'Customer'}
          </p>
        </div>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
              {user?.name}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {user?.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                router.push('/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-3 min-h-[44px]"
            >
              <svg
                className="w-5 h-5 text-[var(--muted-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>
            {user?.role === 'customer' && (
              <button
                onClick={() => {
                  router.push('/my-bookings');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-3 min-h-[44px]"
              >
                <svg
                  className="w-5 h-5 text-[var(--muted-foreground)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                My Bookings
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-sm text-[var(--danger)] hover:bg-[var(--muted)] transition-colors flex items-center gap-3 min-h-[44px]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

