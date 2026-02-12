'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Hide bottom navigation on booking pages (customer-facing pages)
  if (pathname?.startsWith('/booking')) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Bookings',
      path: '/admin/bookings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'New Ground',
      path: '/admin/grounds/new',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--card)] border-t-2 border-[var(--border)] shadow-lg safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full min-h-[44px] px-2 py-1
                transition-all duration-200 active:scale-95
                ${active
                  ? 'text-[var(--primary-600)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }
              `}
              aria-label={item.label}
            >
              <div className={`
                mb-1 transition-transform duration-200
                ${active ? 'scale-110' : 'scale-100'}
              `}>
                {item.icon}
              </div>
              <span className={`
                text-[10px] font-semibold leading-tight
                ${active ? 'text-[var(--primary-600)]' : 'text-[var(--muted-foreground)]'}
              `}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[var(--primary-600)] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

