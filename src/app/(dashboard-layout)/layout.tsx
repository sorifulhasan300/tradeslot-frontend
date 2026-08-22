import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell initialUser={user}>
      {children}
    </DashboardShell>
  );
}
