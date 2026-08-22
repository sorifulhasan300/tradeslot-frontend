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
  CalendarPlus,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
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

  // Fallback demo bookings for customer experience when backend is empty
  const demoCustomerBookings: Booking[] = [
    {
      id: 'cb-201',
      traderId: 'trader-123',
      customerName: user?.name || 'Alex Morgan',
      customerPhone: user?.phone || '+447700900077',
      customerEmail: user?.email || 'customer@example.com',
      address: '12 Baker Street, Marylebone',
      postcode: 'NW1 6XE',
      serviceDescription: 'Boiler Inspection & Gas Safety Certificate',
      startTime: new Date(Date.now() + 86400 * 1000 * 2).toISOString(),
      endTime: new Date(Date.now() + 86400 * 1000 * 2 + 3600 * 1000 * 2).toISOString(),
      feeAmount: 75.0,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cb-202',
      traderId: 'trader-456',
      customerName: user?.name || 'Alex Morgan',
      customerPhone: user?.phone || '+447700900077',
      customerEmail: user?.email || 'customer@example.com',
      address: '45 Oxford Road, Soho',
      postcode: 'W1D 1BS',
      serviceDescription: 'Emergency Radiator Leak & Valve Replacement',
      startTime: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
      endTime: new Date(Date.now() - 86400 * 1000 * 3 + 3600 * 1000 * 3).toISOString(),
      feeAmount: 120.0,
      paymentStatus: 'PAID',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cb-203',
      traderId: 'trader-789',
      customerName: user?.name || 'Alex Morgan',
      customerPhone: user?.phone || '+447700900077',
      customerEmail: user?.email || 'customer@example.com',
      address: '88 Kensington High St',
      postcode: 'W8 5SA',
      serviceDescription: 'EV Charger Point Installation Audit',
      startTime: new Date(Date.now() + 86400 * 1000 * 5).toISOString(),
      endTime: new Date(Date.now() + 86400 * 1000 * 5 + 3600 * 1000 * 2).toISOString(),
      feeAmount: 50.0,
      paymentStatus: 'UNPAID',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Fetch customer bookings from backend service
  const { data, isLoading } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () =>
      bookingService.getTraderBookings({
        traderId: 'trader-123',
        page: 1,
        limit: 10,
      }),
    enabled: Boolean(user),
  });

  const rawBookings = data?.data && data.data.length > 0 ? data.data : demoCustomerBookings;

  const filteredBookings = rawBookings.filter((b) => {
    const matchesSearch =
      b.serviceDescription.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.postcode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const scheduledCount = rawBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length;
  const pendingCount = rawBookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = rawBookings.filter((b) => b.status === 'COMPLETED').length;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Scheduled</Badge>;
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
              <Sparkles className="h-3 w-3 mr-1" /> Customer Dashboard
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name || 'Valued Customer'}!
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your service appointments, track status updates, and connect with traders.
          </p>
        </div>

        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0"
        >
          <CalendarPlus className="h-4 w-4" />
          Book New Service
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid: Overview Cards & Quick Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Overview Cards (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Clock3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-emerald-400">{scheduledCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-purple-400">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. "Book New Service" Quick Action Card (1 col) */}
        <Card className="lg:col-span-1 border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card/40 backdrop-blur-sm shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Quick Action</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Book a verified trade professional with real-time buffer scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Verified & Stripe Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Instant Travel Buffer Gap Checks</span>
              </div>
            </div>

            <Link
              href="/book"
              className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/90 transition-all gap-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Book New Service
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Activity & Active Bookings List */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Active & Recent Service Activity</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  View appointment schedules and trader contact details
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter bookings..."
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
                  <SelectItem value="CONFIRMED">Scheduled</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
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
              <span className="text-xs">Loading activity...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
              <Sparkles className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold">No bookings found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                No active bookings match your search query. Start by booking a trader service.
              </p>
              <Link
                href="/book"
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
                  {/* Top Bar: Description, Status & Fee */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{booking.serviceDescription}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <Badge variant="outline" className="w-fit text-emerald-400 border-emerald-500/20 bg-emerald-500/5 text-xs">
                      Fee: £{booking.feeAmount} ({booking.paymentStatus})
                    </Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 font-mono">APPOINTMENT TIME</p>
                        <p className="font-medium text-foreground">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 font-mono">JOB ADDRESS</p>
                        <p className="font-medium text-foreground">{booking.address}, {booking.postcode}</p>
                      </div>
                    </div>

                    {/* Trader Contact Details */}
                    <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1 p-2 rounded-lg bg-card/60 border border-border/30">
                      <User className="h-4 w-4 text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground/80 font-mono">ASSIGNED TRADER</p>
                        <p className="font-medium text-foreground truncate">TradeSlot Professional #{booking.traderId.slice(-4)}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5 text-emerald-400" /> {booking.customerPhone}</span>
                          <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5 text-blue-400" /> Contact</span>
                        </div>
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
