import React from 'react';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getTraderBookingsServer } from '@/app/actions/booking.actions';
import { BookingScheduleList } from '@/components/dashboard/BookingScheduleList';

export const revalidate = 0;

export default async function TraderBookingsPage() {
  const user = await getCurrentUserServer();
  const traderId = user?.id || 'trader-123';

  // Server-side read operation
  const bookingsRes = await getTraderBookingsServer({ traderId, page: 1, limit: 10 });
  const initialBookings = bookingsRes?.data || [];

  return (
    <div className="space-y-6">
      <BookingScheduleList traderId={traderId} initialBookings={initialBookings} />
    </div>
  );
}
