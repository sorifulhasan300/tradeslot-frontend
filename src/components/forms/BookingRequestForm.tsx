'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CalendarCheck,
  Radio,
} from 'lucide-react';

import { bookingRequestSchema, BookingRequestSchemaType } from '@/lib/validations/booking.schema';
import { createBookingAction } from '@/app/actions/booking.actions';
import { Booking } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookingRequestFormProps {
  traderId: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultFee?: number;
  onSuccess?: (booking: Booking) => void;
}

export function BookingRequestForm({
  traderId,
  defaultStartTime,
  defaultEndTime,
  defaultFee = 50,
  onSuccess,
}: BookingRequestFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingRequestSchemaType>({
    resolver: zodResolver(bookingRequestSchema) as any,
    defaultValues: {
      traderId,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      address: '',
      postcode: '',
      serviceDescription: '',
      startTime: defaultStartTime || new Date().toISOString(),
      endTime: defaultEndTime || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      feeAmount: defaultFee,
      channel: 'WEB_CHATBOT',
      notes: '',
    },
  });

  const selectedChannel = watch('channel');

  const onSubmit = (data: BookingRequestSchemaType) => {
    startTransition(async () => {
      const response = await createBookingAction({
        traderId: data.traderId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || undefined,
        address: data.address,
        postcode: data.postcode,
        serviceDescription: data.serviceDescription,
        startTime: data.startTime,
        endTime: data.endTime,
        feeAmount: Number(data.feeAmount),
        channel: data.channel,
        notes: data.notes,
      });

      if (response.success && response.data) {
        toast.success('Booking Reserved!', {
          description: `Booking #${response.data.id.slice(0, 8)} reserved for ${data.customerName}.`,
        });
        if (onSuccess) onSuccess(response.data);
      } else {
        toast.error('Booking Failed', {
          description: response.message || 'Could not create booking request.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4" noValidate>
      <input type="hidden" {...register('traderId')} value={traderId} />

      {/* Intake Channel Selection */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground/80">Intake Channel</Label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-muted/50 rounded-lg border border-border/60">
          {(['WEB_CHATBOT', 'WHATSAPP', 'DIRECT'] as const).map((channelOption) => (
            <button
              key={channelOption}
              type="button"
              onClick={() => setValue('channel', channelOption, { shouldValidate: true })}
              className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                selectedChannel === channelOption
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radio className="h-3 w-3" />
              {channelOption.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer Name */}
        <div className="space-y-1.5">
          <Label htmlFor="customerName" className="text-xs font-semibold text-foreground/80">
            Customer Name
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <Input
              id="customerName"
              placeholder="Jane Smith"
              className={`pl-9 ${errors.customerName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('customerName')}
              disabled={isPending}
            />
          </div>
          {errors.customerName && (
            <p className="text-xs text-destructive font-medium">{errors.customerName.message}</p>
          )}
        </div>

        {/* Customer Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="customerPhone" className="text-xs font-semibold text-foreground/80">
            Customer Phone
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Phone className="h-4 w-4" />
            </div>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="+88017... or +4479..."
              className={`pl-9 ${errors.customerPhone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('customerPhone')}
              disabled={isPending}
            />
          </div>
          {errors.customerPhone && (
            <p className="text-xs text-destructive font-medium">{errors.customerPhone.message}</p>
          )}
        </div>

        {/* Customer Email */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="customerEmail" className="text-xs font-semibold text-foreground/80">
            Email Address (Optional)
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              className={`pl-9 ${errors.customerEmail ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('customerEmail')}
              disabled={isPending}
            />
          </div>
          {errors.customerEmail && (
            <p className="text-xs text-destructive font-medium">{errors.customerEmail.message}</p>
          )}
        </div>

        {/* Service Address */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address" className="text-xs font-semibold text-foreground/80">
            Service Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <Input
              id="address"
              placeholder="123 High Street, Flat 4"
              className={`pl-9 ${errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register('address')}
              disabled={isPending}
            />
          </div>
          {errors.address && (
            <p className="text-xs text-destructive font-medium">{errors.address.message}</p>
          )}
        </div>

        {/* Postcode */}
        <div className="space-y-1.5">
          <Label htmlFor="postcode" className="text-xs font-semibold text-foreground/80">
            Postcode
          </Label>
          <Input
            id="postcode"
            placeholder="SW1A 1AA"
            className={`uppercase font-mono ${
              errors.postcode ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
            {...register('postcode')}
            disabled={isPending}
          />
          {errors.postcode && (
            <p className="text-xs text-destructive font-medium">{errors.postcode.message}</p>
          )}
        </div>

        {/* Flat Fee Deposit */}
        <div className="space-y-1.5">
          <Label htmlFor="feeAmount" className="text-xs font-semibold text-foreground/80">
            Deposit Amount (£)
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-semibold">
              £
            </div>
            <Input
              id="feeAmount"
              type="number"
              min={0}
              placeholder="50"
              className={`pl-8 font-mono ${
                errors.feeAmount ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              {...register('feeAmount')}
              disabled={isPending}
            />
          </div>
          {errors.feeAmount && (
            <p className="text-xs text-destructive font-medium">{errors.feeAmount.message}</p>
          )}
        </div>

        {/* Service Description */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="serviceDescription" className="text-xs font-semibold text-foreground/80">
            Service Details / Issue Description
          </Label>
          <div className="relative">
            <textarea
              id="serviceDescription"
              rows={3}
              placeholder="Describe the trade service required (e.g. Boiler maintenance, leak repair...)"
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                errors.serviceDescription ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              {...register('serviceDescription')}
              disabled={isPending}
            />
          </div>
          {errors.serviceDescription && (
            <p className="text-xs text-destructive font-medium">
              {errors.serviceDescription.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md transition-all gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Booking Request...
          </>
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" />
            Confirm Booking Request
          </>
        )}
      </Button>
    </form>
  );
}
