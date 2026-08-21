export type UserRole = 'TRADER' | 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  emailVerified?: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
  session?: {
    token: string;
    expiresAt?: string;
  };
  requiresVerification?: boolean;
}
