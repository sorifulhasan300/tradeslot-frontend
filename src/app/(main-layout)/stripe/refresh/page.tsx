"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  LayoutDashboard,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { paymentService } from "@/services/payment.service";

export default function StripeRefreshPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartOnboarding = async () => {
    setIsRestarting(true);
    try {
      const res = await paymentService.onboardTrader(user?.id);
      const url = res.data?.onboardingUrl || (res as any).onboardingUrl;
      if (url) {
        toast.info("Redirecting to Stripe Express setup...");
        window.location.href = url;
      } else {
        toast.error("Failed to generate onboarding link. Please try from your dashboard.");
        router.push("/dashboard/payouts");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error restarting Stripe setup");
      router.push("/dashboard/payouts");
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 md:py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-xl space-y-6">
        <Card className="glass-card glass-card-hover overflow-hidden border-amber-500/20 shadow-2xl relative">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-red-500" />

          <CardHeader className="text-center pt-8 pb-4 space-y-4">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                <ShieldAlert className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 px-3 py-1 gap-1 text-xs uppercase tracking-wider font-semibold">
                Stripe Session Expired
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Stripe Setup Interrupted
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                The Stripe onboarding session expired or was closed before completion. You can restart the setup process at any time to activate payouts.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 text-xs text-muted-foreground space-y-2 backdrop-blur-sm">
              <p className="font-semibold text-foreground">Why am I seeing this?</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Stripe account links expire after a short period for security reasons.</li>
                <li>The browser tab may have been refreshed or closed during onboarding.</li>
                <li>You can re-trigger onboarding safely without losing existing progress.</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <Button
              onClick={handleRestartOnboarding}
              disabled={isRestarting}
              className="w-full sm:flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
            >
              {isRestarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Restart Stripe Setup
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/payouts")}
              className="w-full sm:w-auto gap-2 border-border/60 hover:bg-muted font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Payout Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
