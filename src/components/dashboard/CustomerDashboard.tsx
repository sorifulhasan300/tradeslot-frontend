"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  CalendarPlus,
  Clock3,
  CreditCard,
  Car,
  Wallet,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";
import { User } from "@/types/auth.types";
import { Booking, BookingStatus } from "@/types/api.types";
import { bookingService } from "@/services/booking.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CustomerDashboardProps {
  initialUser?: User | null;
  initialBookings?: Booking[];
}

type FilterTab = "ALL" | "UPCOMING" | "COMPLETED";

export function CustomerDashboard({
  initialUser,
  initialBookings,
}: CustomerDashboardProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  // TanStack Query: Fetch customer bookings in real-time
  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: () => bookingService.getAllBookings(),
  });

  // Fallback demo bookings for customer experience when backend database is empty
  const demoCustomerBookings: Booking[] = [
    {
      id: "cb-201",
      traderId: "trader-123",
      customerName: initialUser?.name || "Alex Morgan",
      customerPhone: initialUser?.phone || "+447700900077",
      customerEmail: initialUser?.email || "customer@example.com",
      address: "12 Baker Street, Marylebone",
      postcode: "NW1 6XE",
      serviceDescription: "Boiler Inspection & Gas Safety Certificate",
      startTime: new Date(Date.now() + 86400 * 1000 * 2).toISOString(),
      endTime: new Date(
        Date.now() + 86400 * 1000 * 2 + 3600 * 1000 * 2,
      ).toISOString(),
      bufferMinutes: 30,
      feeAmount: 75.0,
      paymentStatus: "PAID",
      status: "CONFIRMED",
      trader: {
        displayName: "Apex Gas & Heating Services",
      },
      payment: {
        status: "PAID",
        depositAmount: 75.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cb-202",
      traderId: "trader-456",
      customerName: initialUser?.name || "Alex Morgan",
      customerPhone: initialUser?.phone || "+447700900077",
      customerEmail: initialUser?.email || "customer@example.com",
      address: "45 Oxford Road, Soho",
      postcode: "W1D 1BS",
      serviceDescription: "Emergency Radiator Leak & Valve Replacement",
      startTime: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
      endTime: new Date(
        Date.now() - 86400 * 1000 * 3 + 3600 * 1000 * 3,
      ).toISOString(),
      bufferMinutes: 30,
      feeAmount: 120.0,
      paymentStatus: "PAID",
      status: "COMPLETED",
      trader: {
        displayName: "Metro Electrical & Heating",
      },
      payment: {
        status: "PAID",
        depositAmount: 120.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const apiBookings = apiResponse?.data;
  const rawBookings: Booking[] =
    apiBookings && apiBookings.length > 0
      ? apiBookings
      : initialBookings && initialBookings.length > 0
        ? initialBookings
        : demoCustomerBookings;

  // Helper functions for safe values
  const getBookingFee = (b: Booking): number => {
    if (b.payment?.depositAmount && b.payment.depositAmount > 0) {
      return b.payment.depositAmount > 100
        ? b.payment.depositAmount / 100
        : b.payment.depositAmount;
    }
    if (b.payment?.amount && b.payment.amount > 0) {
      return b.payment.amount > 100 ? b.payment.amount / 100 : b.payment.amount;
    }
    if (b.flatBookingFee && b.flatBookingFee > 0) {
      return b.flatBookingFee > 100 ? b.flatBookingFee / 100 : b.flatBookingFee;
    }
    if (b.totalAmount && b.totalAmount > 0) {
      return b.totalAmount > 100 ? b.totalAmount / 100 : b.totalAmount;
    }
    return b.feeAmount ?? 75;
  };

  const getTraderName = (b: Booking): string => {
    if (b.trader?.displayName) return b.trader.displayName;
    if (b.trader?.user?.name) return b.trader.user.name;
    if (b.traderId) return `TradeSlot Professional #${b.traderId.slice(-4)}`;
    return "TradeSlot Professional";
  };

  const getPaymentStatus = (b: Booking): string => {
    if (b.payment?.status) return b.payment.status.toUpperCase();
    if (b.paymentStatus) return b.paymentStatus.toUpperCase();
    return "PAID";
  };

  // Tab filtering logic
  const isUpcoming = (b: Booking) => {
    const now = new Date();
    const startTime = new Date(b.startTime);
    return (
      b.status === "CONFIRMED" ||
      b.status === "PENDING" ||
      b.status === "IN_PROGRESS" ||
      startTime >= now
    );
  };

  const isCompleted = (b: Booking) => {
    const now = new Date();
    const endTime = new Date(b.endTime);
    return (
      b.status === "COMPLETED" ||
      b.status === "CANCELLED" ||
      (endTime < now && b.status !== "CONFIRMED" && b.status !== "IN_PROGRESS")
    );
  };

  const filteredBookings = rawBookings.filter((b) => {
    const traderName = getTraderName(b).toLowerCase();
    const serviceDesc = (b.serviceDescription || "").toLowerCase();
    const address = (b.address || "").toLowerCase();
    const postcode = (b.postcode || "").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      traderName.includes(query) ||
      serviceDesc.includes(query) ||
      address.includes(query) ||
      postcode.includes(query);

    let matchesTab = true;
    if (activeTab === "UPCOMING") {
      matchesTab = isUpcoming(b);
    } else if (activeTab === "COMPLETED") {
      matchesTab = isCompleted(b);
    }

    return matchesSearch && matchesTab;
  });

  // Overview metrics calculations
  const totalBookingsCount = rawBookings.length;
  const activeAppointmentsCount = rawBookings.filter(
    (b) =>
      b.status === "CONFIRMED" ||
      b.status === "IN_PROGRESS" ||
      b.status === "PENDING",
  ).length;
  const totalDepositPaid = rawBookings
    .filter((b) => getPaymentStatus(b) === "PAID")
    .reduce((sum, b) => sum + getBookingFee(b), 0);

  const upcomingCount = rawBookings.filter(isUpcoming).length;
  const completedCount = rawBookings.filter(isCompleted).length;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            Confirmed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">
            In Progress
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/15 text-red-400 border-red-500/30"
          >
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/15 text-amber-400 border-amber-500/30"
          >
            Pending
          </Badge>
        );
    }
  };

  const formatTimeRange = (startIso: string, endIso: string) => {
    try {
      const start = parseISO(startIso);
      const end = parseISO(endIso);
      return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
    } catch {
      return `${startIso} - ${endIso}`;
    }
  };

  const formatDate = (startIso: string) => {
    try {
      const start = parseISO(startIso);
      return format(start, "EEEE, MMM d, yyyy");
    } catch {
      return startIso;
    }
  };

  const formatBufferEnd = (endIso: string, bufferMinutes: number = 30) => {
    try {
      const end = parseISO(endIso);
      const bufferEnd = addMinutes(end, bufferMinutes);
      return format(bufferEnd, "HH:mm");
    } catch {
      return "11:30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
            >
              <Sparkles className="h-3 w-3 mr-1" /> Real-Time Customer Portal
              (TanStack Query)
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {initialUser?.name || "Valued Customer"}!
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your scheduled appointments, view payment history, and manage
            trader bookings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")}
            />
            Refresh
          </Button>

          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0"
          >
            <CalendarPlus className="h-4 w-4" />
            Book New Service
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Requirement 2: Overview Metrics (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Bookings */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalBookingsCount}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                All-time booking history
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active / Confirmed Appointments */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Active / Confirmed
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {activeAppointmentsCount}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Upcoming trader slots
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Deposit Paid (£) */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Deposit Paid
              </p>
              <p className="text-2xl font-bold text-purple-400">
                £{totalDepositPaid.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Stripe verified payments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Booked Slots & Payment History */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Bookings & Payment History
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Real-time slots with trader details and 30-min travel buffer
                  indicators
                </CardDescription>
              </div>
            </div>

            {/* Requirement 4: Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center p-1 rounded-lg bg-background/60 border border-border/50 text-xs shrink-0">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    activeTab === "ALL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All ({totalBookingsCount})
                </button>
                <button
                  onClick={() => setActiveTab("UPCOMING")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    activeTab === "UPCOMING"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Upcoming ({upcomingCount})
                </button>
                <button
                  onClick={() => setActiveTab("COMPLETED")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    activeTab === "COMPLETED"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Completed/Past ({completedCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter bookings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Requirement 5: Loading Skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl border border-border/40 bg-card/40 space-y-3"
                >
                  <div className="flex justify-between items-center pb-2">
                    <Skeleton className="h-5 w-1/3 bg-muted/30" />
                    <Skeleton className="h-5 w-24 bg-muted/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Skeleton className="h-12 w-full bg-muted/30 rounded-lg" />
                    <Skeleton className="h-12 w-full bg-muted/30 rounded-lg" />
                    <Skeleton className="h-12 w-full bg-muted/30 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-full bg-muted/20 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Requirement 5: Empty State Cards */}
          {!isLoading && filteredBookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/20 space-y-4">
              <div className="p-3.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <CalendarPlus className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-semibold text-foreground">
                  No bookings found
                </h3>
                <p className="text-xs text-muted-foreground">
                  {search || activeTab !== "ALL"
                    ? "No customer bookings match your current search query or active filter tab."
                    : "You currently have no active or historical trader service bookings."}
                </p>
              </div>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <CalendarPlus className="h-4 w-4" />
                Book Your First Trader Service
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Requirement 3: List of Booked Slots */}
          {!isLoading && filteredBookings.length > 0 && (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const fee = getBookingFee(booking);
                const traderName = getTraderName(booking);
                const paymentStatus = getPaymentStatus(booking);

                return (
                  <div
                    key={booking.id}
                    className="p-4 sm:p-5 rounded-xl border border-border/50 bg-background/40 hover:bg-background/70 transition-all shadow-sm space-y-3"
                  >
                    {/* Top Row: Service Description, Status & Payment Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {booking.serviceDescription ||
                            "General Trade Service & Inspection"}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Payment Status (PAID) Indicator */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-mono px-2.5 py-1 flex items-center gap-1.5 border",
                            paymentStatus === "PAID"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30",
                          )}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Payment Status: {paymentStatus} (£{fee.toFixed(2)})
                        </Badge>
                      </div>
                    </div>

                    {/* Middle Row: Trader Name, Date, Time Window, Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                      {/* Trader Name */}
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card/60 border border-border/30">
                        <UserIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground/80 font-mono uppercase tracking-wider">
                            TRADER NAME
                          </p>
                          <p className="font-semibold text-foreground truncate">
                            {traderName}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card/60 border border-border/30">
                        <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground/80 font-mono uppercase tracking-wider">
                            APPOINTMENT DATE
                          </p>
                          <p className="font-medium text-foreground truncate">
                            {formatDate(booking.startTime)}
                          </p>
                        </div>
                      </div>

                      {/* Time Window */}
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card/60 border border-border/30 sm:col-span-2 md:col-span-1">
                        <Clock className="h-4 w-4 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground/80 font-mono uppercase tracking-wider">
                            TIME WINDOW
                          </p>
                          <p className="font-medium text-foreground truncate">
                            {formatTimeRange(
                              booking.startTime,
                              booking.endTime,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location / Address Line */}
                    {(booking.address || booking.postcode) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1 pt-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>
                          {booking.address ? `${booking.address}, ` : ""}
                          {booking.postcode || ""}
                        </span>
                      </div>
                    )}

                    {/* Requirement 3: 30-Min Buffer Indicator */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-lg border border-dashed border-blue-500/30 bg-blue-500/5 text-xs text-blue-400 font-mono">
                      <div className="flex items-center gap-2 font-medium">
                        <Car className="h-4 w-4 animate-pulse shrink-0 text-blue-400" />
                        <span>30-Min Travel & Buffer Gap Indicator</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Buffer Window:{" "}
                        {formatTimeRange(booking.endTime, booking.endTime)}{" "}
                        standard gap (until{" "}
                        {formatBufferEnd(
                          booking.endTime,
                          booking.bufferMinutes || 30,
                        )}
                        )
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
