'use client';

import React from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuthStore();

  return (
    <div className="w-full border-b border-border/40 bg-card/60 backdrop-blur-sm px-4 py-3 sm:px-6 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          {title && <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-border/40">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{user.email}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono uppercase border-primary/30 text-primary">
                {user.role}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
