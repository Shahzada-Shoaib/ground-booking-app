'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function AppShellBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-pattern-pitch relative">
      {/* Soft blobs for depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[min(100%,420px)] h-[min(100%,420px)] rounded-full bg-[#a3e635]/[0.06] blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-[#3b82f6]/[0.06] blur-[80px]" />
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
