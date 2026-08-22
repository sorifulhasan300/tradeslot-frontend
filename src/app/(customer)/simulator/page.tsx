'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Send, CheckCircle2, MessageSquare, Terminal, Sparkles, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SimulatorPage() {
  const [channel, setChannel] = useState<'WHATSAPP' | 'WEB_CHATBOT'>('WEB_CHATBOT');
  const [message, setMessage] = useState('Hi, I need a gas boiler inspection in NW1 for tomorrow afternoon.');
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] TradeSlot AI Inbound Message Intake initialized.',
    '[INFO] Listening on channel: WEB_CHATBOT',
  ]);
  const [isSending, setIsSending] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    const timestamp = new Date().toLocaleTimeString();

    setLogs((prev) => [
      ...prev,
      `[${timestamp}] [INBOUND] ${channel}: "${message}"`,
      `[${timestamp}] [NLP PARSER] Intent detected: SERVICE_BOOKING`,
      `[${timestamp}] [BUFFER ENGINE] Checking travel distance from Trader Base... OK (3.2 mi, 12 min)`,
      `[${timestamp}] [OUTBOUND] Proposed slot: Tomorrow @ 14:00 (Buffer gap: 30 min satisfied)`,
    ]);

    setTimeout(() => {
      setIsSending(false);
      toast.success('Simulation message processed!');
      setMessage('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10">
              <Sparkles className="h-3 w-3 mr-1" /> Multi-Channel Engine
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Support & Message Intake Simulator</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Test real-time message ingestion, natural language slot parsing, and automated travel buffer checks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Simulate Inbound Customer Message</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Simulate WhatsApp webhooks or website chatbot messages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Channel Origin</label>
                <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                  <SelectTrigger className="bg-background/50 text-xs">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEB_CHATBOT">Web Chatbot Widget</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Message Payload</label>
                <Textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message..."
                  className="bg-background/50 text-xs font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={isSending || !message.trim()}
                className="w-full text-xs font-semibold gap-2 shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Send className="h-3.5 w-3.5" />
                {isSending ? 'Processing Simulation...' : 'Dispatch Message Payload'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Real-time Terminal Log Output */}
        <Card className="border-border/50 bg-black/90 text-emerald-400 font-mono shadow-xl flex flex-col">
          <CardHeader className="pb-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Live Intake Event Stream</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed max-h-[320px]">
            {logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-words">
                {log}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
