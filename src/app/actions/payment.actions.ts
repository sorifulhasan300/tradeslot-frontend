'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ApiResponse, StripeAccountStatus, Payment } from '@/types/api.types';

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getAuthHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('tradeslot_token')?.value;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function safeJsonParse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function onboardStripeAction(
  traderId: string
): Promise<ApiResponse<{ onboardingUrl: string; accountId: string }>> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/payments/onboard`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ traderId }),
      cache: 'no-store',
    });

    const data = await safeJsonParse(res);
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to initialize Stripe onboarding',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/payouts');

    return data;
  } catch (error: any) {
    console.error('onboardStripeAction Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error initiating Stripe onboarding',
    };
  }
}

export async function getStripeStatusServer(traderId: string): Promise<ApiResponse<StripeAccountStatus>> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/payments/status/${traderId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        message: 'Could not retrieve Stripe status',
        data: null as any,
      };
    }

    return await safeJsonParse(res);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Error fetching Stripe status from server',
      data: null as any,
    };
  }
}

export async function getExpressDashboardUrlAction(traderId: string): Promise<ApiResponse<{ url: string }>> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/payments/dashboard/${traderId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await safeJsonParse(res);
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Dashboard URL unavailable',
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Error creating Stripe Express session',
    };
  }
}

export async function createPaymentIntentAction(
  bookingId: string
): Promise<ApiResponse<{ clientSecret: string; paymentIntentId: string }>> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/payments/create-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookingId }),
      cache: 'no-store',
    });

    const data = await safeJsonParse(res);
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to create payment intent',
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error creating Stripe payment intent',
    };
  }
}

export async function getAllPaymentsServer(params?: Record<string, any>): Promise<ApiResponse<Payment[]>> {
  try {
    const headers = await getAuthHeader();
    const query = new URLSearchParams(params).toString();
    const url = `${BACKEND_URL}/payments${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        message: 'Could not retrieve payments',
        data: [],
      };
    }

    return await safeJsonParse(res);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Error fetching payments from server',
      data: [],
    };
  }
}
