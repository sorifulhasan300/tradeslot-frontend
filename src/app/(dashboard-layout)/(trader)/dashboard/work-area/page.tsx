import React from 'react';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getWorkAreaServer } from '@/app/actions/work-area.actions';
import { WorkAreaCard } from '@/components/dashboard/WorkAreaCard';

export const revalidate = 0;

export default async function TraderWorkAreaPage() {
  const user = await getCurrentUserServer();
  const traderId = user?.id || 'trader-123';

  // Server-side read operation
  const workAreaRes = await getWorkAreaServer(traderId);
  const initialWorkArea = workAreaRes?.data || null;

  return (
    <div className="max-w-4xl space-y-6">
      <WorkAreaCard traderId={traderId} initialWorkArea={initialWorkArea} />
    </div>
  );
}
