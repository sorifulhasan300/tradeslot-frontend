import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BACKEND_BASE_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') || 'https://tradeslot-backend-nine.vercel.app';
  }
  return process.env.BETTER_AUTH_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_BACKEND_BASE_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') || 'https://tradeslot-backend-nine.vercel.app';
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  basePath: '/api/v1/auth',
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
