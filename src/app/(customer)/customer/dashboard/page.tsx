import React from 'react';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getTraderBookingsServer } from '@/app/actions/booking.actions';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';

export const revalidate = 0;

export default async function CustomerDashboardPage() {
  const user = await getCurrentUserServer();
  const traderId = 'trader-123'; // Default primary trader for customer view

  // Server-side read operation using Node fetch / server headers
  const bookingsRes = await getTraderBookingsServer({ traderId, page: 1, limit: 10 });
  const initialBookings = bookingsRes?.data || [];

  return <CustomerDashboard initialUser={user} initialBookings={initialBookings} />;
}
