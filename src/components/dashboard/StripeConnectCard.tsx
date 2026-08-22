"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { onboardStripeAction, getExpressDashboardUrlAction } from "@/app/actions/payment.actions";
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
  const [isPending, startTransition] = useTransition();
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(initialAccountStatus || null);

  const handleConnectStripe = () => {
    startTransition(async () => {
      const res = await onboardStripeAction(traderId);
      const targetUrl = res.data?.onboardingUrl;
      if (res.success && targetUrl) {
        toast.info("Redirecting to Stripe Express Onboarding...");
        window.location.href = targetUrl;
      } else {
        toast.error(res.message || "Failed to retrieve onboarding URL");
      }
    });
  };

  const handleOpenDashboard = async () => {
    setIsOpeningDashboard(true);
    try {
      const res = await getExpressDashboardUrlAction(traderId);
      if (res.success && res.data?.url) {
        window.open(res.data.url, "_blank");
      } else {
        toast.error(res.message || "Dashboard URL unavailable");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not open Stripe Express dashboard");
    } finally {
      setIsOpeningDashboard(false);
    }
  };

  const isOnboarded = accountStatus?.isOnboarded || false;
  const chargesEnabled = accountStatus?.chargesEnabled || false;

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
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
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Connect with Stripe
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
