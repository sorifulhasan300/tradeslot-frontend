import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { LoginForm } from "@/components/forms/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, ShieldCheck, Zap } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In | TradeSlot Platform",
  description:
    "Sign in to access your TradeSlot dashboard, manage operating zones, and view bookings.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to manage your daily slots, work area, and Stripe payouts.
            </p>
          </div>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription className="text-xs">
                Enter your registered credentials below to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Loading login form...
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>
              Don't have an account yet?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground/70">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Protected by TradeSlot Secure Authentication</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
