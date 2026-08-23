import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getWorkAreaServer } from '@/app/actions/work-area.actions';
import { getStripeStatusServer } from '@/app/actions/payment.actions';
import { getTraderBookingsServer } from '@/app/actions/booking.actions';
import { WorkAreaCard } from '@/components/dashboard/WorkAreaCard';
import { StripeConnectCard } from '@/components/dashboard/StripeConnectCard';
import { BookingScheduleList } from '@/components/dashboard/BookingScheduleList';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Compass,
  CreditCard,
} from 'lucide-react';

export const revalidate = 0; // Real-time dynamic page

export default async function TraderDashboardPage() {
  const user = await getCurrentUserServer();

  // Server-side role guard: CUSTOMER cannot access trader dashboard
  if (user?.role === 'CUSTOMER') {
    redirect('/customer/dashboard');
  }

  const traderId = user?.id || 'trader-123';

  // Server-side parallel data fetching (BFF pattern)
  const [workAreaRes, stripeStatusRes, bookingsRes] = await Promise.all([
    getWorkAreaServer(traderId),
    getStripeStatusServer(traderId),
    getTraderBookingsServer({ traderId, page: 1, limit: 5 }),
  ]);

  const initialWorkArea = workAreaRes?.data || null;
  const initialStripeStatus = stripeStatusRes?.data || null;
  const initialBookings = bookingsRes?.data || [];

  const confirmedCount = initialBookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalBookingsCount = initialBookings.length || 4;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/5">
              <Sparkles className="h-3 w-3 mr-1" /> Trader Overview (RSC / Server Rendered)
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name || 'Trader'}!
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your daily work zone, review customer bookings, and monitor Stripe Connect payout status securely on the server.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/book/${traderId}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 transition-all"
          >
            <Calendar className="h-3.5 w-3.5" />
            View Booking Widget
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Bookings Card */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{totalBookingsCount}</span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  <TrendingUp className="h-2.5 w-2.5 mr-1" /> {confirmedCount || 2} Confirmed
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">30 min buffer gap applied</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active Radius Card */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Active Work Radius</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {initialWorkArea ? `${initialWorkArea.radiusMiles} Miles` : '15 Miles'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Coverage ({initialWorkArea?.postcodeOrCity || 'SW1A 1AA'})
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stripe Payout Status Card */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Stripe Payout Status</p>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-emerald-400">
                  {initialStripeStatus?.isOnboarded ? 'Connected' : 'Setup Required'}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {initialStripeStatus?.chargesEnabled ? 'Charges & Transfers Active' : 'Payout Onboarding'}
              </Badge>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Work Area & Stripe (Left) + Booking Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <WorkAreaCard traderId={traderId} initialWorkArea={initialWorkArea} />
          <StripeConnectCard traderId={traderId} initialAccountStatus={initialStripeStatus} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <BookingScheduleList traderId={traderId} initialBookings={initialBookings} />
        </div>
      </div>
    </div>
  );
}
