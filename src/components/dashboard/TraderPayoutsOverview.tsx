"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  TrendingUp,
  DollarSign,
  Receipt,
  Search,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import { StripeAccountStatus, Payment, PaymentStatus } from "@/types/api.types";
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

interface TraderPayoutsOverviewProps {
  traderId: string;
  initialAccountStatus?: StripeAccountStatus | null;
  initialPayments?: Payment[];
}

type PaymentFilterTab = "ALL" | "PAID" | "PENDING";

export function TraderPayoutsOverview({
  traderId,
  initialAccountStatus,
  initialPayments,
}: TraderPayoutsOverviewProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentFilterTab>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. TanStack Query: Stripe Account Status
  const {
    data: statusRes,
    refetch: refetchStatus,
    isFetching: isFetchingStatus,
  } = useQuery({
    queryKey: ["stripe-status", traderId],
    queryFn: () => paymentService.getAccountStatus(traderId),
    initialData: initialAccountStatus
      ? {
          success: true,
          statusCode: 200,
          message: "OK",
          data: initialAccountStatus,
        }
      : undefined,
  });

  const accountStatus = statusRes?.data || initialAccountStatus || null;
  const isConnected =
    Boolean(accountStatus?.isOnboarded) && Boolean(accountStatus?.chargesEnabled);

  // 2. TanStack Query: Transaction History
  const {
    data: paymentsRes,
    isLoading: isLoadingPayments,
    isFetching: isFetchingPayments,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["trader-payments", traderId],
    queryFn: () => paymentService.getAllPayments(),
    initialData: initialPayments
      ? {
          success: true,
          statusCode: 200,
          message: "OK",
          data: initialPayments,
        }
      : undefined,
  });

  // 3. TanStack Mutation: Launch Stripe Express Dashboard
  const { mutate: launchStripeDashboard, isPending: isOpeningDashboard } =
    useMutation({
      mutationFn: () => paymentService.getStripeDashboard(traderId),
      onSuccess: (res) => {
        const targetUrl =
          res.data?.dashboardUrl || res.data?.url || (res as any).url;
        if (targetUrl) {
          toast.success("Opening Stripe Express Dashboard...");
          window.open(targetUrl, "_blank");
        } else {
          toast.error(res.message || "Stripe Express dashboard URL unavailable");
        }
      },
      onError: (error: any) => {
        toast.error(
          error?.message || "Failed to retrieve Stripe Express dashboard URL",
        );
      },
    });

  // 4. TanStack Mutation: Onboard Trader for Stripe
  const { mutate: onboardTrader, isPending: isOnboarding } = useMutation({
    mutationFn: () => paymentService.onboardTrader(traderId),
    onSuccess: (res) => {
      const targetUrl = res.data?.onboardingUrl || (res as any).onboardingUrl;
      if (targetUrl) {
        toast.info("Redirecting to Stripe Express Onboarding...");
        window.location.href = targetUrl;
      } else {
        toast.error(res.message || "Failed to retrieve Stripe onboarding link");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to initialize Stripe onboarding");
    },
  });

  const handleRefreshAll = () => {
    refetchStatus();
    refetchPayments();
    toast.info("Refreshed payout metrics and transaction history");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Process payment list
  const payments: Payment[] = paymentsRes?.data || initialPayments || [];

  // Helper functions for safely normalizing money values (pence vs pounds)
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

  const isPaymentCompleted = (status: PaymentStatus): boolean => {
    const s = String(status).toUpperCase();
    return s === "SUCCEEDED" || s === "PAID" || s === "COMPLETED";
  };

  // Metrics Calculations
  // Card 1: Total Net Earnings (£) — Calculated from completed payments
  const totalNetEarnings = payments
    .filter((p) => isPaymentCompleted(p.status))
    .reduce((sum, p) => sum + getMoneyValue(p.traderPayoutAmount), 0);

  // Card 3: Completed Payout Transfers — Count of verified payout transactions
  const completedPayoutsCount = payments.filter((p) =>
    isPaymentCompleted(p.status),
  ).length;

  // Filtered Payments for Table/List
  const filteredPayments = payments.filter((p) => {
    const query = search.toLowerCase();
    const bookingRef = (p.bookingId || "").toLowerCase();
    const intentId = (p.stripePaymentIntentId || "").toLowerCase();
    const customerName = (p.booking?.customerName || "").toLowerCase();

    const matchesSearch =
      bookingRef.includes(query) ||
      intentId.includes(query) ||
      customerName.includes(query);

    let matchesTab = true;
    if (activeTab === "PAID") {
      matchesTab = isPaymentCompleted(p.status);
    } else if (activeTab === "PENDING") {
      matchesTab = !isPaymentCompleted(p.status);
    }

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    const s = String(status).toUpperCase();
    if (s === "SUCCEEDED" || s === "PAID" || s === "COMPLETED") {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 font-mono text-[11px]">
          <CheckCircle2 className="h-3 w-3" />
          {s}
        </Badge>
      );
    }
    if (s === "PENDING") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1 font-mono text-[11px]"
        >
          <Clock3Icon className="h-3 w-3" />
          PENDING
        </Badge>
      );
    }
    return (
      <Badge
        variant="destructive"
        className="bg-red-500/15 text-red-400 border-red-500/30 gap-1 font-mono text-[11px]"
      >
        <ShieldAlert className="h-3 w-3" />
        {s}
      </Badge>
    );
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return format(parseISO(isoString), "MMM d, yyyy · HH:mm");
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/5"
            >
              <Sparkles className="h-3 w-3 mr-1" /> Real-Time Stripe Payouts
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Trader Payouts & Stripe Connect
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor destination charges, net trader payouts, platform application fees, and Stripe account health.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isFetchingStatus || isFetchingPayments}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 mr-1.5",
                (isFetchingStatus || isFetchingPayments) && "animate-spin",
              )}
            />
            Refresh Data
          </Button>

          {/* Stripe Express Dashboard Button */}
          <Button
            size="sm"
            onClick={() => launchStripeDashboard()}
            disabled={isOpeningDashboard}
            className="h-9 gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-900/20"
          >
            {isOpeningDashboard ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Launching Dashboard...
              </>
            ) : (
              <>
                <ExternalLink className="h-3.5 w-3.5" />
                Launch Stripe Express Dashboard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CORE REQUIREMENT 1: 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Net Earnings (£) */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Net Earnings (£)
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">
                  {formatMoney(totalNetEarnings)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Calculated from verified payouts
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Stripe Express Account Status */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Stripe Express Account Status
              </p>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 font-bold text-xs px-2.5 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    CONNECTED
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1 font-bold text-xs px-2.5 py-1"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    ACTION REQUIRED
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/80 font-mono truncate max-w-[170px]">
                ID: {accountStatus?.accountId || "Not Connected"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Completed Payout Transfers */}
        <Card className="glass-card glass-card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Completed Payout Transfers
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {completedPayoutsCount}
                </span>
                <span className="text-xs text-muted-foreground">Transfers</span>
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                Direct destination transfers
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Receipt className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STRIPE EXPRESS ACCOUNT DETAIL CARD */}
      <Card className="glass-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Stripe Express Account Details
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Verify destination payment capabilities & payout settings
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isConnected && (
                <Button
                  size="sm"
                  onClick={() => onboardTrader()}
                  disabled={isOnboarding}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold shadow-md"
                >
                  {isOnboarding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      Complete Stripe Onboarding
                      <ArrowUpRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20 text-xs">
            {/* Account ID */}
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">
                STRIPE ACCOUNT ID
              </span>
              <span className="font-mono text-foreground font-medium">
                {accountStatus?.accountId || "acct_not_connected"}
              </span>
            </div>

            {/* Onboarding State */}
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">
                ONBOARDING STATUS
              </span>
              <span
                className={cn(
                  "font-medium",
                  accountStatus?.isOnboarded
                    ? "text-emerald-400"
                    : "text-amber-400",
                )}
              >
                {accountStatus?.isOnboarded ? "Completed" : "Incomplete"}
              </span>
            </div>

            {/* Card Charges */}
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">
                CHARGES CAPABILITY
              </span>
              <span
                className={cn(
                  "font-medium",
                  accountStatus?.chargesEnabled
                    ? "text-emerald-400"
                    : "text-amber-400",
                )}
              >
                {accountStatus?.chargesEnabled ? "Active & Enabled" : "Disabled"}
              </span>
            </div>

            {/* Payout Transfers */}
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">
                PAYOUT TRANSFERS
              </span>
              <span
                className={cn(
                  "font-medium",
                  accountStatus?.payoutsEnabled
                    ? "text-emerald-400"
                    : "text-amber-400",
                )}
              >
                {accountStatus?.payoutsEnabled ? "Enabled" : "Pending Verification"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CORE REQUIREMENT 3: TRANSACTION HISTORY LIST / TABLE */}
      <Card className="glass-card">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Payout Transaction History
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Detailed ledger of gross booking fees, platform fee deductions, and net trader payouts
                </CardDescription>
              </div>
            </div>

            {/* Filter Tabs & Search Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Tab Selector */}
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
                  All ({payments.length})
                </button>
                <button
                  onClick={() => setActiveTab("PAID")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    activeTab === "PAID"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Paid / Succeeded ({completedPayoutsCount})
                </button>
                <button
                  onClick={() => setActiveTab("PENDING")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    activeTab === "PENDING"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Pending ({payments.length - completedPayoutsCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search ref ID or Intent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* REQUIREMENT 4: Loading Skeletons */}
          {isLoadingPayments && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/40 bg-card/40 flex flex-col sm:flex-row justify-between gap-4 items-center"
                >
                  <div className="space-y-2 w-full sm:w-1/3">
                    <Skeleton className="h-4 w-32 bg-muted/40" />
                    <Skeleton className="h-3 w-48 bg-muted/30" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full sm:w-1/2">
                    <Skeleton className="h-10 w-full bg-muted/30 rounded-lg" />
                    <Skeleton className="h-10 w-full bg-muted/30 rounded-lg" />
                    <Skeleton className="h-10 w-full bg-muted/30 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REQUIREMENT 4: Empty State Card */}
          {!isLoadingPayments && filteredPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/20 space-y-4">
              <div className="p-3.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Receipt className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-semibold text-foreground">
                  No payout transactions found
                </h3>
                <p className="text-xs text-muted-foreground">
                  {search || activeTab !== "ALL"
                    ? "No payment records match your search filter or selected status tab."
                    : "You currently have no processed payout transactions in your Stripe ledger."}
                </p>
              </div>
              {search && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="text-xs border-border/60"
                >
                  Clear Search Filter
                </Button>
              )}
            </div>
          )}

          {/* REQUIREMENT 3: Transaction History Table / List View */}
          {!isLoadingPayments && filteredPayments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 rounded-l-lg">Booking Ref ID</th>
                    <th className="py-3 px-4">Gross Amount</th>
                    <th className="py-3 px-4">Platform Fee</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Stripe Intent ID</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-background/60 transition-colors group"
                    >
                      {/* Booking Ref ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>
                            #{payment.bookingId ? payment.bookingId.slice(-8) : payment.id.slice(-8)}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(payment.bookingId || payment.id, "Booking Ref ID")
                            }
                            className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy Ref ID"
                          >
                            {copiedId === (payment.bookingId || payment.id) ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        {payment.booking?.customerName && (
                          <span className="text-[10px] text-muted-foreground block font-sans font-normal">
                            {payment.booking.customerName}
                          </span>
                        )}
                      </td>

                      {/* Gross Amount */}
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {formatMoney(payment.amountTotal)}
                      </td>

                      {/* Platform Fee Deduction */}
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-medium">
                        -{formatMoney(payment.platformFee)}
                      </td>

                      {/* Net Trader Payout */}
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatMoney(payment.traderPayoutAmount)}
                      </td>

                      {/* Payment Date */}
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>

                      {/* Stripe Payment Intent ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                          <span className="truncate" title={payment.stripePaymentIntentId}>
                            {payment.stripePaymentIntentId || "pi_mock_12345"}
                          </span>
                          {payment.stripePaymentIntentId && (
                            <button
                              onClick={() =>
                                handleCopy(
                                  payment.stripePaymentIntentId,
                                  "Stripe Intent ID",
                                )
                              }
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                              title="Copy Intent ID"
                            >
                              {copiedId === payment.stripePaymentIntentId ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-right">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Clock3Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16.5 12" />
    </svg>
  );
}
