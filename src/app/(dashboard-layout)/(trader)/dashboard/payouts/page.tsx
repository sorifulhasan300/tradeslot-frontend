import React from 'react';
import { getCurrentUserServer } from '@/app/actions/auth.actions';
import { getStripeStatusServer, getAllPaymentsServer } from '@/app/actions/payment.actions';
import { TraderPayoutsOverview } from '@/components/dashboard/TraderPayoutsOverview';

export const revalidate = 0; // Dynamic server component

export default async function TraderPayoutsPage() {
  const user = await getCurrentUserServer();
  const traderId = user?.id || 'trader-123';

  // Server-side parallel data fetching (BFF pattern)
  const [stripeStatusRes, paymentsRes] = await Promise.all([
    getStripeStatusServer(traderId),
    getAllPaymentsServer(),
  ]);

  const initialStripeStatus = stripeStatusRes?.data || null;
  const initialPayments = paymentsRes?.data || [];

  return (
    <div className="space-y-6">
      <TraderPayoutsOverview
        traderId={traderId}
        initialAccountStatus={initialStripeStatus}
        initialPayments={initialPayments}
      />
    </div>
  );
}
