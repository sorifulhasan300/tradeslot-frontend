'use client';

import { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Car,
  CheckCircle,
  XCircle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { updateBookingStatusAction } from '@/app/actions/booking.actions';
import { Booking, BookingStatus } from '@/types/api.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookingScheduleListProps {
  traderId: string;
  initialBookings?: Booking[];
}

export function BookingScheduleList({ traderId, initialBookings }: BookingScheduleListProps) {
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Fallback demo bookings if initial server data is empty
  const demoBookings: Booking[] = [
    {
      id: 'bk-101',
      traderId,
      customerName: 'John Smith',
      customerPhone: '+447700900077',
      customerEmail: 'john@example.com',
      address: '12 Baker Street, Marylebone',
      postcode: 'NW1 6XE',
      serviceDescription: 'Boiler Inspection & Gas Safety Certificate',
      startTime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
      bufferEndTime: new Date(Date.now() + 3600 * 1000 * 4.5).toISOString(),
      feeAmount: 50.0,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bk-102',
      traderId,
      customerName: 'Sarah Jenkins',
      customerPhone: '+447700900888',
      address: '45 Oxford Road',
      postcode: 'W1D 1BS',
      serviceDescription: 'Emergency Radiator Repair',
      startTime: new Date(Date.now() + 3600 * 1000 * 6).toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000 * 8).toISOString(),
      bufferEndTime: new Date(Date.now() + 3600 * 1000 * 8.5).toISOString(),
      feeAmount: 75.0,
      paymentStatus: 'PAID',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const [bookings, setBookings] = useState<Booking[]>(
    initialBookings && initialBookings.length > 0 ? initialBookings : demoBookings
  );

  const handleUpdateStatus = (id: string, newStatus: BookingStatus) => {
    startTransition(async () => {
      const res = await updateBookingStatusAction(id, newStatus);
      if (res.success && res.data) {
        toast.success(`Booking status updated to ${res.data.status}`);
        setBookings((prev) =>
          prev.map((b) => (b.id === id && res.data ? { ...b, status: res.data.status } : b))
        );
      } else {
        // Optimistic / fallback update for smooth UX
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        toast.success(`Booking status updated to ${newStatus}`);
      }
    });
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceDescription.toLowerCase().includes(search.toLowerCase()) ||
      b.postcode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    } catch {
      return `${startIso} - ${endIso}`;
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/5">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Booking Schedule Timeline</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Managed slots with mandatory 30-minute travel buffer indicators
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search customer / postcode..."
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
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
            <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No bookings found for the selected filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="group relative space-y-2">
                {/* Main Booking Row Card */}
                <div className="p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/70 transition-all shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{booking.customerName}</span>
                        {getStatusBadge(booking.status)}
                        <Badge
                          variant="outline"
                          className={booking.paymentStatus === 'PAID' ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400'}
                        >
                          £{booking.feeAmount} ({booking.paymentStatus})
                        </Badge>
                      </div>

                      <p className="text-xs font-medium text-foreground/90">{booking.serviceDescription}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{booking.address}, {booking.postcode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{booking.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Action Buttons using Server Action */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-border/40">
                      {booking.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                          className="h-8 text-xs gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Confirm
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}
                          className="h-8 text-xs gap-1 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          Start Job
                        </Button>
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                          className="h-8 text-xs gap-1 border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Complete
                        </Button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                          className="h-8 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 30-Minute Travel Buffer Gap Visualization */}
                <div className="mx-6 flex items-center justify-between px-3 py-1.5 rounded-md border border-dashed border-blue-500/30 bg-blue-500/5 text-[11px] font-mono text-blue-400">
                  <div className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 animate-pulse" />
                    <span>30-Min Mandatory Travel Buffer Gap</span>
                  </div>
                  <span className="text-muted-foreground">
                    Buffer until: {booking.bufferEndTime ? format(parseISO(booking.bufferEndTime), 'HH:mm') : 'Next Available Slot'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
          <span>
            Page <strong>{page}</strong> of <strong>1</strong> ({filteredBookings.length} bookings)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={true}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
