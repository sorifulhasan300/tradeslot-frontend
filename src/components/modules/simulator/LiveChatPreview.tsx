'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { ChatItem } from '@/types/simulator.types';

interface LiveChatPreviewProps {
  chatFeed: ChatItem[];
  onClearChat: () => void;
}

export function LiveChatPreview({ chatFeed, onClearChat }: LiveChatPreviewProps) {
  return (
    <Card className="border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 shadow-xl rounded-2xl flex flex-col min-h-[480px]">
      {/* Header of Chat Window */}
      <CardHeader className="py-3 px-4 border-b border-border/80 dark:border-slate-800/80 bg-muted/30 dark:bg-slate-900 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot className="h-5 w-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Live Intake Conversation Preview</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Assistant & Webhook Ingestion Engine Active
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg gap-1.5 border border-border"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Chat
          </Button>
        </div>
      </CardHeader>

      {/* Chat Bubble Feed Container */}
      <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[420px] bg-slate-50 dark:bg-slate-950/60 rounded-b-2xl border-t border-border/30 dark:border-transparent">
        {chatFeed.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col ${
              item.sender === 'customer' ? 'items-end' : 'items-start'
            } space-y-1`}
          >
            {/* Sender Label & Channel Badge */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-semibold text-muted-foreground">
                {item.sender === 'customer'
                  ? item.customerName || item.customerPhone || 'Customer'
                  : 'TradeSlot AI Assistant'}
              </span>
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 ${
                  item.channel === 'WEB_CHATBOT'
                    ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10'
                    : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {item.channel === 'WEB_CHATBOT' ? 'Web Chat' : 'WhatsApp'}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {item.timestamp}
              </span>
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                item.sender === 'customer'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 rounded-tl-none space-y-2'
              }`}
            >
              <p>{item.text}</p>

              {/* Status Badge */}
              {item.sender === 'system' && item.status && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.status}
                  </span>
                  {item.rawResponse?.statusCode !== undefined && (
                    <span className="text-muted-foreground font-mono">
                      Status Code: {String(item.rawResponse.statusCode)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
