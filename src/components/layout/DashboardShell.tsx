'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { User } from '@/types/auth.types';

interface DashboardShellProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function DashboardShell({ initialUser, children }: DashboardShellProps) {
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    if (initialUser && (!user || user.id !== initialUser.id || user.role !== initialUser.role)) {
      setAuth(initialUser);
    }
  }, [initialUser, user, setAuth]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">{children}</main>
      </div>
    </div>
  );
}
