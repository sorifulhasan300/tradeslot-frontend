'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpVerificationForm } from '@/components/forms/OtpVerificationForm';
import { ShieldCheck, Mail, ArrowLeft, KeyRound, Wrench } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialEmail = searchParams?.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [isSubmittedEmail, setIsSubmittedEmail] = useState(Boolean(initialEmail));

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm border border-primary/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Verify Email Address
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete your account verification with the 6-digit OTP code sent to your email.
          </p>
        </div>

        {/* Card Component */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Account Verification
            </CardTitle>
            <CardDescription className="text-xs">
              {isSubmittedEmail && email
                ? `Enter the verification code sent to ${email}`
                : 'Enter your account email to verify your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmittedEmail || !email ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) {
                    setIsSubmittedEmail(true);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="emailInput" className="text-xs font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="emailInput"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-background/50 text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 text-xs font-semibold gap-2">
                  Continue to Code Verification
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <OtpVerificationForm
                  email={email}
                  onSuccess={() => {
                    router.push('/login?verified=true');
                  }}
                />
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmittedEmail(false)}
                    className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Change target email address
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-muted-foreground space-y-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
          <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>TradeSlot Encrypted Email Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
          Loading email verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
