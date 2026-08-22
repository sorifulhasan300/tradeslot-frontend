'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2 } from 'lucide-react';
import { ApiResponsePayload } from '@/types/simulator.types';

interface TechnicalJsonViewerProps {
  lastJsonResponse: ApiResponsePayload | null;
}

export function TechnicalJsonViewer({ lastJsonResponse }: TechnicalJsonViewerProps) {
  return (
    <Card className="border-purple-500/30 bg-card dark:bg-slate-900/90 shadow-xl rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-foreground">Raw HTTP Response & Developer Specs</span>
        </div>
        {lastJsonResponse && (
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
            HTTP {lastJsonResponse?.statusCode || 201}
          </Badge>
        )}
      </div>

      {lastJsonResponse ? (
        <div className="space-y-1.5">
          <div className="text-[11px] text-muted-foreground font-mono">
            Returned Object (<code className="text-purple-600 dark:text-purple-300">statusCode</code>, <code className="text-purple-600 dark:text-purple-300">message</code>, <code className="text-purple-600 dark:text-purple-300">data</code>):
          </div>
          <pre className="text-[11px] font-mono text-purple-700 dark:text-purple-300 bg-muted/60 dark:bg-slate-950 p-3.5 rounded-xl border border-border dark:border-slate-800 overflow-x-auto max-h-[220px]">
            {JSON.stringify(lastJsonResponse, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-muted-foreground font-mono">
          No response payload recorded yet. Send a message above to inspect raw JSON data.
        </div>
      )}
    </Card>
  );
}
