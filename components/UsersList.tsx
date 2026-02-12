'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import apiService from '@/lib/utils/apiService';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  favoriteGrounds: string[];
  createdAt: string;
}

export const UsersList: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get<User[]>('/users');
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="shadow-xl border-2 border-[var(--border)]">
      <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)] p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">All Users</CardTitle>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">Manage and view user profiles</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Search and Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'customer')}
            className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--input)] text-[var(--foreground)] min-h-[44px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Users Found</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {searchTerm ? 'Try adjusting your search criteria' : 'No users registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 sm:p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary-500)] hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-[var(--foreground)] mb-1 truncate">{user.name}</h3>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1 sm:mb-2 truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{user.phone}</p>
                    )}
                  </div>
                  <span className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${
                    user.role === 'admin' 
                      ? 'bg-[var(--primary-100)] text-[var(--primary-700)] border border-[var(--primary-300)]'
                      : 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[var(--border)] gap-2">
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {user.favoriteGrounds.length} favorite{user.favoriteGrounds.length !== 1 ? 's' : ''}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/users/${user.id}`);
                    }}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] flex-shrink-0"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Total Users</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{users.length}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Admins</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Customers</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              {users.filter(u => u.role === 'customer').length}
            </p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-[var(--muted)] rounded-lg">
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-1">Showing</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{filteredUsers.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

