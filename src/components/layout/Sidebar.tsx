'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  TRADER_NAV_ITEMS,
  CUSTOMER_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
  BUSINESS_NAV_ITEMS,
  getDefaultRedirectForRole,
} from '@/config/routes.config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Wrench,
} from 'lucide-react';

import { User } from '@/types/auth.types';

interface SidebarProps {
  initialUser?: User | null;
  onNavClick?: () => void;
}

export function Sidebar({ initialUser, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: storeUser, logout } = useAuthStore();
  const user = storeUser || initialUser;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isCustomer = user?.role === 'CUSTOMER';
  const isAdmin = user?.role === 'PLATFORM_ADMIN' || user?.role === 'ADMIN';
  const isBusiness = user?.role === 'BUSINESS_ADMIN';
  const links = isAdmin
    ? ADMIN_NAV_ITEMS
    : isBusiness
    ? BUSINESS_NAV_ITEMS
    : isCustomer
    ? CUSTOMER_NAV_ITEMS
    : TRADER_NAV_ITEMS;
  const homeHref = getDefaultRedirectForRole(user?.role);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/customer/dashboard' || href === '/admin/dashboard' || href === '/business/dashboard') {
      return pathname === href;
    }
    const cleanHref = href.split('#')[0];
    return pathname.startsWith(cleanHref);
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-card/90 backdrop-blur-md border-r border-border/40 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header: Logo & Badge */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/40 shrink-0">
        <Link href={homeHref} onClick={onNavClick} className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Wrench className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-foreground whitespace-nowrap">
                Trade<span className="text-primary">Slot</span>
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-400 bg-indigo-500/5 font-mono">
                MVP
              </Badge>
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Mode</span>
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold ${
              isAdmin
                ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                : isBusiness
                ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                : isCustomer
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
            }`}
          >
            {isAdmin ? 'Platform Admin' : isBusiness ? 'Business Admin' : isCustomer ? 'Customer Portal' : 'Trader Portal'}
          </Badge>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {links.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Snippet */}
      <div className="p-3 border-t border-border/40 bg-background/30 shrink-0 space-y-2">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate">{user?.name || 'User'}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className={`w-full text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors ${
            isCollapsed ? 'p-0 h-9 justify-center' : 'justify-start gap-2'
          }`}
          title="Sign out of account"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
