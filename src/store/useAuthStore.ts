import { create } from 'zustand';
import { getCookie, removeCookie, setCookie, TOKEN_KEY, USER_KEY } from '@/lib/cookies';
import authService from '@/services/auth.service';
import { logoutAction } from '@/app/actions/auth.actions';
import { ApiCustomError } from '@/lib/api-client';
import { LoginPayload, RegisterPayload, User, VerifyOtpPayload } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresOtpVerification: boolean;
  pendingEmail: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setAuth: (user: User, token?: string) => void;
}

// Initialize state from stored cookies/localStorage if available in client
const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return getCookie(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const rawUser = getCookie(USER_KEY) || localStorage.getItem(USER_KEY);
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  isLoading: false,
  error: null,
  requiresOtpVerification: false,
  pendingEmail: null,

  clearError: () => set({ error: null }),

  setAuth: (user: User, token = 'authenticated-session-token') => {
    setCookie(TOKEN_KEY, token, 7);
    setCookie(USER_KEY, JSON.stringify(user), 7);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(payload);

      if (res.success && res.data?.user) {
        const user = res.data.user;
        const token = res.data.token || 'authenticated-session-token';
        get().setAuth(user, token);
        set({ isLoading: false });
        return true;
      }

      set({
        isLoading: false,
        error: res.message || 'Login failed. Please verify credentials.',
      });
      return false;
    } catch (err: unknown) {
      const customErr = err as ApiCustomError;
      set({
        isLoading: false,
        error: customErr?.message || 'Login failed. Please check your credentials.',
      });
      return false;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(payload);

      if (res.success) {
        const authData = res.data;
        const user = authData?.user;

        // Better Auth with OTP requires verification step
        if (authData?.requiresVerification || user?.emailVerified === false) {
          set({
            requiresOtpVerification: true,
            pendingEmail: payload.email,
            isLoading: false,
          });
          return true;
        }

        if (user) {
          get().setAuth(user, authData.token);
          set({ isLoading: false });
          return true;
        }

        set({
          requiresOtpVerification: true,
          pendingEmail: payload.email,
          isLoading: false,
        });
        return true;
      }

      set({
        isLoading: false,
        error: res.message || 'Registration failed. Please try again.',
      });
      return false;
    } catch (err: unknown) {
      const customErr = err as ApiCustomError;
      set({
        isLoading: false,
        error: customErr?.message || 'Registration failed. Please try again.',
      });
      return false;
    }
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.verifyEmail(payload);
      if (res.success) {
        set({
          requiresOtpVerification: false,
          pendingEmail: null,
          isLoading: false,
        });
        return true;
      }
      set({
        isLoading: false,
        error: res.message || 'Invalid or expired OTP code.',
      });
      return false;
    } catch (err: unknown) {
      const customErr = err as ApiCustomError;
      set({
        isLoading: false,
        error: customErr?.message || 'Invalid or expired OTP code.',
      });
      return false;
    }
  },

  resendOtp: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.resendOtp(email);
      set({ isLoading: false });
      return res.success;
    } catch (err: unknown) {
      const customErr = err as ApiCustomError;
      set({
        isLoading: false,
        error: customErr?.message || 'Failed to resend OTP. Please try again later.',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutAction();
    } catch (e) {
      // Ignore server action error
    }

    try {
      await authService.logout();
    } catch (e) {
      // Ignore logout error and clean local state
    } finally {
      removeCookie(TOKEN_KEY);
      removeCookie(USER_KEY);
      removeCookie('better-auth.session_token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresOtpVerification: false,
        pendingEmail: null,
      });
    }
  },

  checkAuth: async () => {
    const existingUser = get().user || getInitialUser();
    const existingToken = get().token || getInitialToken();

    // If we already have stored user session, confirm authentication state immediately
    if (existingUser) {
      set({
        user: existingUser,
        token: existingToken || 'authenticated-session-token',
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await authService.getSession();
      if (res.success && res.data?.user) {
        set({
          user: res.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },
}));
