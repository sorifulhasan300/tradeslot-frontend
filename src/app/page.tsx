import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { LayoutDashboard, CalendarCheck, Bot, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-6xl space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary/40 text-primary bg-primary/10">
            <Zap className="h-3.5 w-3.5 mr-1 fill-primary" /> Intelligent Booking & Scheduling Engine
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            TradeSlot Platform
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Multi-channel scheduling engine built for trade professionals. Features daily postcode operating zones, 30-minute travel buffer gaps, embedded Stripe Connect payouts, and multi-channel message intake.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trader Portal */}
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between">
            <div>
              <div className="h-1 bg-blue-500 rounded-t-xl" />
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-500 mb-2">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">1. Trader Dashboard</CardTitle>
                <CardDescription>
                  Configure daily operating radius, manage Stripe Connect payouts, and view schedule timelines with buffer gap indicators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Work Zone Setup (`POST /api/v1/work-area`)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Stripe Connect v2 Onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Interactive Schedule & Buffer Indicators</span>
                </div>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Link href="/dashboard" className="block w-full">
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Customer Booking Portal */}
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between">
            <div>
              <div className="h-1 bg-emerald-500 rounded-t-xl" />
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">2. Customer Booking</CardTitle>
                <CardDescription>
                  Interactive customer portal with web intake chatbot, real-time slot selection, and flat deposit checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Interactive Web Chatbot Intake</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Slot Visualizer with 30-min Gaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Embedded Stripe Flat Deposit</span>
                </div>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Link href="/book/trader-123" className="block w-full">
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Book Trader Slot
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Webhook Simulator */}
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between">
            <div>
              <div className="h-1 bg-purple-500 rounded-t-xl" />
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-500 mb-2">
                  <Bot className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">3. WhatsApp Simulator</CardTitle>
                <CardDescription>
                  Test panel for simulating WhatsApp message webhooks (`/api/v1/messages/whatsapp`) and real-time database intake.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Simulate WhatsApp Webhook Ingestion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Normalize phone & message text</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Live JSON response inspection</span>
                </div>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Link href="/simulator" className="block w-full">
                <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                  Launch Simulator
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
