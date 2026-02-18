'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showSuccess('Login successful!');
        router.push('/dashboard');
      } else {
        if (!formData.name) {
          showError('Name is required');
          setIsLoading(false);
          return;
        }
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
        });
        showSuccess('Registration successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      showError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Diagonal pitch-line pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            105deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.4) 80px,
            rgba(255,255,255,0.4) 81px
          )`,
        }}
      />

      {/* Bold background wordmark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span className="text-[clamp(6rem,18vw,14rem)] font-black text-white/[0.03] tracking-tighter leading-none">
          {isLogin ? 'PLAY' : 'JOIN'}
        </span>
      </div>

      {/* Accent blob */}
      <div className="absolute top-0 right-0 w-[min(100%,420px)] h-[min(100%,420px)] rounded-full bg-[#a3e635]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-[#3b82f6]/10 blur-[80px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-[400px]">
        {/* Asymmetric card with cut corner */}
        <div
          className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%, 0 0)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Accent bar top */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#a3e635] via-[#84cc16] to-[#65a30d]" />

          <div className="flex items-center gap-3 mb-6 mt-1">
            <div className="w-10 h-10 rounded-xl bg-[#a3e635]/20 flex items-center justify-center border border-[#a3e635]/30">
              <svg className="w-5 h-5 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Ground Booking</span>
              <p className="text-xs text-white/50">Book. Play. Repeat.</p>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg bg-white/[0.06] p-1 mb-6 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-[#a3e635] text-[#0c0c0e]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-[#a3e635] text-[#0c0c0e]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="text-xl font-semibold text-white mb-0.5">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-white/50 text-sm mb-5">
            {isLogin ? 'Sign in to continue' : 'One step away from booking'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Ali Ahmed"
                className="rounded-lg bg-white/[0.06] border-white/10 text-white placeholder:text-white/40 focus:ring-[#a3e635]/50 focus:border-[#a3e635]"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="rounded-lg bg-white/[0.06] border-white/10 text-white placeholder:text-white/40 focus:ring-[#a3e635]/50 focus:border-[#a3e635]"
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              minLength={6}
              className="rounded-lg bg-white/[0.06] border-white/10 text-white placeholder:text-white/40 focus:ring-[#a3e635]/50 focus:border-[#a3e635]"
            />
            {!isLogin && (
              <Input
                label="Phone (optional)"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="03XX-XXXXXXX"
                className="rounded-lg bg-white/[0.06] border-white/10 text-white placeholder:text-white/40 focus:ring-[#a3e635]/50 focus:border-[#a3e635]"
              />
            )}
            <Button
              type="submit"
              className="w-full rounded-lg h-12 text-base font-semibold mt-2 bg-[#a3e635] text-[#0c0c0e] hover:bg-[#bef264] border-0"
              isLoading={isLoading}
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-white/50">
            {isLogin ? (
              <>
                No account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-[#a3e635] hover:text-[#bef264]"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-[#a3e635] hover:text-[#bef264]"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-white/40">
          By continuing you agree to our terms & privacy.
        </p>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
