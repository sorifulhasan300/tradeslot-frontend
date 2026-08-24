import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getCookie, removeCookie, TOKEN_KEY, USER_KEY } from './cookies';

export interface ApiCustomError {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]> | Array<{ field: string; message: string }>;
  data?: unknown;
}

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // In browser, relative proxy or env var
    return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
  // Server-side
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://tradeslot-backend-nine.vercel.app/api/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Bearer Token automatically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = getCookie(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Unauthorized handling & Error Normalization
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; error?: string; errors?: Record<string, string[]>; data?: unknown }>) => {
    const status = error.response?.status || 500;
    const responseData = error.response?.data;

    // Build normalized structured error response
    let errorMessage = 'An unexpected network error occurred';
    if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (responseData?.error) {
      errorMessage = responseData.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const customError: ApiCustomError = {
      success: false,
      statusCode: status,
      message: errorMessage,
      errors: responseData?.errors,
      data: responseData?.data || null,
    };

    // 401 Unauthorized Handler
    if (status === 401 && typeof window !== 'undefined') {
      removeCookie(TOKEN_KEY);
      removeCookie(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        // Dispatch custom auth event or redirect to login
        window.dispatchEvent(new Event('tradeslot:unauthorized'));
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
