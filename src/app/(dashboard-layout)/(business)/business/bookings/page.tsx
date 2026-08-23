import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { BusinessBookingsView } from '@/components/dashboard/BusinessBookingsView';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0;

export default async function BusinessBookingsPage() {
  const user = await getCurrentUserServer();

  if (!user || user.role !== 'BUSINESS_ADMIN') {
    const targetRedirect = getDefaultRedirectForRole(user?.role);
    redirect(targetRedirect);
  }

  return <BusinessBookingsView />;
}
