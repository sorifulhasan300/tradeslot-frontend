import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { BusinessTeamView } from '@/components/dashboard/BusinessTeamView';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0;

export default async function BusinessTeamPage() {
  const user = await getCurrentUserServer();

  if (!user || user.role !== 'BUSINESS_ADMIN') {
    const targetRedirect = getDefaultRedirectForRole(user?.role);
    redirect(targetRedirect);
  }

  return <BusinessTeamView />;
}
