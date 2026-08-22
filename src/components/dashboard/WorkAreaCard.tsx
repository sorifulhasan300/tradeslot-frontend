'use client';

import { useState, useTransition } from 'react';
import { MapPin, Navigation, Compass, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { upsertWorkAreaAction } from '@/app/actions/work-area.actions';
import { DailyWorkArea } from '@/types/api.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkAreaCardProps {
  traderId: string;
  initialWorkArea?: DailyWorkArea | null;
}

export function WorkAreaCard({ traderId, initialWorkArea }: WorkAreaCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const [isPending, startTransition] = useTransition();

  const [postcodeOrCity, setPostcodeOrCity] = useState(initialWorkArea?.postcodeOrCity || 'SW1A 1AA');
  const [radiusMiles, setRadiusMiles] = useState(initialWorkArea?.radiusMiles?.toString() || '15');
  const [selectedDate, setSelectedDate] = useState(initialWorkArea?.date?.split('T')[0] || today);
  const [currentWorkArea, setCurrentWorkArea] = useState<DailyWorkArea | null>(initialWorkArea || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcodeOrCity.trim()) {
      toast.error('Please enter a valid postcode or city');
      return;
    }

    startTransition(async () => {
      const res = await upsertWorkAreaAction({
        traderId,
        postcodeOrCity: postcodeOrCity.trim(),
        radiusMiles: parseInt(radiusMiles, 10),
        date: selectedDate,
      });

      if (res.success && res.data) {
        toast.success(res.message || 'Work area updated successfully!');
        setCurrentWorkArea(res.data);
      } else {
        toast.error(res.message || 'Failed to update work area');
      }
    });
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Daily Work Zone Setup</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set your geographic operating radius for customer bookings
              </CardDescription>
            </div>
          </div>
          {currentWorkArea && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Active Zone</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postcode" className="text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Postcode / City
              </Label>
              <Input
                id="postcode"
                placeholder="e.g. SW1A 1AA or London"
                value={postcodeOrCity}
                onChange={(e) => setPostcodeOrCity(e.target.value)}
                className="bg-background/50 text-sm font-mono uppercase"
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="radius" className="text-xs font-medium flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                Travel Radius
              </Label>
              <Select value={radiusMiles} onValueChange={(val) => val && setRadiusMiles(val)} disabled={isPending}>
                <SelectTrigger id="radius" className="bg-background/50 text-sm">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Miles Radius</SelectItem>
                  <SelectItem value="10">10 Miles Radius</SelectItem>
                  <SelectItem value="15">15 Miles Radius</SelectItem>
                  <SelectItem value="25">25 Miles Radius</SelectItem>
                  <SelectItem value="50">50 Miles Radius</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-medium">
                Effective Date
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-background/50 text-sm font-mono"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="text-xs text-muted-foreground">
              {currentWorkArea ? (
                <span>Current: <strong>{currentWorkArea.postcodeOrCity}</strong> ({currentWorkArea.radiusMiles} miles)</span>
              ) : (
                <span>No active work zone saved for this date</span>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Update Zone</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
