'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { bookingRequestSchema, BookingRequestSchemaType } from '@/lib/validations/booking.schema';
import { ApiResponse, AvailableSlot, Booking, BookingStatus } from '@/types/api.types';
import { GetBookingsQueryParams } from '@/services/booking.service';

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

export async function createBookingAction(payload: BookingRequestSchemaType): Promise<ApiResponse<Booking>> {
  try {
    const validated = bookingRequestSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        statusCode: 400,
        message: 'Validation failed for booking request',
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const channelMap: Record<string, string> = {
      DIRECT: 'WEB_CHAT',
      WEB_CHATBOT: 'WEB_CHATBOT',
      WHATSAPP: 'WHATSAPP',
    };

    const startDate = new Date(validated.data.startTime);
    const endDate = validated.data.endTime
      ? new Date(validated.data.endTime)
      : new Date(startDate.getTime() + 2 * 3600 * 1000);

    const backendPayload = {
      traderId: validated.data.traderId,
      customerName: validated.data.customerName,
      customerPhone: validated.data.customerPhone,
      customerEmail: validated.data.customerEmail || undefined,
      originChannel: channelMap[validated.data.channel] || 'WEB_CHATBOT',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      flatBookingFee: Math.round(Number(validated.data.feeAmount || 0)),
      jobAmount: 0,
      bufferMinutes: 30,
    };

    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload),
      cache: 'no-store',
    });

    const data = await safeJsonParse(res);
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to create booking',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bookings');
    revalidatePath('/customer/dashboard');

    return data;
  } catch (error: any) {
    console.error('createBookingAction Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error creating booking',
    };
  }
}

export async function updateBookingStatusAction(
  id: string,
  status: BookingStatus
): Promise<ApiResponse<Booking>> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
      cache: 'no-store',
    });

    const data = await safeJsonParse(res);
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to update booking status',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bookings');
    revalidatePath('/customer/dashboard');

    return data;
  } catch (error: any) {
    console.error('updateBookingStatusAction Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error updating booking status',
    };
  }
}

export async function getTraderBookingsServer(params: GetBookingsQueryParams): Promise<ApiResponse<Booking[]>> {
  try {
    const headers = await getAuthHeader();
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);

    const url = `${BACKEND_URL}/bookings/trader/${params.traderId}?${queryParams.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        message: 'Failed to fetch bookings',
        data: [],
      };
    }

    return await safeJsonParse(res);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Error fetching bookings from server',
      data: [],
    };
  }
}

export async function getAvailableSlotsServer(traderId: string, date: string): Promise<ApiResponse<AvailableSlot[]>> {
  try {
    const res = await fetch(`${BACKEND_URL}/bookings/slots/${traderId}?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        message: 'Failed to fetch available slots',
        data: [],
      };
    }

    return await safeJsonParse(res);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Error fetching available slots from server',
      data: [],
    };
  }
}
