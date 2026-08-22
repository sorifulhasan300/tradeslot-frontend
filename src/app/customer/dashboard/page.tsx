'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Header } from '@/components/shared/Header';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { Loader2 } from 'lucide-react';

export default function CustomerDashboardPage() {
  const { checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl">
        <CustomerDashboard />
      </main>
    </div>
  );
}
