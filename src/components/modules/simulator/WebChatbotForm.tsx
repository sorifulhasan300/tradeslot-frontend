'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chatbotFormSchema, ChatbotFormValues } from '@/lib/validations/simulator.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Phone, MapPin, Calendar, MessageSquare, Loader2, Send } from 'lucide-react';

interface WebChatbotFormProps {
  defaultValues: ChatbotFormValues;
  isSending: boolean;
  onSubmit: (values: ChatbotFormValues) => void;
}

export function WebChatbotForm({ defaultValues, isSending, onSubmit }: WebChatbotFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatbotFormValues>({
    resolver: zodResolver(chatbotFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Card className="border-border dark:border-slate-800 bg-card dark:bg-slate-900/80 backdrop-blur-md shadow-xl rounded-2xl">
      <CardHeader className="pb-3 border-b border-border/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-card-foreground">
              Send a Web Chat Message
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Simulate a customer asking for trade service or booking a time slot
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Your Name
              </label>
              <Input
                placeholder="e.g. Alex Morgan"
                {...register('customerName')}
                className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-purple-500 rounded-xl"
              />
              {errors.customerName && (
                <p className="text-[11px] text-destructive">{errors.customerName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Phone Number
              </label>
              <Input
                placeholder="e.g. +447700900123"
                {...register('customerPhone')}
                className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-purple-500 rounded-xl"
              />
              {errors.customerPhone && (
                <p className="text-[11px] text-destructive">{errors.customerPhone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Postcode or City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Postcode or City
              </label>
              <Input
                placeholder="e.g. NW1 4NP"
                {...register('postcodeOrCity')}
                className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-purple-500 rounded-xl"
              />
              {errors.postcodeOrCity && (
                <p className="text-[11px] text-destructive">{errors.postcodeOrCity.message}</p>
              )}
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Preferred Date / Time
              </label>
              <Input
                placeholder="e.g. Tomorrow 2 PM"
                {...register('preferredTimeSlot')}
                className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-purple-500 rounded-xl"
              />
              {errors.preferredTimeSlot && (
                <p className="text-[11px] text-destructive">{errors.preferredTimeSlot.message}</p>
              )}
            </div>
          </div>

          {/* Customer Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Service Inquiry Message
            </label>
            <Textarea
              rows={4}
              placeholder="Describe what trade service or booking you need..."
              {...register('message')}
              className="bg-muted/40 dark:bg-slate-950/70 border-input dark:border-slate-800 text-sm text-foreground focus:border-purple-500 rounded-xl resize-none"
            />
            {errors.message && (
              <p className="text-[11px] text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSending}
            className="w-full py-3 rounded-xl font-bold text-sm gap-2 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Sending Inquiry to Assistant...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Chat Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
