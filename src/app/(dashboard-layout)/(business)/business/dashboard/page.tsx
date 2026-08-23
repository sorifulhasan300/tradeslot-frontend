import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { BusinessAdminDashboard } from '@/components/dashboard/BusinessAdminDashboard';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0; // Real-time business executive dashboard

export default async function BusinessDashboardPage() {
  const user = await getCurrentUserServer();

  // Server-side role guard: ONLY BUSINESS_ADMIN users can access page
  if (!user || user.role !== 'BUSINESS_ADMIN') {
    const targetRedirect = getDefaultRedirectForRole(user?.role);
    redirect(targetRedirect);
  }

  return <BusinessAdminDashboard initialUser={user} />;
}
