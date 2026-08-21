'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MapPin, Navigation, Calendar, Loader2, Save } from 'lucide-react';

import { workAreaSchema, WorkAreaSchemaType } from '@/lib/validations/work-area.schema';
import { workAreaService } from '@/services/work-area.service';
import { DailyWorkArea } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkAreaFormProps {
  traderId: string;
  initialData?: DailyWorkArea | null;
  onSuccess?: (data: DailyWorkArea) => void;
}

export function WorkAreaForm({ traderId, initialData, onSuccess }: WorkAreaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkAreaSchemaType>({
    resolver: zodResolver(workAreaSchema) as any,
    defaultValues: {
      traderId,
      postcodeOrCity: initialData?.postcodeOrCity || 'SW1A 1AA',
      radiusMiles: initialData?.radiusMiles || 15,
      date: initialData?.date ? initialData.date.split('T')[0] : today,
    },
  });

  const currentRadius = watch('radiusMiles');

  const onSubmit = async (data: WorkAreaSchemaType) => {
    setIsSubmitting(true);
    try {
      const response = await workAreaService.createWorkArea({
        traderId: data.traderId,
        postcodeOrCity: data.postcodeOrCity,
        radiusMiles: Number(data.radiusMiles),
        date: data.date,
      });
      if (response.success && response.data) {
        toast.success('Work Zone Updated!', {
          description: `Operating in ${data.postcodeOrCity} within ${data.radiusMiles} miles on ${data.date}.`,
        });
        if (onSuccess) onSuccess(response.data);
      } else {
        toast.error('Failed to update work zone', {
          description: response.message || 'Could not save operating zone.',
        });
      }
    } catch (err: any) {
      toast.error('Work Zone Error', {
        description: err.message || 'An error occurred while saving operating zone.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4" noValidate>
      <input type="hidden" {...register('traderId')} value={traderId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Postcode or City */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="postcodeOrCity" className="text-xs font-semibold text-foreground/80">
            Center Postcode or City
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <MapPin className="h-4 w-4 text-emerald-500" />
            </div>
            <Input
              id="postcodeOrCity"
              type="text"
              placeholder="e.g. SW1A 1AA or Central London"
              className={`pl-9 uppercase font-mono ${
                errors.postcodeOrCity ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              {...register('postcodeOrCity')}
              disabled={isSubmitting}
            />
          </div>
          {errors.postcodeOrCity && (
            <p className="text-xs text-destructive font-medium">
              {errors.postcodeOrCity.message}
            </p>
          )}
        </div>

        {/* Coverage Radius */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="radiusMiles" className="text-xs font-semibold text-foreground/80">
              Coverage Radius (Miles)
            </Label>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {currentRadius || 0} mi
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Navigation className="h-4 w-4 text-emerald-500" />
            </div>
            <Input
              id="radiusMiles"
              type="number"
              min={1}
              max={100}
              placeholder="15"
              className={`pl-9 font-mono ${
                errors.radiusMiles ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              {...register('radiusMiles')}
              disabled={isSubmitting}
            />
          </div>
          {errors.radiusMiles && (
            <p className="text-xs text-destructive font-medium">{errors.radiusMiles.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-semibold text-foreground/80">
            Operating Date
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
            <Input
              id="date"
              type="date"
              className={`pl-9 font-mono ${
                errors.date ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              {...register('date')}
              disabled={isSubmitting}
            />
          </div>
          {errors.date && (
            <p className="text-xs text-destructive font-medium">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating Zone...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Daily Operating Zone
          </>
        )}
      </Button>
    </form>
  );
}
