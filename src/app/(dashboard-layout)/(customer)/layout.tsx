import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';

export const revalidate = 0;

export default async function CustomerDashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserServer();

  // Server-side authentication guard
  if (!user) {
    redirect('/login?redirect=/customer/dashboard');
  }

  // Server-side role guard: TRADER cannot access customer routes
  if (user.role !== 'CUSTOMER') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
