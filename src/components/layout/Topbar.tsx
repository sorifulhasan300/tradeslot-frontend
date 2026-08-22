'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ROUTE_CONFIG, getDefaultRedirectForRole } from '@/config/routes.config';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Bell, ChevronRight, User as UserIcon, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const routeInfo = ROUTE_CONFIG[pathname] || {
    title: pathname.includes('/customer') ? 'Customer Portal' : 'Trader Dashboard',
    breadcrumbs: ['Home', pathname.split('/')[1] || 'Dashboard'],
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const homeHref = getDefaultRedirectForRole(user?.role);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-card/70 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Drawer Toggle & Dynamic Header / Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile Sheet Toggle */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-border/40">
              <Sidebar onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Dynamic Breadcrumbs & Page Title */}
          <div>
            <nav className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium mb-0.5">
              {routeInfo.breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                  <span className={idx === routeInfo.breadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">{routeInfo.title}</h1>
          </div>
        </div>

        {/* Right Side: Role Badge, Notifications, Theme Toggle, Avatar Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Role Badge */}
          {user && (
            <Badge
              variant="outline"
              className={`hidden sm:inline-flex text-[10px] font-semibold tracking-wider uppercase ${
                isCustomer
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
              }`}
            >
              {isCustomer ? 'Customer' : 'Trader'}
            </Badge>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          {/* User Avatar Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 px-2 flex items-center gap-2 rounded-lg hover:bg-accent cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                </div>
                <span className="hidden md:inline-block text-xs font-semibold text-foreground max-w-[120px] truncate">
                  {user.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold text-foreground leading-none">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-none truncate">{user.email}</p>
                    <div className="pt-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-primary font-semibold uppercase">{user.role} Account</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(homeHref)}
                  className="cursor-pointer text-xs"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Dashboard Overview
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs text-destructive focus:text-destructive">
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
