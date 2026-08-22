'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, UserCheck, Code2, ChevronUp, ChevronDown } from 'lucide-react';
import { User } from '@/types/auth.types';

interface SimulatorHeaderProps {
  user: User | null;
  showTechnicalDetails: boolean;
  onToggleTechnicalDetails: () => void;
}

export function SimulatorHeader({
  user,
  showTechnicalDetails,
  onToggleTechnicalDetails,
}: SimulatorHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-500/10 via-slate-100 to-emerald-500/10 dark:from-purple-900/40 dark:via-slate-900 dark:to-emerald-900/40 p-6 rounded-2xl border border-border dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 px-2.5 py-0.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600 dark:text-purple-400" /> Interactive Customer Assistant
          </Badge>
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Real-time Intake Ready
          </Badge>
          {user && (
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-medium">
              <UserCheck className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400" /> Active Session ({user.name})
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Customer Messaging & Intake Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Test how TradeSlot receives inquiries from Web Chat widgets and WhatsApp messages, normalizing requests and suggesting booking slots automatically.
        </p>
      </div>

      <Button
        variant="outline"
        onClick={onToggleTechnicalDetails}
        className="self-start md:self-center border-border dark:border-slate-700 bg-background dark:bg-slate-800/80 hover:bg-muted dark:hover:bg-slate-800 text-foreground dark:text-slate-200 text-xs font-medium gap-2 shadow-sm"
      >
        <Code2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        {showTechnicalDetails ? 'Hide Technical Data' : 'View Technical Data'}
        {showTechnicalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
