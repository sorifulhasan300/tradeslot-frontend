'use client';

import React from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  Filter,
  ShieldCheck,
  AlertCircle,
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

import { NumericPagination } from '@/components/shared/NumericPagination';

export function BusinessBookingsView() {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const {
    schedule,
    totalScheduleCount,
    scheduleSearch,
    setScheduleSearch,
    scheduleStatusFilter,
    setScheduleStatusFilter,
    isLoading,
    isFetching,
    refetchAll,
  } = useBusinessDashboard();

  const paginatedSchedule = schedule.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(schedule.length / pageSize) || 1;

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
    <div className="space-y-6 pb-10 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-medium">
              <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule & Buffer Monitor
            </Badge>
            <span className="text-xs text-muted-foreground">• {totalScheduleCount} Total Agency Bookings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Company Schedule & Buffer Gap Monitor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit agency-wide bookings with customer details, assigned technician, mandatory 30-min travel buffer gap verification, and payment status.
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
            Refresh Schedule
          </Button>
        </div>
      </div>

      {/* Buffer Gap Policy Card */}
      <Card className="border-purple-500/30 bg-purple-500/5 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-purple-300">Mandatory 30-Minute Travel Buffer Gap</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                TradeSlot enforces a mandatory 30-minute travel buffer after every technician job to prevent overlapping assignments across operating postcode zones.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 font-mono shrink-0">
            Rule: EndTime + 30m Buffer
          </Badge>
        </CardContent>
      </Card>

      {/* Filter & Schedule Table */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden shadow-md">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Agency Booking Ledger</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Filter by customer name, technician, or payment status.
            </CardDescription>
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
              {['ALL', 'CONFIRMED', 'PAID', 'UNPAID'].map((st) => (
                <Button
                  key={st}
                  variant={scheduleStatusFilter === st ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setScheduleStatusFilter(st)}
                  className="h-7 text-[11px] px-2.5"
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

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
                Array.from({ length: 4 }).map((_, i) => (
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
                  <TableCell colSpan={6} className="h-40 text-center text-xs text-muted-foreground">
                    No agency bookings match your current search and filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSchedule.map((item) => (
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

        {/* NUMERIC PAGINATION FOOTER */}
        <NumericPagination
          page={page}
          totalPages={totalPages}
          totalItems={schedule.length}
          itemName="agency bookings"
          onPageChange={(p) => setPage(p)}
          className="p-4 border-t border-border/40"
        />
      </Card>
    </div>
  );
}

export default BusinessBookingsView;
