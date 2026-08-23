import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { BusinessPayoutsView } from '@/components/dashboard/BusinessPayoutsView';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0;

export default async function BusinessPayoutsPage() {
  const user = await getCurrentUserServer();

  if (!user || user.role !== 'BUSINESS_ADMIN') {
    const targetRedirect = getDefaultRedirectForRole(user?.role);
    redirect(targetRedirect);
  }

  return <BusinessPayoutsView />;
}
