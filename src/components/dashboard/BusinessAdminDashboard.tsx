'use client';

import React from 'react';
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
  AlertCircle,
  PoundSterling,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  ArrowUpRight,
  Filter,
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
import { Input } from '@/components/ui/input';
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
    totalRosterCount,
    rosterSearch,
    setRosterSearch,
    schedule,
    totalScheduleCount,
    scheduleSearch,
    setScheduleSearch,
    scheduleStatusFilter,
    setScheduleStatusFilter,
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
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10 text-[11px]">
            Cancelled
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
              <Building2 className="h-3.5 w-3.5 mr-1" /> Business Agency Portal
            </Badge>
            <span className="text-xs text-muted-foreground">• {initialUser?.name || 'Trade Agency'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business Executive Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time agency revenue metrics, technician roster & dispatch, travel buffer monitors, and company Stripe payouts.
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

      {/* 3. BUSINESS STRIPE PAYOUTS ACTION CARD */}
      <div id="payouts">
        <Card className="border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-amber-950/20 backdrop-blur-sm shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    Business Stripe Payouts Portal
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Manage agency payouts, inspect bank transfer status, and launch the Stripe Express portal.
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
                  ? '⚡ Stripe Connection Pending'
                  : '⚠ Stripe Setup Required'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Agency payouts are dispatched automatically via Stripe Express. Launch the official portal to review bank account details, payout schedules, and tax documents for your trade business.
            </p>
            <Button
              onClick={() => launchPayoutPortal()}
              disabled={isLaunchingPortal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-10 px-5 shrink-0 shadow-md shadow-amber-600/20"
            >
              {isLaunchingPortal ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Launching Portal...
                </>
              ) : (
                <>
                  Launch Payout Portal <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 4. TEAM MEMBER ROSTER & DISPATCH TABLE */}
      <div id="roster" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" /> Team Member Roster & Dispatch Table
            </h2>
            <p className="text-xs text-muted-foreground">
              Company traders/technicians with their specialization, current daily operating postcode zone, and job load.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-64">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search technician or postcode..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="pl-8 text-xs h-8 bg-background/50 border-border/40"
              />
            </div>
          </div>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Technician Name</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Specialization</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Operating Postcode Zone</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Active Job Load</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Completed Jobs</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Stripe Payout Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="border-border/30">
                      <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto bg-muted/40" /></TableCell>
                    </TableRow>
                  ))
                ) : roster.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                      No company team members found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  roster.map((member) => (
                    <TableRow key={member.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium text-xs text-foreground">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            {member.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{member.email}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={member.specialization}>
                            {member.specialization}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 font-mono text-[11px]">
                          <MapPin className="h-3 w-3 mr-1 text-blue-400" /> {member.operatingPostcodeZone}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-center font-bold">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 ${
                            member.activeJobLoad > 0
                              ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                              : 'border-border text-muted-foreground bg-accent/20'
                          }`}
                        >
                          {member.activeJobLoad} Jobs
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-center font-mono font-medium text-muted-foreground">
                        {member.completedJobsCount}
                      </TableCell>

                      <TableCell className="text-xs text-right">
                        {member.stripeConnected ? (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Onboarded
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px]">
                            Pending Setup
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* 5. COMPANY SCHEDULE & BUFFER GAP MONITOR */}
      <div id="schedule" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" /> Company Schedule & Travel Buffer Gap Monitor
            </h2>
            <p className="text-xs text-muted-foreground">
              Agency-wide bookings with customer details, assigned technician, mandatory 30-min travel buffer gap, and payment status.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search customer or technician..."
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                className="pl-8 text-xs h-8 bg-background/50 border-border/40"
              />
            </div>

            <div className="flex items-center gap-1 border border-border/40 rounded-lg p-0.5 bg-background/50">
              {['ALL', 'CONFIRMED', 'PAID'].map((st) => (
                <Button
                  key={st}
                  variant={scheduleStatusFilter === st ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setScheduleStatusFilter(st)}
                  className="h-7 text-[11px] px-2.5"
                >
                  {st === 'ALL' ? 'All' : st === 'CONFIRMED' ? 'Confirmed' : 'Paid'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Customer Details</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Assigned Technician</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Job Timeline</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Mandatory Travel Buffer</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Booking Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="border-border/30">
                      <TableCell><Skeleton className="h-4 w-32 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 bg-muted/40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 ml-auto bg-muted/40" /></TableCell>
                    </TableRow>
                  ))
                ) : schedule.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                      No agency bookings found matching the current schedule filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedule.map((item) => (
                    <TableRow key={item.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                      {/* Customer Details */}
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.customerName}</span>
                          <span className="text-[11px] text-muted-foreground">{item.customerPhone}</span>
                          {item.customerEmail && (
                            <span className="text-[10px] text-muted-foreground/80">{item.customerEmail}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Assigned Technician */}
                      <TableCell className="text-xs font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>{item.assignedTechnicianName}</span>
                        </div>
                      </TableCell>

                      {/* Job Timeline */}
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground font-mono">
                            {item.formattedStartTime} - {item.formattedEndTime}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.startTime).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Mandatory 30-min Travel Buffer Gap */}
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className="border-purple-500/30 text-purple-300 bg-purple-500/10 text-[11px] font-mono"
                        >
                          <Clock className="h-3 w-3 mr-1 text-purple-400" />
                          +30m Gap (to {item.formattedBufferEndTime})
                        </Badge>
                      </TableCell>

                      {/* Booking Status */}
                      <TableCell className="text-xs">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="text-xs text-right">
                        {item.isPaid ? (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> PAID
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 font-semibold text-[11px]">
                            UNPAID
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BusinessAdminDashboard;
