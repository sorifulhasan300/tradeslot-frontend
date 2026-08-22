import React from 'react';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getStripeStatusServer } from '@/app/actions/payment.actions';
import { StripeConnectCard } from '@/components/dashboard/StripeConnectCard';

export const revalidate = 0;

export default async function TraderPayoutsPage() {
  const user = await getCurrentUserServer();
  const traderId = user?.id || 'trader-123';

  // Server-side read operation
  const stripeStatusRes = await getStripeStatusServer(traderId);
  const initialStripeStatus = stripeStatusRes?.data || null;

  return (
    <div className="max-w-4xl space-y-6">
      <StripeConnectCard traderId={traderId} initialAccountStatus={initialStripeStatus} />
    </div>
  );
}
