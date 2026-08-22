'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import messageService from '@/services/message.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Send, Terminal, Sparkles, Phone, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SimulatorPage() {
  const [channel, setChannel] = useState<'WEB_CHATBOT' | 'WHATSAPP'>('WEB_CHATBOT');
  const [senderPhone, setSenderPhone] = useState('+447700900123');
  const [message, setMessage] = useState('Hi, I need a gas boiler inspection in NW1 for tomorrow afternoon.');
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] TradeSlot AI Inbound Message Intake initialized.',
    '[INFO] Listening on channel: WEB_CHATBOT',
  ]);
  const [lastJsonResponse, setLastJsonResponse] = useState<any>(null);

  // Mutation for Web Chatbot Channel
  const { mutate: sendChatbot, isPending: isSendingChatbot } = useMutation({
    mutationFn: (msgText: string) =>
      messageService.sendWebChatbotMessage({
        senderId: senderPhone,
        message: msgText,
        customerPhone: senderPhone,
      }),
    onSuccess: (res) => {
      const timestamp = new Date().toLocaleTimeString();
      const responseData = res?.data || res;
      setLastJsonResponse(responseData);

      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [INBOUND] WEB_CHATBOT (${senderPhone}): "${message}"`,
        `[${timestamp}] [HTTP 200] Backend Response Payload:`,
        JSON.stringify(responseData, null, 2),
      ]);

      toast.success('Web Chatbot message dispatched successfully!');
      setMessage('');
    },
    onError: (error: any) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [ERROR] WEB_CHATBOT intake failed: ${error?.message || 'Server error'}`,
      ]);
      toast.error(error?.message || 'Failed to dispatch Chatbot message');
    },
  });

  // Mutation for WhatsApp Channel
  const { mutate: sendWhatsApp, isPending: isSendingWhatsApp } = useMutation({
    mutationFn: (msgText: string) =>
      messageService.sendWhatsAppMessage({
        from: senderPhone,
        text: msgText,
        messageText: msgText,
        customerPhone: senderPhone,
      }),
    onSuccess: (res) => {
      const timestamp = new Date().toLocaleTimeString();
      const responseData = res?.data || res;
      setLastJsonResponse(responseData);

      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [INBOUND] WHATSAPP (${senderPhone}): "${message}"`,
        `[${timestamp}] [HTTP 200] Backend Response Payload:`,
        JSON.stringify(responseData, null, 2),
      ]);

      toast.success('WhatsApp webhook payload dispatched successfully!');
      setMessage('');
    },
    onError: (error: any) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [ERROR] WHATSAPP intake failed: ${error?.message || 'Server error'}`,
      ]);
      toast.error(error?.message || 'Failed to dispatch WhatsApp message');
    },
  });

  const isSending = isSendingChatbot || isSendingWhatsApp;

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (channel === 'WEB_CHATBOT') {
      sendChatbot(message.trim());
    } else {
      sendWhatsApp(message.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10">
              <Sparkles className="h-3 w-3 mr-1" /> Multi-Channel Intake Engine
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Support & Message Intake Simulator</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Test real-time message ingestion, natural language slot parsing, and dynamic backend responses.
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
                  Simulate Web Chatbot API or WhatsApp Webhook ingestion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" /> Sender Identifier
                  </label>
                  <Input
                    placeholder="+447700900123"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="bg-background/50 text-xs font-mono"
                  />
                </div>
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
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Dispatching to Backend API...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Dispatch {channel === 'WEB_CHATBOT' ? 'Chatbot' : 'WhatsApp'} Payload
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Real-time Dynamic Response & Log Output */}
        <div className="space-y-4 flex flex-col">
          <Card className="border-border/50 bg-black/90 text-emerald-400 font-mono shadow-xl flex-1 flex flex-col">
            <CardHeader className="pb-2 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Live Intake & JSON Response Stream</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  {isSending ? 'Receiving...' : 'Active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-2 text-[11px] leading-relaxed max-h-[380px]">
              {logs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))}
            </CardContent>
          </Card>

          {lastJsonResponse && (
            <Card className="border-purple-500/30 bg-purple-500/5 p-3 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span>Dynamic Response Viewer</span>
                <span className="text-[10px] text-muted-foreground">HTTP 200 OK</span>
              </div>
              <pre className="text-[10px] text-purple-200 overflow-x-auto p-2 bg-black/40 rounded-lg">
                {JSON.stringify(lastJsonResponse, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
