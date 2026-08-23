'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Briefcase,
  PoundSterling,
  CalendarCheck,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { useBusinessDashboard } from '@/hooks/useBusinessDashboard';
import { User } from '@/types/auth.types';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BusinessAdminDashboardProps {
  initialUser?: User | null;
}

export function BusinessAdminDashboard({ initialUser }: BusinessAdminDashboardProps) {
  const {
    totalCompanyRevenuePounds,
    activeTeamMembersCount,
    activeBookingsCount,
    formatCurrency,
    roster,
    schedule,
    stripeConnectionStatus,
    connectedTradersCount,
    launchPayoutPortal,
    isLaunchingPortal,
    isLoading,
    isFetching,
    refetchAll,
  } = useBusinessDashboard();

  const getStatusBadge = (status: string) => {
    const st = status.toUpperCase();
    switch (st) {
      case 'CONFIRMED':
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[11px]">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[11px]">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[11px]">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-border text-muted-foreground bg-accent/20 text-[11px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 pb-10 select-none">
      {/* 1. EXECUTIVE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10 font-medium">
              <Building2 className="h-3.5 w-3.5 mr-1" /> Business Executive Portal
            </Badge>
            <span className="text-xs text-muted-foreground">• {initialUser?.name || 'Trade Agency'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Executive Overview Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time agency revenue metrics, technician roster overview, travel buffer monitors, and company Stripe payouts.
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
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* 2. COMPANY EXECUTIVE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Total Company Revenue (£) */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Company Revenue (£)
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-32 bg-muted/40" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
                    {formatCurrency(totalCompanyRevenuePounds)}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-emerald-400/90 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Sum of completed job payments
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <PoundSterling className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Active Team Members */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md hover:border-blue-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Team Members
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-muted/40" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
                    {activeTeamMembersCount}
                  </span>
                  <span className="text-xs text-muted-foreground">Technicians</span>
                </div>
              )}
              <p className="text-[11px] text-blue-400 flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> {connectedTradersCount} Stripe Onboarded
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Users className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Company Active Bookings */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md hover:border-indigo-500/40 transition-all sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Company Active Bookings
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-muted/40" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
                    {activeBookingsCount}
                  </span>
                  <span className="text-xs text-muted-foreground">Upcoming Jobs</span>
                </div>
              )}
              <p className="text-[11px] text-indigo-400 flex items-center gap-1">
                <CalendarCheck className="h-3 w-3" /> Agency dispatch pipeline
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Calendar className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. BUSINESS STRIPE PAYOUTS BANNER */}
      <Card className="border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-amber-950/20 backdrop-blur-sm shadow-md overflow-hidden">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Stripe Express Payout Portal</h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0 font-medium ${
                    stripeConnectionStatus === 'FULLY_CONNECTED'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  }`}
                >
                  {stripeConnectionStatus === 'FULLY_CONNECTED' ? 'Active' : 'Pending'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review payouts, manage bank accounts, and launch the Stripe portal on the dedicated payouts page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => launchPayoutPortal()}
              disabled={isLaunchingPortal}
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-9 px-4"
            >
              {isLaunchingPortal ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Launching...
                </>
              ) : (
                <>
                  Launch Portal <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
            <Link href="/business/payouts">
              <Button variant="outline" size="sm" className="h-9 text-xs border-border/50">
                View Payouts Page <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 4. TEAM MEMBER ROSTER PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" /> Team Member Roster
            </h2>
            <p className="text-xs text-muted-foreground">Active technicians operating under this business agency.</p>
          </div>
          <Link href="/business/team">
            <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
              Full Roster Page <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40">
                <TableHead className="text-xs font-semibold text-muted-foreground">Technician Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Specialization</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Operating Zone</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Active Load</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="border-border/30">
                    <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto bg-muted/40" /></TableCell>
                  </TableRow>
                ))
              ) : roster.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                    No team members found.
                  </TableCell>
                </TableRow>
              ) : (
                roster.slice(0, 3).map((member) => (
                  <TableRow key={member.id} className="border-border/30 hover:bg-muted/20">
                    <TableCell className="font-semibold text-xs text-foreground">{member.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {member.specialization}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] font-mono">
                        <MapPin className="h-2.5 w-2.5 mr-1" /> {member.operatingPostcodeZone}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center font-bold">
                      <Badge variant="outline" className="text-[10px]">
                        {member.activeJobLoad} Jobs
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* 5. SCHEDULE PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" /> Upcoming Schedule & Travel Buffer Gap
            </h2>
            <p className="text-xs text-muted-foreground">Agency bookings with mandatory 30-minute travel gaps.</p>
          </div>
          <Link href="/business/bookings">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300">
              Full Schedule Page <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40">
                <TableHead className="text-xs font-semibold text-muted-foreground">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Technician</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Travel Buffer Gap</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="border-border/30">
                    <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto bg-muted/40" /></TableCell>
                  </TableRow>
                ))
              ) : schedule.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                    No active agency bookings scheduled.
                  </TableCell>
                </TableRow>
              ) : (
                schedule.slice(0, 3).map((item) => (
                  <TableRow key={item.id} className="border-border/30 hover:bg-muted/20">
                    <TableCell className="font-semibold text-xs text-foreground">{item.customerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.assignedTechnicianName}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-[10px] font-mono">
                        <Clock className="h-2.5 w-2.5 mr-1" /> +30m Gap (to {item.formattedBufferEndTime})
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {getStatusBadge(item.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default BusinessAdminDashboard;
