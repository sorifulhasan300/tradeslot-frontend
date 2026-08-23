import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { AdminBookingsView } from '@/components/dashboard/AdminBookingsView';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0; // Real-time data fetching

export default async function AdminBookingsPage() {
  const user = await getCurrentUserServer();

  // Server-side role guard: ONLY PLATFORM_ADMIN users can access page
  if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'ADMIN')) {
    const targetRedirect = getDefaultRedirectForRole(user?.role);
    redirect(targetRedirect);
  }

  return <AdminBookingsView initialUser={user} />;
}
