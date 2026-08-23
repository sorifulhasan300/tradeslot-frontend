"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Percent,
  RefreshCw,
  ArrowRight,
  Building2,
  PoundSterling,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { Booking, Payment } from "@/types/api.types";
import { User } from "@/types/auth.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardProps {
  initialUser?: User | null;
}

export interface TraderNetworkItem {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  stripeAccountId?: string | null;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  dailyWorkAreas?: Array<{
    id?: string;
    postcodeOrCity?: string;
    radiusMiles?: number;
  }>;
  createdAt?: string;
}

export function AdminDashboard({ initialUser }: AdminDashboardProps) {
  // 1. Fetch Registered Traders
  const {
    data: tradersRes,
    isLoading: isLoadingTraders,
    isFetching: isFetchingTraders,
    refetch: refetchTraders,
  } = useQuery({
    queryKey: ["admin-traders"],
    queryFn: () => authService.getTraders(),
  });

  // 2. Fetch System Bookings
  const {
    data: bookingsRes,
    isLoading: isLoadingBookings,
    isFetching: isFetchingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => bookingService.getAllBookings(),
  });

  // 3. Fetch Platform Payments
  const {
    data: paymentsRes,
    isLoading: isLoadingPayments,
    isFetching: isFetchingPayments,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => paymentService.getAllPayments(),
  });

  const traders: TraderNetworkItem[] = tradersRes?.data || [];
  const bookings: Booking[] = bookingsRes?.data || [];
  const payments: Payment[] = paymentsRes?.data || [];

  const getMoneyValue = (val: number | undefined | null): number => {
    if (val === undefined || val === null) return 0;
    return val > 500 ? val / 100 : val;
  };

  const formatMoney = (val: number | undefined | null): string => {
    const num = getMoneyValue(val);
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleRefreshAll = () => {
    refetchTraders();
    refetchBookings();
    refetchPayments();
    toast.info("Refreshed platform executive metrics");
  };

  // Metric Calculations
  const totalPlatformRevenue = payments.reduce(
    (sum, p) => sum + getMoneyValue(p.platformFee),
    0
  );
  const totalActiveTraders = traders.length;
  const totalSystemBookings = bookings.length;
  const connectedTradersCount = traders.filter((t) => Boolean(t.stripeAccountId)).length;
  const stripeConnectionRate =
    totalActiveTraders > 0 ? (connectedTradersCount / totalActiveTraders) * 100 : 0;

  const confirmedBookingsCount = bookings.filter(
    (b) => String(b.status).toUpperCase() === "CONFIRMED"
  ).length;

  return (
    <div className="space-y-8">
      {/* EXECUTIVE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/10">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Platform Executive Control Center
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Executive Overview Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            System-wide metric summary, platform application fee revenue, trader network onboarding, and audit portals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isFetchingTraders || isFetchingBookings || isFetchingPayments}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${
                isFetchingTraders || isFetchingBookings || isFetchingPayments ? "animate-spin" : ""
              }`}
            />
            Refresh Overview Data
          </Button>
        </div>
      </div>

      {/* EXECUTIVE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Revenue */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Platform Revenue (£)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  {formatMoney(totalPlatformRevenue)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" /> Application fee deductions
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <PoundSterling className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Active Traders */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Active Traders</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{totalActiveTraders}</span>
                <span className="text-xs text-muted-foreground">Specialists</span>
              </div>
              <p className="text-[11px] text-blue-400 flex items-center gap-1">
                <Users className="h-3 w-3" /> {connectedTradersCount} Stripe Onboarded
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total System Bookings */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total System Bookings</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{totalSystemBookings}</span>
                <span className="text-xs text-muted-foreground">Bookings</span>
              </div>
              <p className="text-[11px] text-indigo-400 font-medium">
                {confirmedBookingsCount} Confirmed Active
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connection Rate */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Stripe Connection Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-purple-400 font-mono">
                  {stripeConnectionRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Active payout onboarding
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <Percent className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEPARATE ADMIN MODULE NAVIGATION CARDS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Dedicated Platform Admin Portals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sub-Route 1: Trader Network Management */}
          <Card className="glass-card glass-card-hover flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[11px] border-primary/20 text-primary bg-primary/10">
                  Route: /admin/traders
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3">Trader Network Management</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Full directory of trade specialists, work zone coverage radius, and Stripe Express onboarding status.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered Traders:</span>
                  <span className="font-bold text-foreground">{traders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe Onboarded:</span>
                  <span className="font-bold text-emerald-400">{connectedTradersCount}</span>
                </div>
              </div>
              <Link
                href="/admin/traders"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-md hover:bg-primary/90 transition-colors"
              >
                Open Trader Network Page <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Sub-Route 2: System-wide Booking Audit */}
          <Card className="glass-card glass-card-hover flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Calendar className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[11px] border-primary/20 text-primary bg-primary/10">
                  Route: /admin/bookings
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3">System-wide Booking Audit</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Data table of all system appointments, status badges, customer contacts, deposit fees, and 30-min buffer gaps.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bookings:</span>
                  <span className="font-bold text-foreground">{bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Buffer:</span>
                  <span className="font-bold text-indigo-400">+30 min gap applied</span>
                </div>
              </div>
              <Link
                href="/admin/bookings"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-md hover:bg-primary/90 transition-colors"
              >
                Open Booking Audit Page <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Sub-Route 3: Platform Revenue Audit */}
          <Card className="glass-card glass-card-hover flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[11px] border-primary/20 text-primary bg-primary/10">
                  Route: /admin/revenue
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3">Platform Revenue Audit</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Ledger of gross customer payments, platform application fee deductions, and net trader payout transfers.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App Fee Revenue:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatMoney(totalPlatformRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ledger Transactions:</span>
                  <span className="font-bold text-foreground">{payments.length}</span>
                </div>
              </div>
              <Link
                href="/admin/revenue"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-md hover:bg-primary/90 transition-colors"
              >
                Open Revenue Audit Page <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
