'use client';

import React from 'react';
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  PoundSterling,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useBusinessDashboard } from '@/hooks/useBusinessDashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function BusinessPayoutsView() {
  const {
    totalCompanyRevenuePounds,
    formatCurrency,
    stripeConnectionStatus,
    connectedTradersCount,
    totalRosterCount,
    launchPayoutPortal,
    isLaunchingPortal,
    isLoading,
    isFetching,
    refetchAll,
  } = useBusinessDashboard();

  return (
    <div className="space-y-6 pb-10 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10 font-medium">
              <CreditCard className="h-3.5 w-3.5 mr-1" /> Stripe Express Management
            </Badge>
            <span className="text-xs text-muted-foreground">• Agency Payout Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business Stripe Express Payouts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage company payouts, review gross & net agency earnings, inspect bank transfer status, and access the Stripe Express portal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={isFetching}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Payout Data
          </Button>
        </div>
      </div>

      {/* Primary Action Card */}
      <Card className="border-border/50 bg-gradient-to-r from-card/90 via-card/70 to-amber-950/20 backdrop-blur-sm shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  Trade Agency Payout Account
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Direct connection with Stripe Express Custom Onboarding & Automated Payout Engine.
                </CardDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-xs px-3 py-1 font-semibold ${
                stripeConnectionStatus === 'FULLY_CONNECTED'
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : stripeConnectionStatus === 'PARTIALLY_CONNECTED'
                  ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
              }`}
            >
              {stripeConnectionStatus === 'FULLY_CONNECTED'
                ? '✓ Stripe Express Active'
                : stripeConnectionStatus === 'PARTIALLY_CONNECTED'
                ? '⚡ Onboarding Pending'
                : '⚠ Action Required'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background/50 border border-border/30 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Completed Job Earnings</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                {isLoading ? <Skeleton className="h-8 w-28 bg-muted/40" /> : formatCurrency(totalCompanyRevenuePounds)}
              </p>
              <p className="text-[11px] text-muted-foreground">Sum of settled customer booking payments</p>
            </div>

            <div className="p-4 rounded-xl bg-background/50 border border-border/30 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Onboarded Technicians</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {isLoading ? <Skeleton className="h-8 w-20 bg-muted/40" /> : `${connectedTradersCount} / ${totalRosterCount}`}
              </p>
              <p className="text-[11px] text-muted-foreground">Team members registered for Stripe payouts</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Launch the official Stripe Express Portal to inspect payout schedules, change linked business bank accounts, view instant payouts, or download official tax documentation.
            </p>

            <Button
              onClick={() => launchPayoutPortal()}
              disabled={isLaunchingPortal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-11 px-6 shrink-0 shadow-md shadow-amber-600/20"
            >
              {isLaunchingPortal ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Launching Portal...
                </>
              ) : (
                <>
                  Launch Express Payout Portal <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BusinessPayoutsView;
