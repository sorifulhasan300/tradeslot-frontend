'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { StripeConnectCard } from '@/components/dashboard/StripeConnectCard';

export default function TraderPayoutsPage() {
  const { user } = useAuthStore();
  const traderId = user?.id || 'trader-123';

  return (
    <div className="max-w-4xl space-y-6">
      <StripeConnectCard traderId={traderId} />
    </div>
  );
}
