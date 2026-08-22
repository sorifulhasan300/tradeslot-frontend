'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { BookingScheduleList } from '@/components/dashboard/BookingScheduleList';

export default function TraderBookingsPage() {
  const { user } = useAuthStore();
  const traderId = user?.id || 'trader-123';

  return (
    <div className="space-y-6">
      <BookingScheduleList traderId={traderId} />
    </div>
  );
}
