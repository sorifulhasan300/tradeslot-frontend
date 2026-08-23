import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getDefaultRedirectForRole } from '@/config/routes.config';

export const revalidate = 0;

export default async function BusinessDashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserServer();

  // Server-side authentication guard
  if (!user) {
    redirect('/login?redirect=/business/dashboard');
  }

  // Server-side role guard: ONLY BUSINESS_ADMIN users can access layout
  if (user.role !== 'BUSINESS_ADMIN') {
    const targetRedirect = getDefaultRedirectForRole(user.role);
    redirect(targetRedirect);
  }

  return <>{children}</>;
}
