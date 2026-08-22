'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, LayoutDashboard, CalendarCheck, Bot, ShieldCheck, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getNavItems = () => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      return [
        { label: 'My Bookings', href: '/customer/dashboard', icon: CalendarCheck },
        { label: 'Book a Trader', href: '/book/trader-123', icon: CalendarCheck },
        { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
      ];
    }
    if (isAuthenticated && user?.role === 'TRADER') {
      return [
        { label: 'Trader Portal', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Customer Booking', href: '/book/trader-123', icon: CalendarCheck },
        { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
      ];
    }
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Customer Booking', href: '/book/trader-123', icon: CalendarCheck },
      { label: 'WhatsApp Simulator', href: '/simulator', icon: Bot },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-200">
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
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs">
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
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
