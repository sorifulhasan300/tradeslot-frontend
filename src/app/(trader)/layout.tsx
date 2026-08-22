'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Loader2 } from 'lucide-react';

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user && user.role === 'CUSTOMER') {
      router.replace('/customer/dashboard');
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  if (!mounted || isLoading || !isAuthenticated || user?.role === 'CUSTOMER') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
