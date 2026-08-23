'use client';

import React from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  MapPin,
  Briefcase,
  RefreshCw,
  UserCheck,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
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

export function BusinessTeamView() {
  const {
    roster,
    totalRosterCount,
    rosterSearch,
    setRosterSearch,
    connectedTradersCount,
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
            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10 font-medium">
              <Users className="h-3.5 w-3.5 mr-1" /> Team Management
            </Badge>
            <span className="text-xs text-muted-foreground">• {totalRosterCount} Registered Members</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team Member Roster & Dispatch Table
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage company technicians, view specializations, track operating postcode coverage, and monitor active job dispatch loads.
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
            Refresh Roster
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total Technicians</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalRosterCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Stripe Express Active</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{connectedTradersCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Active Dispatch Jobs</p>
              <p className="text-2xl font-bold text-indigo-400 mt-0.5">
                {roster.reduce((acc, m) => acc + m.activeJobLoad, 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Table */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-md">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Technician Network</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Filter by technician name, specialization, or assigned postcode zone.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search technician name, trade, or zone..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              className="pl-8 text-xs h-8 bg-background/50 border-border/40"
            />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Technician Name & Contact</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Specialization</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Operating Postcode Zone</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Active Job Load</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Completed Jobs</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Stripe Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-border/30">
                    <TableCell><Skeleton className="h-4 w-32 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto bg-muted/40" /></TableCell>
                  </TableRow>
                ))
              ) : roster.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-xs text-muted-foreground">
                    No team members match your current filter criteria.
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
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {member.email}
                        </span>
                        {member.phone && member.phone !== 'N/A' && (
                          <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {member.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[220px]" title={member.specialization}>
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
                        {member.activeJobLoad} Active Jobs
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-center font-mono font-medium text-muted-foreground">
                      {member.completedJobsCount}
                    </TableCell>

                    <TableCell className="text-xs text-right">
                      {member.stripeConnected ? (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Express Onboarded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px]">
                          Pending Onboarding
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
  );
}

export default BusinessTeamView;
