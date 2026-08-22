'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { whatsappFormSchema, WhatsAppFormValues } from '@/lib/validations/simulator.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, Phone, PhoneCall, MessageSquare, Loader2, Send } from 'lucide-react';

interface WhatsAppFormProps {
  defaultValues: WhatsAppFormValues;
  isSending: boolean;
  onSubmit: (values: WhatsAppFormValues) => void;
}

export function WhatsAppForm({ defaultValues, isSending, onSubmit }: WhatsAppFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Card className="border-border dark:border-slate-800 bg-card dark:bg-slate-900/80 backdrop-blur-md shadow-xl rounded-2xl">
      <CardHeader className="pb-3 border-b border-border/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-card-foreground">
              Simulate WhatsApp Message
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Test inbound WhatsApp messages received on your business number
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sender Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Sender Mobile Number
              </label>
              <Input
                placeholder="e.g. +447700900088"
                {...register('fromPhone')}
                className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-emerald-500 rounded-xl"
              />
              {errors.fromPhone && (
                <p className="text-[11px] text-destructive">{errors.fromPhone.message}</p>
              )}
            </div>

            {/* Business Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Business Number
              </label>
              <Input
                placeholder="e.g. +447700900000"
                {...register('toPhone')}
                className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-emerald-500 rounded-xl"
              />
              {errors.toPhone && (
                <p className="text-[11px] text-destructive">{errors.toPhone.message}</p>
              )}
            </div>
          </div>

          {/* WhatsApp Message Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> WhatsApp Message Body
            </label>
            <Textarea
              rows={4}
              placeholder="Type WhatsApp message text..."
              {...register('messageBody')}
              className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-emerald-500 rounded-xl resize-none"
            />
            {errors.messageBody && (
              <p className="text-[11px] text-destructive">{errors.messageBody.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSending}
            className="w-full py-3 rounded-xl font-bold text-sm gap-2 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Ingesting WhatsApp Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Simulate Incoming WhatsApp Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
