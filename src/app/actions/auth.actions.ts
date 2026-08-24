'use server';

import { cookies } from 'next/headers';
import { loginSchema, registerSchema, verifyOtpSchema, LoginSchemaType, RegisterSchemaType, VerifyOtpSchemaType } from '@/lib/validations/auth.schema';
import { ApiResponse } from '@/types/api.types';
import { AuthResponseData, User } from '@/types/auth.types';

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://tradeslot-backend-nine.vercel.app/api/v1';
const CLIENT_ORIGIN = process.env.CLIENT_URL || process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

export async function loginAction(payload: LoginSchemaType): Promise<ApiResponse<AuthResponseData>> {
  try {
    const validated = loginSchema.safeParse(payload);
    if (!validated.success) {
      const errorMap = validated.error.flatten().fieldErrors;
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid login credentials',
        errors: errorMap as Record<string, string[]>,
      };
    }

    // Better Auth sign-in endpoint path is /auth/sign-in/email
    // Note: Origin header is required by Better Auth CSRF protection for server-to-server requests
    const res = await fetch(`${BACKEND_URL}/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': CLIENT_ORIGIN,
      },
      body: JSON.stringify(validated.data),
      cache: 'no-store',
    });

    const responseText = await res.text();
    let data: any = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseErr) {
      console.error('loginAction: Non-JSON response received from backend:', responseText);
      return {
        success: false,
        statusCode: res.status || 500,
        message: 'Server error: Invalid response format from authentication backend.',
      };
    }

    if (!res.ok || data.error) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || data.error?.message || 'Login failed. Invalid email or password.',
      };
    }

    const userData: User = data.user || data.data?.user;
    const token: string = data.token || data.session?.token || data.data?.token || 'authenticated-session-token';

    // Store session and user info in cookies on server side
    const cookieStore = await cookies();
    cookieStore.set('tradeslot_token', token, {
      httpOnly: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    if (userData) {
      cookieStore.set('tradeslot_user', JSON.stringify(userData), {
        httpOnly: false,
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }

    // Forward any Better Auth session cookies set by backend
    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const cookieStr of setCookieHeaders) {
      const parts = cookieStr.split(';');
      const [nameValue] = parts;
      if (nameValue) {
        const [cookieName, ...valParts] = nameValue.split('=');
        if (cookieName && valParts.length > 0) {
          cookieStore.set(cookieName.trim(), valParts.join('=').trim(), {
            path: '/',
            sameSite: 'lax',
          });
        }
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    };
  } catch (error: any) {
    console.error('loginAction Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error during login authentication.',
    };
  }
}

export async function registerAction(payload: RegisterSchemaType): Promise<ApiResponse<AuthResponseData>> {
  try {
    const validated = registerSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid registration inputs',
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Better Auth sign-up endpoint path is /auth/sign-up/email
    const res = await fetch(`${BACKEND_URL}/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': CLIENT_ORIGIN,
      },
      body: JSON.stringify(validated.data),
      cache: 'no-store',
    });

    const responseText = await res.text();
    let data: any = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseErr) {
      console.error('registerAction: Non-JSON response received from backend:', responseText);
      return {
        success: false,
        statusCode: res.status || 500,
        message: 'Server error: Invalid response format from authentication backend.',
      };
    }

    if (!res.ok || data.error) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || data.error?.message || 'Registration failed. Please check your inputs.',
      };
    }

    const userData: User = data.user || data.data?.user;
    const token: string = data.token || data.session?.token || data.data?.token;

    if (token && userData) {
      const cookieStore = await cookies();
      cookieStore.set('tradeslot_token', token, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
      });
      cookieStore.set('tradeslot_user', JSON.stringify(userData), {
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }

    return {
      success: true,
      statusCode: 201,
      message: 'Registration successful',
      data: {
        user: userData,
        token,
        requiresVerification: data.requiresVerification ?? true,
      },
    };
  } catch (error: any) {
    console.error('registerAction Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error during registration.',
    };
  }
}

export async function verifyOtpAction(payload: VerifyOtpSchemaType): Promise<ApiResponse<null>> {
  try {
    const validated = verifyOtpSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid OTP format',
      };
    }

    const res = await fetch(`${BACKEND_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': CLIENT_ORIGIN,
      },
      body: JSON.stringify(validated.data),
      cache: 'no-store',
    });

    const responseText = await res.text();
    let data: any = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

    if (!res.ok || (data.success === false && !data.data)) {
      return {
        success: false,
        statusCode: res.status || 400,
        message: data.message || data.error?.message || 'Invalid or expired OTP code.',
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Email address verified successfully',
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || 'Server error verifying OTP code.',
    };
  }
}

export async function logoutAction(): Promise<ApiResponse<null>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tradeslot_token')?.value;

    if (token) {
      await fetch(`${BACKEND_URL}/auth/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': CLIENT_ORIGIN,
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
    }

    cookieStore.delete('tradeslot_token');
    cookieStore.delete('tradeslot_user');
    cookieStore.delete('better-auth.session_token');

    return {
      success: true,
      statusCode: 200,
      message: 'Logged out successfully',
      data: null,
    };
  } catch (error: any) {
    const cookieStore = await cookies();
    cookieStore.delete('tradeslot_token');
    cookieStore.delete('tradeslot_user');
    cookieStore.delete('better-auth.session_token');
    return {
      success: true,
      statusCode: 200,
      message: 'Logged out successfully',
      data: null,
    };
  }
}

export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const rawUser = cookieStore.get('tradeslot_user')?.value;
    if (rawUser) {
      return JSON.parse(rawUser) as User;
    }
  } catch (e) {
    return null;
  }
  return null;
}
