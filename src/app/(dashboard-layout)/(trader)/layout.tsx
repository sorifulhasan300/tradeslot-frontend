import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';

export const revalidate = 0;

export default async function TraderDashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserServer();

  // Server-side authentication guard
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // Server-side role guard: CUSTOMER cannot access trader routes
  if (user.role !== 'TRADER') {
    redirect('/customer/dashboard');
  }

  return <>{children}</>;
}
