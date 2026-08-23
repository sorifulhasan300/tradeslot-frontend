"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import { StripeAccountStatus } from "@/types/api.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StripeConnectCardProps {
  traderId: string;
  initialAccountStatus?: StripeAccountStatus | null;
}

export function StripeConnectCard({ traderId, initialAccountStatus }: StripeConnectCardProps) {
  const queryClient = useQueryClient();

  // Query Stripe Account Status dynamically
  const { data: statusRes } = useQuery({
    queryKey: ['stripe-status', traderId],
    queryFn: () => paymentService.getAccountStatus(traderId),
    initialData: initialAccountStatus
      ? { success: true, statusCode: 200, message: 'OK', data: initialAccountStatus }
      : undefined,
  });

  const accountStatus = statusRes?.data || initialAccountStatus || null;

  // Mutation for Trader Onboarding
  const { mutate: onboardTrader, isPending: isOnboarding } = useMutation({
    mutationFn: () => paymentService.onboardTrader(traderId),
    onSuccess: (res) => {
      const targetUrl = res.data?.onboardingUrl || (res as any).onboardingUrl;
      if (res.success && targetUrl) {
        toast.info("Redirecting to Stripe Express Onboarding...");
        window.location.href = targetUrl;
      } else if (targetUrl) {
        toast.info("Redirecting to Stripe Express Onboarding...");
        window.location.href = targetUrl;
      } else {
        toast.error(res.message || "Failed to retrieve Stripe onboarding URL");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to initialize Stripe onboarding");
    },
  });

  // Mutation for opening Stripe Express Dashboard
  const { mutate: getStripeDashboard, isPending: isOpeningDashboard } = useMutation({
    mutationFn: () => paymentService.getStripeDashboard(traderId),
    onSuccess: (res) => {
      const targetUrl = res.data?.dashboardUrl || res.data?.url || (res as any).url;
      if (res.success && targetUrl) {
        window.open(targetUrl, "_blank");
      } else if (targetUrl) {
        window.open(targetUrl, "_blank");
      } else {
        toast.error(res.message || "Dashboard URL unavailable");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Could not open Stripe Express dashboard");
    },
  });

  const handleConnectStripe = () => {
    onboardTrader();
  };

  const handleOpenDashboard = () => {
    getStripeDashboard();
  };

  const isOnboarded = accountStatus?.isOnboarded || false;
  const chargesEnabled = accountStatus?.chargesEnabled || false;

  return (
    <Card className="glass-card glass-card-hover overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Stripe Payouts & Connect
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage destination payments, payouts, and card processing
              </CardDescription>
            </div>
          </div>

          {isOnboarded && chargesEnabled ? (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Payouts Active
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1"
            >
              <ShieldAlert className="h-3 w-3" />
              Setup Required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="text-xs font-mono text-muted-foreground">
                {accountStatus?.accountId || "acct_not_connected"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isOnboarded
                ? "Your Stripe Connect account is linked. Bookings will automatically route payouts to your bank."
                : "Complete your Stripe onboarding to accept customer deposits and receive automated payouts."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOnboarded ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDashboard}
                disabled={isOpeningDashboard}
                className="gap-2 border-border/60 hover:bg-muted"
              >
                {isOpeningDashboard ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Stripe Dashboard
                    <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleConnectStripe}
                disabled={isOnboarding}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
              >
                {isOnboarding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Setup Stripe Payouts
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
