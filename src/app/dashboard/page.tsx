'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Header } from '@/components/shared/Header';
import { WorkAreaCard } from '@/components/dashboard/WorkAreaCard';
import { StripeConnectCard } from '@/components/dashboard/StripeConnectCard';
import { BookingScheduleList } from '@/components/dashboard/BookingScheduleList';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, checkAuth } = useAuthStore();
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

  // Role Guard: If logged-in user is a CUSTOMER, render Customer Dashboard view
  if (user?.role === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl">
          <CustomerDashboard />
        </main>
      </div>
    );
  }

  // Otherwise (TRADER role or default fallback), render existing Trader Dashboard view
  const traderId = user?.id || 'trader-123';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl">
        {/* Page Hero Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/5">
                <Sparkles className="h-3 w-3 mr-1" /> Trader Portal
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Trader Overview & Work Area Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure daily service radius, connect Stripe payouts, and manage job schedules with buffer gap indicators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book/trader-123"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-md hover:bg-primary/90 transition-all"
            >
              <Calendar className="h-4 w-4" />
              View Customer Booking Widget
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Work Zone & Stripe Status */}
          <div className="lg:col-span-1 space-y-6">
            <WorkAreaCard traderId={traderId} />
            <StripeConnectCard traderId={traderId} />
          </div>

          {/* Right Column: Main Booking Schedule & Travel Buffer List */}
          <div className="lg:col-span-2">
            <BookingScheduleList traderId={traderId} />
          </div>
        </div>
      </main>
    </div>
  );
}
