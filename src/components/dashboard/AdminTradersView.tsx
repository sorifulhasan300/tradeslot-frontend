"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  Building2,
  Percent,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
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

interface AdminTradersViewProps {
  initialUser?: User | null;
}

export interface TraderNetworkItem {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  stripeAccountId?: string | null;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  dailyWorkAreas?: Array<{
    id?: string;
    postcodeOrCity?: string;
    radiusMiles?: number;
  }>;
  createdAt?: string;
}

export function AdminTradersView({ initialUser }: AdminTradersViewProps) {
  const [page, setPage] = useState(1);
  const [traderSearch, setTraderSearch] = useState("");
  const [traderFilterTab, setTraderFilterTab] = useState<"ALL" | "CONNECTED" | "ACTION_REQUIRED">("ALL");

  const {
    data: tradersRes,
    isLoading: isLoadingTraders,
    isFetching: isFetchingTraders,
    refetch: refetchTraders,
  } = useQuery({
    queryKey: ["admin-traders", page, traderSearch],
    queryFn: () =>
      authService.getTraders({
        page,
        limit: 10,
        searchTerm: traderSearch || undefined,
      }),
  });

  const traders: TraderNetworkItem[] = tradersRes?.data || [];

  const handleRefresh = () => {
    refetchTraders();
    toast.info("Refreshed trader network data");
  };

  const connectedTradersCount = traders.filter((t) => Boolean(t.stripeAccountId)).length;
  const actionRequiredCount = traders.length - connectedTradersCount;
  const connectionRate = traders.length > 0 ? (connectedTradersCount / traders.length) * 100 : 0;

  const filteredTraders = traders.filter((trader) => {
    const q = traderSearch.toLowerCase();
    const name = (trader.displayName || trader.user?.name || "").toLowerCase();
    const email = (trader.user?.email || "").toLowerCase();
    const phone = (trader.user?.phone || "").toLowerCase();
    const bio = (trader.bio || "").toLowerCase();
    const matchesSearch =
      name.includes(q) || email.includes(q) || phone.includes(q) || bio.includes(q);

    let matchesTab = true;
    if (traderFilterTab === "CONNECTED") {
      matchesTab = Boolean(trader.stripeAccountId);
    } else if (traderFilterTab === "ACTION_REQUIRED") {
      matchesTab = !trader.stripeAccountId;
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
              <Users className="h-3.5 w-3.5 mr-1" /> Dedicated Admin Route
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trader Network Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full directory of registered trade specialists, work area coverage, and Stripe Express account status.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingTraders}
            className="h-9 text-xs border-border/50 bg-background/40 hover:bg-background/80"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetchingTraders && "animate-spin")} />
            Refresh Traders
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Active Traders</p>
              <p className="text-2xl font-bold text-foreground">{traders.length}</p>
              <p className="text-[11px] text-muted-foreground">Registered specialists</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Stripe Connected</p>
              <p className="text-2xl font-bold text-emerald-400">{connectedTradersCount}</p>
              <p className="text-[11px] text-emerald-400/80 font-medium">Ready for payouts</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Connection Rate</p>
              <p className="text-2xl font-bold text-purple-400 font-mono">{connectionRate.toFixed(1)}%</p>
              <p className="text-[11px] text-amber-400">{actionRequiredCount} Action Required</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TRADER MANAGEMENT TABLE */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Trader Directory</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  View and manage trader contacts, service category, coverage radius, and Stripe integration status
                </CardDescription>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center p-1 rounded-lg bg-background/60 border border-border/50 text-xs shrink-0">
                <button
                  onClick={() => setTraderFilterTab("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    traderFilterTab === "ALL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({traders.length})
                </button>
                <button
                  onClick={() => setTraderFilterTab("CONNECTED")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    traderFilterTab === "CONNECTED"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Connected ({connectedTradersCount})
                </button>
                <button
                  onClick={() => setTraderFilterTab("ACTION_REQUIRED")}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    traderFilterTab === "ACTION_REQUIRED"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Action Required ({actionRequiredCount})
                </button>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, trade, email..."
                  value={traderSearch}
                  onChange={(e) => setTraderSearch(e.target.value)}
                  className="pl-8 text-xs bg-background/50 h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoadingTraders && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/40 flex justify-between items-center">
                  <Skeleton className="h-5 w-40 bg-muted/40" />
                  <Skeleton className="h-5 w-24 bg-muted/30" />
                  <Skeleton className="h-5 w-36 bg-muted/30" />
                  <Skeleton className="h-6 w-28 bg-muted/30 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!isLoadingTraders && filteredTraders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/60 bg-background/20 space-y-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {traderSearch
                  ? "No traders match your search query."
                  : "No registered trade specialists currently in database."}
              </p>
            </div>
          )}

          {!isLoadingTraders && filteredTraders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 rounded-l-lg">Display Name</th>
                    <th className="py-3 px-4">Trade Category</th>
                    <th className="py-3 px-4">Email / Phone</th>
                    <th className="py-3 px-4">Work Zone</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Stripe Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {filteredTraders.map((trader) => {
                    const isConnected = Boolean(trader.stripeAccountId);
                    const workZone = trader.dailyWorkAreas?.[0];
                    const workZoneText = workZone
                      ? `${workZone.postcodeOrCity} (${workZone.radiusMiles || 15} miles)`
                      : "Default Zone (15 miles)";

                    return (
                      <tr key={trader.id} className="hover:bg-background/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {(trader.displayName || trader.user?.name || "T").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span>{trader.displayName || trader.user?.name || "Specialist Trader"}</span>
                              <span className="text-[10px] text-muted-foreground font-mono block">
                                ID: #{trader.id.slice(-8)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[11px] border-blue-500/30 text-blue-400 bg-blue-500/5">
                            {trader.bio || "General Trade Specialist"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground/70" />
                              <span>{trader.user?.email || "N/A"}</span>
                            </div>
                            {trader.user?.phone && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                                <Phone className="h-3 w-3 text-muted-foreground/70" />
                                <span>{trader.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-foreground">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>{workZoneText}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isConnected ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="h-3 w-3" />
                              CONNECTED
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1 font-bold text-[11px]"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              ACTION REQUIRED
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* NUMERIC PAGINATION FOOTER */}
          <NumericPagination
            page={page}
            totalPages={tradersRes?.meta?.totalPage || tradersRes?.meta?.totalPages || 1}
            totalItems={tradersRes?.meta?.total ?? filteredTraders.length}
            itemName="traders"
            onPageChange={(newPage) => setPage(newPage)}
            className="mt-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminTradersView;
