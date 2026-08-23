"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Bot,
  CheckCircle2,
  Clock,
  Star,
  Wrench,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  // Interactive Quick Search state
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");

  // Interactive Glass Preview Slot State
  const [selectedSlotId, setSelectedSlotId] = useState<string>("slot-2");

  const slots = [
    {
      id: "slot-1",
      time: "08:30 AM - 10:00 AM",
      title: "Full House Rewiring Check",
      client: "Residential Client #402",
      status: "occupied",
      bufferAfter: "30 Min Buffer (SW1A -> EC1)",
    },
    {
      id: "slot-2",
      time: "10:30 AM - 12:00 PM",
      title: "Available Booking Window",
      deposit: "£45.00",
      status: "available",
      bufferAfter: "30 Min Buffer (EC1 -> W1)",
    },
    {
      id: "slot-3",
      time: "12:30 PM - 02:00 PM",
      title: "Available Booking Window",
      deposit: "£45.00",
      status: "available",
      bufferAfter: "30 Min Buffer (W1 -> SE1)",
    },
    {
      id: "slot-4",
      time: "02:30 PM - 04:00 PM",
      title: "Commercial Fuse Board Repair",
      client: "Corporate Office #12",
      status: "occupied",
      bufferAfter: "Day End Buffer",
    },
  ];

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Background Ambient Glow Orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-emerald-500/10 blur-[130px] pointer-events-none rounded-full"
      />
      <div
        aria-hidden="true"
        className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 via-primary/10 to-transparent blur-[140px] pointer-events-none rounded-full"
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl space-y-20 relative z-10">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-4">
          {/* Feature Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary shadow-sm backdrop-blur-md animate-pulse">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            <span>⚡ 30-Minute Travel Buffer Engine</span>
          </div>

          {/* Minimalist Typography Heading & Subheading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent leading-[1.15]">
              Book Verified Trade Specialists in Seconds
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Automated route buffering, real-time operating radius matching,
              and instant Stripe deposit verification for electricians, plumbers, and trade professionals.
            </p>
          </div>

          {/* Embedded Quick Search Box */}
          <div className="glass-card p-3 sm:p-4 rounded-2xl shadow-2xl border border-border/60 max-w-3xl w-full mx-auto space-y-3 md:space-y-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/book/trader-123${
                  specialty ? `?specialty=${encodeURIComponent(specialty)}` : ""
                }`;
              }}
              className="flex flex-col md:flex-row items-center gap-3"
            >
              {/* Specialty Input */}
              <div className="relative flex-1 w-full">
                <Wrench className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="🔍 Specialty (e.g. Electrician, Plumber)"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/60 focus:border-primary text-sm rounded-xl"
                />
              </div>

              {/* Location Input */}
              <div className="relative flex-1 w-full">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="📍 Location (e.g. SW1A 1AA, London)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/60 focus:border-primary text-sm rounded-xl"
                />
              </div>

              {/* Search Slots Action Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group shrink-0"
              >
                <span>Search Slots</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>

          {/* Dual Action Buttons with Ambient Glow */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/book/trader-123">
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] transition-all duration-300 flex items-center gap-2"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Explore Specialists</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-xl font-semibold glass-card border-border/70 hover:bg-muted/80 backdrop-blur-md shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>Trader Dashboard</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FLOATING INTERACTIVE GLASS PREVIEW */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Engine Mockup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Live Buffer Engine Visualizer
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Select available slots below to test how our 30-minute buffer engine protects travel times between consecutive jobs.
            </p>
          </div>

          {/* Glassmorphic Mock Container */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-8">
            {/* Header / Specialist Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  MV
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg">Marcus Vance</h3>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium">
                      Verified Master Electrician
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="flex items-center text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500 mr-0.5" /> 4.9 (128 Reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" /> Central London Zone
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Today's Operating Schedule</span>
              </div>
            </div>

            {/* Timeline Slot Grid */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between px-1">
                <span>Timeline Schedule & Automated Buffer Gaps</span>
                <span className="text-[11px] text-primary">Click an available slot to test</span>
              </div>

              <div className="space-y-2.5">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isAvailable = slot.status === "available";

                  return (
                    <div key={slot.id} className="space-y-2">
                      {/* Main Slot Card */}
                      <div
                        onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          !isAvailable
                            ? "bg-muted/30 border-border/40 opacity-75 cursor-not-allowed"
                            : isSelected
                            ? "bg-primary/10 border-primary shadow-md shadow-primary/10 cursor-pointer"
                            : "bg-card/70 border-border/60 hover:border-primary/50 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              !isAvailable
                                ? "bg-muted text-muted-foreground"
                                : isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                                {slot.time}
                              </span>
                              {!isAvailable ? (
                                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                                  Reserved Job
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                                  Instant Slot
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                              {slot.title} {!isAvailable && `(${slot.client})`}
                            </p>
                          </div>
                        </div>

                        {isAvailable && (
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <span className="text-xs font-semibold text-emerald-500">
                              {slot.deposit} Flat Deposit
                            </span>
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              className={`h-8 text-xs rounded-lg ${
                                isSelected ? "bg-primary text-primary-foreground" : "border-primary/40 text-primary hover:bg-primary/10"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Slot"}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 30-Min Buffer Visualization Bar */}
                      <div className="mx-4 my-1 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 animate-bounce" />
                          <span className="font-medium text-[11px]">
                            {slot.bufferAfter}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">
                          Automated Gap Applied
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Selected Slot Reservation Panel */}
            {selectedSlot && (
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Slot Ready for Reservation
                    </span>
                  </div>
                  <p className="text-sm font-semibold">
                    {selectedSlot.time} • Marcus Vance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Includes guaranteed 30-min travel buffer & instant Stripe deposit confirmation.
                  </p>
                </div>

                <Link href="/book/trader-123" className="w-full sm:w-auto">
                  <Button size="default" className="w-full sm:w-auto h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
                    <span>Reserve with {selectedSlot.deposit} Deposit</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. 3-STEP WORKFLOW & FEATURE GRID */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary bg-primary/5">
              Automated Operations Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              3 Simple Steps to Book & Dispatch
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Designed from the ground up to eliminate schedule overlaps and streamline trade payouts.
            </p>
          </div>

          {/* 3 Clean Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="glass-card glass-card-hover border border-border/60 rounded-2xl overflow-hidden flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-base">
                    01
                  </div>
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">1. Search & Radius Match</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Filter verified trade specialists by postcode coverage zones and specific trade skills in real-time.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Postcode Operating Radius</span>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="glass-card glass-card-hover border border-border/60 rounded-2xl overflow-hidden flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-base">
                    02
                  </div>
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">2. Buffer Gap Applied</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Intelligent engine automatically injects 30-minute travel cushions between consecutive job appointments.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Zero Schedule Overlaps</span>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="glass-card glass-card-hover border border-border/60 rounded-2xl overflow-hidden flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-base">
                    03
                  </div>
                  <CreditCard className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">3. Stripe Connect Checkout</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Clients secure slots via flat deposit; funds are safely directed to trader accounts via Stripe Connect v2.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Instant Deposit Confirmation</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Minimalist Feature Grid */}
          <div className="space-y-4 pt-6">
            <h3 className="text-xl font-bold tracking-tight text-center sm:text-left">
              Platform Feature Architecture
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Stripe Connect */}
              <Card className="glass-card glass-card-hover border-border/50 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-500">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold">Stripe Connect & Payouts</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Embedded onboarding for trade specialists, automated payout splits, and real-time transaction ledger.
                  </p>
                </div>
                <Link href="/dashboard" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1 pt-2">
                  <span>Explore Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>

              {/* Feature 2: Webhook Simulator */}
              <Card className="glass-card glass-card-hover border-border/50 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-500">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold">Multi-Channel Webhook Simulator</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Test intake channels for WhatsApp Webhooks and Web Chatbot interactions with live JSON output logs.
                  </p>
                </div>
                <Link href="/simulator" className="inline-flex items-center text-xs font-semibold text-purple-500 hover:underline gap-1 pt-2">
                  <span>Launch Webhook Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>

              {/* Feature 3: RBAC Portals */}
              <Card className="glass-card glass-card-hover border-border/50 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold">RBAC & Enterprise Portals</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Role-Based Access Control portals tailored for Customers, Traders, Business Admins, and Audit Teams.
                  </p>
                </div>
                <Link href="/admin" className="inline-flex items-center text-xs font-semibold text-emerald-500 hover:underline gap-1 pt-2">
                  <span>View Admin Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle Footer Banner */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground relative z-10">
        <p>TradeSlot Scheduling Platform • 30-Minute Route Buffer Engine • Embedded Stripe Connect</p>
      </footer>
    </div>
  );
}
