import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0; // Dynamic real-time executive dashboard

export default async function AdminDashboardPage() {
  const user = await getCurrentUserServer();

  // Server-side role guard: ONLY PLATFORM_ADMIN users can access layout
  if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'ADMIN')) {
    const targetRedirect = getDefaultRedirectForRole(user?.role);
    redirect(targetRedirect);
  }

  return <AdminDashboard initialUser={user} />;
}
