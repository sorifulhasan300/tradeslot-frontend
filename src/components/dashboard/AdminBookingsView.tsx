"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CalendarCheck,
  Search,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  ShieldAlert,
  Check,
  Copy,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO, addMinutes } from "date-fns";
import { toast } from "sonner";
import { bookingService } from "@/services/booking.service";
import { Booking, BookingStatus } from "@/types/api.types";
import { User } from "@/types/auth.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminBookingsViewProps {
  initialUser?: User | null;
}

export function AdminBookingsView({ initialUser }: AdminBookingsViewProps) {
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusTab, setBookingStatusTab] = useState<"ALL" | BookingStatus>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    data: bookingsRes,
    isLoading: isLoadingBookings,
    isFetching: isFetchingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => bookingService.getAllBookings(),
  });

  const bookings: Booking[] = bookingsRes?.data || [];

  const handleRefresh = () => {
    refetchBookings();
    toast.info("Refreshed system-wide bookings");
  };

  const getMoneyValue = (val: number | undefined | null): number => {
    if (val === undefined || val === null) return 0;
    return val > 500 ? val / 100 : val;
  };

  const formatMoney = (val: number | undefined | null): string => {
    const num = getMoneyValue(val);
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return format(parseISO(isoString), "MMM d, yyyy · HH:mm");
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return format(parseISO(isoString), "HH:mm");
    } catch {
      return isoString;
    }
  };

  const getBufferEndTimeString = (endTimeIso?: string, bufferMinutes = 30): string => {
    if (!endTimeIso) return "N/A";
    try {
      const end = parseISO(endTimeIso);
      const buffered = addMinutes(end, bufferMinutes);
      return format(buffered, "HH:mm");
    } catch {
      return "N/A";
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    const refId = (b.id || "").toLowerCase();
    const customer = (b.customerName || "").toLowerCase();
    const phone = (b.customerPhone || "").toLowerCase();
    const email = (b.customerEmail || "").toLowerCase();
    const traderName = (b.trader?.displayName || b.trader?.user?.name || "").toLowerCase();

    const matchesSearch =
      refId.includes(q) || customer.includes(q) || phone.includes(q) || email.includes(q) || traderName.includes(q);

    let matchesStatus = true;
    if (bookingStatusTab !== "ALL") {
      matchesStatus = String(b.status).toUpperCase() === bookingStatusTab;
    }

    return matchesSearch && matchesStatus;
  });

  const confirmedCount = bookings.filter((b) => String(b.status).toUpperCase() === "CONFIRMED").length;
  const completedCount = bookings.filter((b) => String(b.status).toUpperCase() === "COMPLETED").length;
  const pendingCount = bookings.filter((b) => String(b.status).toUpperCase() === "PENDING").length;

  const getBookingStatusBadge = (status: BookingStatus | string) => {
    const s = String(status).toUpperCase();
    if (s === "CONFIRMED") {
      return (
        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1 font-mono text-[11px]">
          <CheckCircle2 className="h-3 w-3" />
          CONFIRMED
        </Badge>
      );
    }
    if (s === "COMPLETED") {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 font-mono text-[11px]">
          <CheckCircle2 className="h-3 w-3" />
          COMPLETED
        </Badge>
      );
    }
    if (s === "PENDING") {
      return (
        <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1 font-mono text-[11px]">
          <Clock className="h-3 w-3" />
          PENDING
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="bg-red-500/15 text-red-400 border-red-500/30 gap-1 font-mono text-[11px]">
        <ShieldAlert className="h-3 w-3" />
        {s}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
              <Calendar className="h-3.5 w-3.5 mr-1" /> Dedicated Admin Route
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            System-wide Booking Audit Panel
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit system bookings across all network specialists, customer contact details, deposit fees, and 30-min buffer gaps.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingBookings}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetchingBookings && "animate-spin")} />
            Refresh Bookings
          </Button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            Dashboard Overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-[11px] text-muted-foreground">System-wide</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-blue-400">{confirmedCount}</p>
              <p className="text-[11px] text-blue-400/80">Active appointments</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
              <p className="text-[11px] text-emerald-400/80">Fulfilled jobs</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending / Other</p>
              <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              <p className="text-[11px] text-amber-400/80">Awaiting confirmation</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOOKING AUDIT PANEL */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">System-wide Booking Audit</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Data table of all system appointments, travel buffer windows, and fee structures
                </CardDescription>
              </div>
            </div>

            {/* Status Filter & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center p-1 rounded-lg bg-background/60 border border-border/50 text-xs shrink-0 flex-wrap">
                {(["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingStatusTab(st)}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-medium transition-all text-xs",
                      bookingStatusTab === st
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search ID, customer, trader..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoadingBookings && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/40 flex justify-between items-center">
                  <Skeleton className="h-5 w-32 bg-muted/40" />
                  <Skeleton className="h-5 w-40 bg-muted/30" />
                  <Skeleton className="h-5 w-24 bg-muted/30" />
                  <Skeleton className="h-6 w-24 bg-muted/30 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!isLoadingBookings && filteredBookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/20 space-y-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {bookingSearch || bookingStatusTab !== "ALL"
                  ? "No system bookings match your search query."
                  : "No system bookings currently recorded."}
              </p>
            </div>
          )}

          {!isLoadingBookings && filteredBookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 rounded-l-lg">Booking ID & Timeline</th>
                    <th className="py-3 px-4">Assigned Trader</th>
                    <th className="py-3 px-4">Customer Contacts</th>
                    <th className="py-3 px-4">Deposit Fee</th>
                    <th className="py-3 px-4">30-min Travel Buffer Gap</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {filteredBookings.map((booking) => {
                    const traderName = booking.trader?.displayName || booking.trader?.user?.name || "Assigned Trader";
                    const depositFee = booking.flatBookingFee || booking.feeAmount || 0;
                    const bufferMinutes = booking.bufferMinutes || 30;

                    return (
                      <tr key={booking.id} className="hover:bg-background/60 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                          <div className="flex items-center gap-1.5">
                            <span>#{booking.id.slice(-8)}</span>
                            <button
                              onClick={() => handleCopy(booking.id, "Booking ID")}
                              className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy Booking ID"
                            >
                              {copiedId === booking.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
                            {formatDate(booking.startTime)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-foreground">
                          <span>{traderName}</span>
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            ID: #{booking.traderId.slice(-8)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground font-sans block">
                              {booking.customerName}
                            </span>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground/70" />
                              <span>{booking.customerPhone}</span>
                            </div>
                            {booking.customerEmail && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                                <Mail className="h-3 w-3 text-muted-foreground/70" />
                                <span>{booking.customerEmail}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                          {formatMoney(depositFee)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 gap-1 text-[10px] font-mono"
                            >
                              <Clock className="h-3 w-3 text-indigo-400" />
                              +{bufferMinutes}m Travel Buffer Gap Applied
                            </Badge>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              Window: {formatTime(booking.startTime)} - {formatTime(booking.endTime)} (Buffer ends {getBufferEndTimeString(booking.endTime, bufferMinutes)})
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {getBookingStatusBadge(booking.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminBookingsView;
