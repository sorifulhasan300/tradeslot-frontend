'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Wrench,
  LayoutDashboard,
  CalendarCheck,
  Bot,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  Home,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: storeUser, isAuthenticated: storeIsAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = mounted ? storeUser : null;
  const isAuthenticated = mounted ? storeIsAuthenticated : false;

  // Auto-close mobile navigation drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { label: 'Home', href: '/', icon: Home },
    ];

    if (isAuthenticated && user?.role === 'CUSTOMER') {
      return [
        ...baseItems,
        { label: 'My Bookings', href: '/customer/dashboard', icon: CalendarCheck },
        { label: 'Book a Trader', href: '/book/trader-123', icon: CalendarCheck },
        { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
      ];
    }
    if (isAuthenticated && user?.role === 'TRADER') {
      return [
        ...baseItems,
        { label: 'Trader Portal', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Customer Booking', href: '/book/trader-123', icon: CalendarCheck },
        { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
      ];
    }
    if (isAuthenticated && (user?.role === 'PLATFORM_ADMIN' || user?.role === 'ADMIN' || user?.role === 'BUSINESS_ADMIN')) {
      return [
        ...baseItems,
        { label: 'Admin Portal', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Customer Booking', href: '/book/trader-123', icon: CalendarCheck },
        { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
      ];
    }
    return [
      ...baseItems,
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Customer Booking', href: '/book/trader-123', icon: CalendarCheck },
      { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/customer/dashboard' && pathname === '/dashboard');
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
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls & Mobile Navigation Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Desktop User / Auth controls */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs">
                  <UserIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">{user.name}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                    {user.role}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Drawer Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
              aria-label="Toggle Mobile Navigation"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col justify-between bg-card/95 backdrop-blur-xl border-l border-border/40 shadow-2xl">
              <div className="flex flex-col gap-6 p-6">
                {/* Mobile Sheet Header / Branding */}
                <SheetHeader className="p-0 text-left">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-foreground tracking-tight">TradeSlot</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Smart Slot Reservation Engine</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* User Info Card (if logged in) */}
                {isAuthenticated && user && (
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground leading-tight">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">{user.email}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-mono border-primary/30 text-primary bg-background/50">
                      {user.role}
                    </Badge>
                  </div>
                )}

                {/* Navigation Links List */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">
                    Navigation
                  </span>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href === '/customer/dashboard' && pathname === '/dashboard');
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <div
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/15'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className={`h-4 w-4 opacity-70 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Footer / Auth Actions */}
              <div className="p-6 border-t border-border/40 bg-muted/20 flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <Button
                    variant="destructive"
                    size="default"
                    onClick={handleLogout}
                    className="w-full gap-2 text-xs font-semibold rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out Account
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full gap-2 text-xs font-medium rounded-xl border-border/60">
                        <LogIn className="h-4 w-4 text-primary" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                      <Button className="w-full gap-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        <Sparkles className="h-4 w-4" />
                        Register New Account
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

