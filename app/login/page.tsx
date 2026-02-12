'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showSuccess('Login successful!');
        router.push('/');
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
        router.push('/');
      }
    } catch (error: any) {
      showError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-[var(--border)]">
        <CardHeader className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] text-white">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Login' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter your name"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your.email@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
              minLength={6}
            />
            {!isLogin && (
              <Input
                label="Phone (Optional)"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="03XX-XXXXXXX"
              />
            )}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

