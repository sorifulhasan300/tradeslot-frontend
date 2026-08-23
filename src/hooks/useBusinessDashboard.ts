import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { bookingService } from '@/services/booking.service';
import { paymentService } from '@/services/payment.service';
import { Booking, Payment } from '@/types/api.types';

export interface RosterMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  operatingPostcodeZone: string;
  activeJobLoad: number;
  completedJobsCount: number;
  stripeConnected: boolean;
  stripeAccountId?: string | null;
}

export interface BusinessScheduleItem extends Booking {
  assignedTechnicianName: string;
  formattedStartTime: string;
  formattedEndTime: string;
  formattedBufferEndTime: string;
  isPaid: boolean;
}

export function useBusinessDashboard() {
  const [rosterSearch, setRosterSearch] = useState('');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<string>('ALL');

  // 1. Fetch Company Traders/Technicians Roster
  const {
    data: tradersRes,
    isLoading: isLoadingTraders,
    isFetching: isFetchingTraders,
    refetch: refetchTraders,
  } = useQuery({
    queryKey: ['business-traders'],
    queryFn: () => authService.getTraders(),
  });

  // 2. Fetch Agency Bookings
  const {
    data: bookingsRes,
    isLoading: isLoadingBookings,
    isFetching: isFetchingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['business-bookings'],
    queryFn: () => bookingService.getAllBookings(),
  });

  // 3. Fetch Agency Payments
  const {
    data: paymentsRes,
    isLoading: isLoadingPayments,
    isFetching: isFetchingPayments,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['business-payments'],
    queryFn: () => paymentService.getAllPayments(),
  });

  // Stripe Portal Launcher Mutation
  const launchPayoutPortalMutation = useMutation({
    mutationFn: async (traderId?: string) => {
      return paymentService.getStripeDashboard(traderId);
    },
    onSuccess: (res) => {
      const portalUrl = res.data?.url || res.data?.dashboardUrl;
      if (portalUrl) {
        toast.success('Redirecting to Stripe Express payout portal...');
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.info('Stripe Express portal generated. Opening Stripe Connect...');
        window.open('https://connect.stripe.com/express/oauth/authorize', '_blank');
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to open Stripe payout portal');
    },
  });

  const rawTraders = tradersRes?.data || [];
  const rawBookings: Booking[] = bookingsRes?.data || [];
  const rawPayments: Payment[] = paymentsRes?.data || [];

  // Helper for money values (pence vs pounds)
  const parsePounds = (amount?: number | null): number => {
    if (amount === undefined || amount === null) return 0;
    return amount > 500 ? amount / 100 : amount;
  };

  const formatCurrency = (amount?: number | null): string => {
    const num = parsePounds(amount);
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(num);
  };

  // 1. Company Executive Metrics
  // Total Company Revenue (£): Sum of all completed job payments for this business
  const totalCompanyRevenuePounds = rawBookings.reduce((acc, booking) => {
    const isCompleted = String(booking.status).toUpperCase() === 'COMPLETED';
    const isPaid =
      booking.paymentStatus === 'PAID' ||
      booking.payment?.status === 'SUCCEEDED' ||
      booking.payment?.status === 'PAID';

    if (isCompleted || isPaid) {
      const amount = booking.totalAmount ?? (booking.payment as any)?.amountTotal ?? booking.jobAmount ?? 0;
      return acc + parsePounds(amount);
    }
    return acc;
  }, 0);

  const activeTeamMembersCount = rawTraders.length;

  const activeBookingsCount = rawBookings.filter((b) => {
    const st = String(b.status).toUpperCase();
    return st === 'CONFIRMED' || st === 'PENDING' || st === 'IN_PROGRESS';
  }).length;

  // 2. Team Member Roster
  const roster: RosterMember[] = rawTraders.map((trader: any) => {
    const traderBookings = rawBookings.filter(
      (b) => b.traderId === trader.id || b.traderId === trader.userId
    );
    const activeJobs = traderBookings.filter((b) => {
      const st = String(b.status).toUpperCase();
      return st === 'CONFIRMED' || st === 'PENDING' || st === 'IN_PROGRESS';
    }).length;

    const completedJobs = traderBookings.filter(
      (b) => String(b.status).toUpperCase() === 'COMPLETED'
    ).length;

    const workZone =
      trader.dailyWorkAreas?.[0]?.postcodeOrCity ||
      trader.dailyWorkAreas?.[0]?.zoneName ||
      'EC1 / Central London';

    return {
      id: trader.id,
      userId: trader.userId || trader.id,
      name: trader.displayName || trader.user?.name || 'Assigned Specialist',
      email: trader.user?.email || 'N/A',
      phone: trader.user?.phone || 'N/A',
      specialization: trader.bio || 'General Electrical & Plumbing Specialist',
      operatingPostcodeZone: workZone,
      activeJobLoad: activeJobs,
      completedJobsCount: completedJobs,
      stripeConnected: Boolean(trader.stripeAccountId),
      stripeAccountId: trader.stripeAccountId,
    };
  });

  const filteredRoster = roster.filter(
    (member) =>
      member.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      member.operatingPostcodeZone.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      member.specialization.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  // 3. Company Schedule & Buffer Gap Monitor
  const scheduleItems: BusinessScheduleItem[] = rawBookings.map((b) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime || start.getTime() + 2 * 3600 * 1000);
    const bufferMinutes = b.bufferMinutes ?? 30;
    const bufferEnd = new Date(end.getTime() + bufferMinutes * 60 * 1000);

    const isPaid =
      b.paymentStatus === 'PAID' ||
      b.payment?.status === 'SUCCEEDED' ||
      b.payment?.status === 'PAID' ||
      String(b.status).toUpperCase() === 'COMPLETED';

    const tech =
      rawTraders.find((t: any) => t.id === b.traderId || t.userId === b.traderId) || b.trader;
    const techName = tech?.displayName || tech?.user?.name || 'Assigned Technician';

    return {
      ...b,
      assignedTechnicianName: techName,
      formattedStartTime: start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      formattedEndTime: end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      formattedBufferEndTime: bufferEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      isPaid,
    };
  });

  const filteredSchedule = scheduleItems.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      item.assignedTechnicianName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      (item.customerEmail && item.customerEmail.toLowerCase().includes(scheduleSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (scheduleStatusFilter === 'PAID') return item.isPaid;
    if (scheduleStatusFilter === 'UNPAID') return !item.isPaid;
    if (scheduleStatusFilter !== 'ALL') {
      return String(item.status).toUpperCase() === scheduleStatusFilter;
    }
    return true;
  });

  // Stripe Express Status
  const connectedTraders = roster.filter((m) => m.stripeConnected);
  const stripeConnectionStatus =
    connectedTraders.length === roster.length && roster.length > 0
      ? 'FULLY_CONNECTED'
      : connectedTraders.length > 0
      ? 'PARTIALLY_CONNECTED'
      : 'ACTION_REQUIRED';

  const refetchAll = () => {
    refetchTraders();
    refetchBookings();
    refetchPayments();
    toast.info('Refreshed business executive metrics');
  };

  const isLoading = isLoadingTraders || isLoadingBookings || isLoadingPayments;
  const isFetching = isFetchingTraders || isFetchingBookings || isFetchingPayments;

  return {
    // Metrics
    totalCompanyRevenuePounds,
    activeTeamMembersCount,
    activeBookingsCount,
    formatCurrency,
    // Roster
    roster: filteredRoster,
    totalRosterCount: roster.length,
    rosterSearch,
    setRosterSearch,
    // Schedule
    schedule: filteredSchedule,
    totalScheduleCount: scheduleItems.length,
    scheduleSearch,
    setScheduleSearch,
    scheduleStatusFilter,
    setScheduleStatusFilter,
    // Stripe Express
    stripeConnectionStatus,
    connectedTradersCount: connectedTraders.length,
    launchPayoutPortal: (traderId?: string) => launchPayoutPortalMutation.mutate(traderId),
    isLaunchingPortal: launchPayoutPortalMutation.isPending,
    // General
    isLoading,
    isFetching,
    refetchAll,
  };
}
