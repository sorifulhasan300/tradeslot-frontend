'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { workAreaSchema, WorkAreaSchemaType } from '@/lib/validations/work-area.schema';
import { ApiResponse, DailyWorkArea } from '@/types/api.types';

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://tradeslot-backend-nine.vercel.app/api/v1';

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

export async function upsertWorkAreaAction(payload: WorkAreaSchemaType): Promise<ApiResponse<DailyWorkArea>> {
  try {
    const validated = workAreaSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid work area parameters',
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/work-area`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validated.data),
      cache: 'no-store',
    });

    const data = await safeJsonParse(res);
    if (!res.ok || !data.success) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || 'Failed to update work area',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/work-area');

    return data;
  } catch (error: any) {
    console.error('upsertWorkAreaAction Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error updating work area',
    };
  }
}

export async function getWorkAreaServer(traderId: string, date?: string): Promise<ApiResponse<DailyWorkArea>> {
  try {
    const headers = await getAuthHeader();
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`${BACKEND_URL}/work-area/${traderId}${query}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        message: 'No work area configured',
        data: null as any,
      };
    }

    return await safeJsonParse(res);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Error fetching work area from server',
      data: null as any,
    };
  }
}
