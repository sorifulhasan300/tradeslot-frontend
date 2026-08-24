"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  LayoutDashboard,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Loader2,
  Home,
} from "lucide-react";
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

export default function StripeReturnPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [countdown, setCountdown] = useState<number>(6);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Query actual account status if user is available
  const { data: statusRes, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["stripe-status-return", user?.id],
    queryFn: () => paymentService.getAccountStatus(user?.id || ""),
    enabled: Boolean(user?.id),
    staleTime: 0,
  });

  const accountStatus = statusRes?.data;
  const isOnboarded = accountStatus?.isOnboarded ?? true; // Default to true on return page

  // Auto-redirect countdown
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, router]);

  const handleOpenStripeDashboard = async () => {
    try {
      const res = await paymentService.getStripeDashboard(user?.id);
      const url = res.data?.dashboardUrl || res.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        router.push("/dashboard/payouts");
      }
    } catch {
      router.push("/dashboard/payouts");
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 md:py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-xl space-y-6">
        <Card className="glass-card glass-card-hover overflow-hidden border-emerald-500/20 shadow-2xl relative">
          {/* Top Decorative Gradient Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse" />

          <CardHeader className="text-center pt-8 pb-4 space-y-4">
            {/* Animated Icon Badge */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
              <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 gap-1 text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Stripe Onboarding Complete
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Account Successfully Linked!
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your Stripe Connect Express account is active and configured for TradeSlot. You can now accept customer deposits and receive automated payouts.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Account Details Box */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Stripe Account Status
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                  {isCheckingStatus ? "Verifying..." : isOnboarded ? "Connected & Active" : "Setup Complete"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Card Processing</span>
                  <div className="text-foreground font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Enabled
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Automated Payouts</span>
                  <div className="text-foreground font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Enabled
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Platform Fee Split</span>
                  <div className="text-foreground font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Configured
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Payout Method</span>
                  <div className="text-foreground font-mono font-semibold">
                    Stripe Express Bank
                  </div>
                </div>
              </div>

              {accountStatus?.accountId && (
                <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Account ID:</span>
                  <span className="text-foreground font-semibold">{accountStatus.accountId}</span>
                </div>
              )}
            </div>

            {/* Auto Redirect Banner */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 className={`w-4 h-4 text-primary ${isPaused ? "" : "animate-spin"}`} />
                <span>
                  {isPaused
                    ? "Auto-redirect paused."
                    : `Redirecting to Trader Dashboard in ${countdown}s...`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="h-7 text-xs px-2 hover:bg-primary/10"
              >
                {isPaused ? "Resume Timer" : "Pause Timer"}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={handleOpenStripeDashboard}
              className="w-full sm:w-auto gap-2 border-border/60 hover:bg-muted font-medium"
            >
              <ExternalLink className="w-4 h-4 text-purple-400" />
              Stripe Express
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full gap-2 font-medium">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
