'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, LayoutDashboard, CalendarCheck, Bot, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Customer Booking', href: '/book/trader-123', icon: CalendarCheck },
    { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            TradeSlot
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono border-primary/30 text-primary">
            MVP
          </Badge>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`gap-2 text-xs sm:text-sm font-medium transition-all ${
                    isActive ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-muted-foreground font-mono">Trader ID: trader-123</span>
          </div>
        </div>
      </div>
    </header>
  );
}
