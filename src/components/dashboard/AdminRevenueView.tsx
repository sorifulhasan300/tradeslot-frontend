"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Check,
  Copy,
  PoundSterling,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import { Payment, PaymentStatus } from "@/types/api.types";
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
import { NumericPagination } from "@/components/shared/NumericPagination";

interface AdminRevenueViewProps {
  initialUser?: User | null;
}

export function AdminRevenueView({ initialUser }: AdminRevenueViewProps) {
  const [page, setPage] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusTab, setPaymentStatusTab] = useState<
    "ALL" | "SUCCEEDED" | "PENDING" | "FAILED"
  >("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    data: paymentsRes,
    isLoading: isLoadingPayments,
    isFetching: isFetchingPayments,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["admin-payments", page, paymentStatusTab, paymentSearch],
    queryFn: () =>
      paymentService.getAllPayments({
        page,
        limit: 10,
        status: paymentStatusTab === "ALL" ? undefined : paymentStatusTab,
        searchTerm: paymentSearch || undefined,
      }),
  });

  const payments: Payment[] = paymentsRes?.data || [];

  const handleRefresh = () => {
    refetchPayments();
    toast.info("Refreshed platform revenue audit ledger");
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPlatformRevenue = payments.reduce(
    (sum, p) => sum + getMoneyValue(p.platformFee),
    0,
  );

  const totalGrossVolume = payments.reduce(
    (sum, p) => sum + getMoneyValue(p.amountTotal),
    0,
  );

  const totalTraderPayouts = payments.reduce(
    (sum, p) => sum + getMoneyValue(p.traderPayoutAmount),
    0,
  );

  const filteredPayments = payments.filter((p) => {
    const q = paymentSearch.toLowerCase();
    const bookingRef = (p.bookingId || "").toLowerCase();
    const intentId = (p.stripePaymentIntentId || "").toLowerCase();
    const customerName = (p.booking?.customerName || "").toLowerCase();

    const matchesSearch =
      bookingRef.includes(q) ||
      intentId.includes(q) ||
      customerName.includes(q);

    let matchesTab = true;
    if (paymentStatusTab !== "ALL") {
      matchesTab = String(p.status).toUpperCase() === paymentStatusTab;
    }

    return matchesSearch && matchesTab;
  });

  const getPaymentStatusBadge = (status: PaymentStatus | string) => {
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
          <Clock className="h-3 w-3" />
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1" /> Dedicated Admin Route
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Revenue & Transaction Audit
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Financial transaction audit table displaying gross customer charges,
            platform application fee deductions, and net trader payout
            transfers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingPayments}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 mr-1.5",
                isFetchingPayments && "animate-spin",
              )}
            />
            Refresh Ledger
          </Button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            Dashboard Overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Platform Revenue (£)
              </p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                {formatMoney(totalPlatformRevenue)}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" /> Application
                fee deductions
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PoundSterling className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Gross Charge Volume (£)
              </p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatMoney(totalGrossVolume)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total customer payments
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Net Trader Payouts (£)
              </p>
              <p className="text-2xl font-bold text-indigo-400 font-mono">
                {formatMoney(totalTraderPayouts)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Transferred via Stripe Express
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* REVENUE AUDIT TABLE */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Transaction Audit Ledger
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ledger of gross customer payments, application fee deductions,
                  and net trader payouts
                </CardDescription>
              </div>
            </div>

            {/* Status Filter & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center p-1 rounded-lg bg-background/60 border border-border/50 text-xs shrink-0">
                {(["ALL", "SUCCEEDED", "PENDING", "FAILED"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setPaymentStatusTab(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-md font-medium transition-all text-xs",
                        paymentStatusTab === tab
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search booking ref, intent..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoadingPayments && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/40 bg-card/40 flex justify-between items-center"
                >
                  <Skeleton className="h-5 w-32 bg-muted/40" />
                  <Skeleton className="h-5 w-24 bg-muted/30" />
                  <Skeleton className="h-5 w-24 bg-muted/30" />
                  <Skeleton className="h-6 w-24 bg-muted/30 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!isLoadingPayments && filteredPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/20 space-y-3">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {paymentSearch || paymentStatusTab !== "ALL"
                  ? "No transactions match your search filter."
                  : "No payment transactions currently recorded in ledger."}
              </p>
            </div>
          )}

          {!isLoadingPayments && filteredPayments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 rounded-l-lg">Booking ID</th>
                    <th className="py-3 px-4">Gross Payment (£)</th>
                    <th className="py-3 px-4">Platform Fee (£)</th>
                    <th className="py-3 px-4">Trader Net Payout (£)</th>
                    <th className="py-3 px-4">Date & Stripe Intent</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-background/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>
                            #
                            {payment.bookingId
                              ? payment.bookingId.slice(-8)
                              : payment.id.slice(-8)}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(
                                payment.bookingId || payment.id,
                                "Booking ID",
                              )
                            }
                            className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy Booking Ref"
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

                      <td className="py-3.5 px-4 font-semibold text-foreground font-mono">
                        {formatMoney(payment.amountTotal)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-purple-400 font-bold">
                        +{formatMoney(payment.platformFee)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                        {formatMoney(payment.traderPayoutAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        <div>{formatDate(payment.createdAt)}</div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5">
                          <span
                            className="truncate max-w-[140px]"
                            title={payment.stripePaymentIntentId}
                          >
                            {payment.stripePaymentIntentId || "pi_mock_123"}
                          </span>
                          {payment.stripePaymentIntentId && (
                            <button
                              onClick={() =>
                                handleCopy(
                                  payment.stripePaymentIntentId,
                                  "Intent ID",
                                )
                              }
                              className="hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
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

                      <td className="py-3.5 px-4 text-right">
                        {getPaymentStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* NUMERIC PAGINATION FOOTER */}
          <NumericPagination
            page={page}
            totalPages={
              paymentsRes?.meta?.totalPages ||
              paymentsRes?.meta?.totalPages ||
              1
            }
            totalItems={paymentsRes?.meta?.total ?? filteredPayments.length}
            itemName="transactions"
            onPageChange={(newPage) => setPage(newPage)}
            className="mt-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminRevenueView;
