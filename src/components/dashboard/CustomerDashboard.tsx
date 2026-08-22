'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  User,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  PlayCircle,
  Clock3,
  CalendarPlus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { bookingService } from '@/services/booking.service';
import { Booking, BookingStatus } from '@/types/api.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CustomerDashboard() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fallback demo bookings for customers when API backend data is not populated
  const demoCustomerBookings: Booking[] = [
    {
      id: 'cb-201',
      traderId: 'trader-123',
      customerName: user?.name || 'Customer User',
      customerPhone: user?.phone || '+447700900077',
      customerEmail: user?.email || 'customer@example.com',
      address: '12 Baker Street, Marylebone',
      postcode: 'NW1 6XE',
      serviceDescription: 'Boiler Inspection & Gas Safety Certificate',
      startTime: new Date(Date.now() + 86400 * 1000 * 2).toISOString(),
      endTime: new Date(Date.now() + 86400 * 1000 * 2 + 3600 * 1000 * 2).toISOString(),
      feeAmount: 50.0,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cb-202',
      traderId: 'trader-456',
      customerName: user?.name || 'Customer User',
      customerPhone: user?.phone || '+447700900077',
      customerEmail: user?.email || 'customer@example.com',
      address: '45 Oxford Road',
      postcode: 'W1D 1BS',
      serviceDescription: 'Emergency Radiator Leak & Valve Replacement',
      startTime: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
      endTime: new Date(Date.now() - 86400 * 1000 * 4 + 3600 * 1000 * 3).toISOString(),
      feeAmount: 85.0,
      paymentStatus: 'PAID',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Query bookings from backend
  const { data, isLoading } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () =>
      bookingService.getTraderBookings({
        traderId: 'trader-123', // Default trader query
        page: 1,
        limit: 10,
      }),
    enabled: Boolean(user),
  });

  const rawBookings = data?.data && data.data.length > 0 ? data.data : demoCustomerBookings;

  // Filter customer bookings based on search & status
  const filteredBookings = rawBookings.filter((b) => {
    const matchesSearch =
      b.serviceDescription.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.postcode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingCount = rawBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'PENDING').length;
  const completedCount = rawBookings.filter((b) => b.status === 'COMPLETED').length;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Confirmed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive" className="bg-red-500/15 text-red-400 border-red-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };

  const formatTimeRange = (startIso: string, endIso: string) => {
    try {
      const start = parseISO(startIso);
      const end = parseISO(endIso);
      return `${format(start, 'MMM dd, yyyy • HH:mm')} - ${format(end, 'HH:mm')}`;
    } catch {
      return `${startIso} - ${endIso}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Customer Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
              <Sparkles className="h-3 w-3 mr-1" /> Customer Portal
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name || 'Valued Customer'}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your scheduled trade services, review appointment statuses, and book reliable trade professionals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/book/trader-123"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <CalendarPlus className="h-4 w-4" />
            Book a Trader Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Appointments</p>
              <p className="text-2xl font-bold text-foreground">{rawBookings.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Upcoming & Active</p>
              <p className="text-2xl font-bold text-emerald-400">{upcomingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed Jobs</p>
              <p className="text-2xl font-bold text-purple-400">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Bookings Timeline */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">My Service Bookings</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Overview of your upcoming and completed trade service appointments
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search service / location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                <SelectTrigger className="w-[130px] h-9 text-xs bg-background/50">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading your bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
              <Sparkles className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold">No bookings found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                You haven't scheduled any trade appointments yet, or no bookings match your current filter.
              </p>
              <Link
                href="/book/trader-123"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-md hover:bg-primary/90"
              >
                <CalendarPlus className="h-4 w-4" />
                Book Your First Trader
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 sm:p-5 rounded-xl border border-border/50 bg-background/40 hover:bg-background/70 transition-all shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{booking.serviceDescription}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <Badge variant="outline" className="w-fit text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                      Fee: £{booking.feeAmount} ({booking.paymentStatus})
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 font-mono">DATE & TIME</p>
                        <p className="font-medium text-foreground">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 font-mono">LOCATION</p>
                        <p className="font-medium text-foreground">{booking.address}, {booking.postcode}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 font-mono">CONTACT PERSON</p>
                        <p className="font-medium text-foreground">{booking.customerName} ({booking.customerPhone})</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
