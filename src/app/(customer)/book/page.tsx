'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, ShieldCheck, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedTrader {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  area: string;
  distance: string;
  startingPrice: number;
  availableSlot: string;
}

const FEATURED_TRADERS: FeaturedTrader[] = [
  {
    id: 'trader-123',
    name: 'Apex Heating & Plumbing',
    trade: 'Gas & Plumbing Specialist',
    rating: 4.9,
    reviews: 128,
    area: 'Marylebone, London (NW1)',
    distance: '2.4 miles away',
    startingPrice: 50,
    availableSlot: 'Today @ 14:30',
  },
  {
    id: 'trader-456',
    name: 'VoltCraft Electrical Services',
    trade: 'Certified Electrician & EV Charging',
    rating: 4.8,
    reviews: 94,
    area: 'Soho, London (W1D)',
    distance: '3.1 miles away',
    startingPrice: 65,
    availableSlot: 'Tomorrow @ 09:00',
  },
  {
    id: 'trader-789',
    name: 'Premier Gas Solutions',
    trade: 'Boiler Repair & Installation',
    rating: 5.0,
    reviews: 62,
    area: 'Kensington, London (W8)',
    distance: '4.5 miles away',
    startingPrice: 55,
    availableSlot: 'Tomorrow @ 11:30',
  },
];

export default function FindAndBookPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const filteredTraders = FEATURED_TRADERS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.trade.toLowerCase().includes(query.toLowerCase()) ||
      t.area.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Search Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-border/40 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
            <Sparkles className="h-3 w-3 mr-1" /> Real-Time Buffer Gap Matching
          </Badge>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Find & Book a Local Trader</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Search nearby verified tradespeople with guaranteed travel buffer gap scheduling and Stripe protection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Service or Trade (e.g. Gas, Electric)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs bg-background/80 h-10"
            />
          </div>

          <div className="relative sm:col-span-1">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Postcode / City (e.g. NW1, W1D)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 text-xs bg-background/80 h-10"
            />
          </div>

          <Button className="h-10 text-xs font-semibold gap-2 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            <Search className="h-4 w-4" /> Search Availability
          </Button>
        </div>
      </div>

      {/* Trader Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Available Local Traders</h3>
          <span className="text-xs text-muted-foreground">{filteredTraders.length} traders in zone</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTraders.map((trader) => (
            <Card key={trader.id} className="border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">{trader.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">{trader.trade}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{trader.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{trader.area} ({trader.distance})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-medium">Next slot: {trader.availableSlot}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Verified • Stripe Protection</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-mono">FROM</span>
                    <p className="text-sm font-bold text-foreground">£{trader.startingPrice}</p>
                  </div>

                  <Link
                    href={`/book/${trader.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/90 transition-all"
                  >
                    Book Slot
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
