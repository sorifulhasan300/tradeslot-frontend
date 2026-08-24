'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, LayoutDashboard, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/Header';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Navigation */}
      <Header />

      {/* Centered Simple 404 Content */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full space-y-6">
          {/* Simple Icon Badge */}
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
            <FileQuestion className="h-8 w-8 text-primary" />
          </div>

          {/* 404 Headline */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-primary">
              Error 404
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Page Not Found
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="default"
              className="gap-2 rounded-xl text-xs font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Button>

            <Link href="/">
              <Button size="default" className="gap-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="secondary" size="default" className="gap-2 rounded-xl text-xs font-medium">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        <p>TradeSlot Scheduling Platform</p>
      </footer>
    </div>
  );
}
