'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { WorkAreaCard } from '@/components/dashboard/WorkAreaCard';

export default function TraderWorkAreaPage() {
  const { user } = useAuthStore();
  const traderId = user?.id || 'trader-123';

  return (
    <div className="max-w-4xl space-y-6">
      <WorkAreaCard traderId={traderId} />
    </div>
  );
}
