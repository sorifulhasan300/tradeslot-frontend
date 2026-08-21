import { authClient } from '@/lib/auth-client';
import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api.types';
import {
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  User,
  VerifyOtpPayload,
} from '@/types/auth.types';

export const authService = {
  /**
   * Log in user with email and password using Better Auth client
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const { data, error } = await authClient.signIn.email({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      return {
        success: false,
        statusCode: error.status || 400,
        message: error.message || 'Invalid email or password',
        data: null as any,
      };
    }

    const userData = data?.user as unknown as User;
    const token = (data as any)?.token || (data as any)?.session?.token || 'authenticated-session-token';

    return {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    };
  },

  /**
   * Register user (Trader or Customer) using Better Auth client
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    const { data, error } = await authClient.signUp.email({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      // @ts-expect-error additional user fields supported by backend Better Auth config
      role: payload.role,
      phone: payload.phone,
    });

    if (error) {
      return {
        success: false,
        statusCode: error.status || 400,
        message: error.message || 'Registration failed. Please check inputs.',
        data: null as any,
      };
    }

    const userData = data?.user as unknown as User;
    const token = (data as any)?.token || (data as any)?.session?.token;

    return {
      success: true,
      statusCode: 201,
      message: 'Registration successful',
      data: {
        user: userData,
        token,
        requiresVerification: true,
      },
    };
  },

  /**
   * Verify email OTP after registration
   */
  async verifyEmail(payload: VerifyOtpPayload): Promise<ApiResponse<null>> {
    // Try Better Auth client plugin first, fall back to backend API proxy
    try {
      if ((authClient as any).emailOtp?.verifyEmail) {
        const { error } = await (authClient as any).emailOtp.verifyEmail({
          email: payload.email,
          otp: payload.otp,
        });
        if (error) {
          throw new Error(error.message || 'Verification failed');
        }
        return {
          success: true,
          statusCode: 200,
          message: 'Email address verified successfully',
          data: null,
        };
      }
    } catch (e: any) {
      // Fallback to custom backend route
    }

    const response = await apiClient.post<ApiResponse<null>>('/auth/verify-email', payload);
    return response.data;
  },

  /**
   * Resend OTP verification code
   */
  async resendOtp(email: string): Promise<ApiResponse<null>> {
    try {
      if ((authClient as any).emailOtp?.sendVerificationOTP) {
        const { error } = await (authClient as any).emailOtp.sendVerificationOTP({
          email,
          type: 'email-verification',
        });
        if (!error) {
          return {
            success: true,
            statusCode: 200,
            message: 'OTP sent successfully',
            data: null,
          };
        }
      }
    } catch (e) {
      // Fallback to custom backend route
    }

    const response = await apiClient.post<ApiResponse<null>>('/auth/resend-otp', { email });
    return response.data;
  },

  /**
   * Fetch current active session using Better Auth getSession
   */
  async getSession(): Promise<ApiResponse<{ user: User; session: unknown }>> {
    const { data, error } = await authClient.getSession();

    if (error || !data?.user) {
      return {
        success: false,
        statusCode: 401,
        message: 'No active session found',
        data: null as any,
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Session retrieved successfully',
      data: {
        user: data.user as unknown as User,
        session: data.session,
      },
    };
  },

  /**
   * Sign out active session using Better Auth signOut
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      await authClient.signOut();
    } catch (e) {
      // Ignore client signOut error and fall back to API call
      await apiClient.post('/auth/sign-out', {});
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Logged out successfully',
      data: null,
    };
  },
};

export default authService;
