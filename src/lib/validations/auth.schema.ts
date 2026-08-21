import { z } from 'zod';

// Phone number regex supporting Bangladesh (e.g., +88017... or 017...) and E.164 international numbers
export const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$|^\+?[1-9]\d{6,14}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  phone: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(phoneRegex, { message: 'Please enter a valid phone number (e.g. +88017... or +1415...)' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  role: z.enum(['TRADER', 'CUSTOMER'], {
    error: 'Please select a valid role (Trader or Customer)',
  }),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, { message: 'OTP verification code must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain numbers only' }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type VerifyOtpSchemaType = z.infer<typeof verifyOtpSchema>;
