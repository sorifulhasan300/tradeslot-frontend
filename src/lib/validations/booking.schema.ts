import { z } from 'zod';
import { phoneRegex } from './auth.schema';

export const bookingRequestSchema = z.object({
  traderId: z.string().min(1, { message: 'Trader ID is required' }),
  customerName: z
    .string()
    .min(2, { message: 'Customer name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  customerPhone: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(phoneRegex, { message: 'Please enter a valid phone number' }),
  customerEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, { message: 'Service address must be at least 5 characters' }),
  postcode: z
    .string()
    .min(2, { message: 'Postcode must be at least 2 characters' }),
  serviceDescription: z
    .string()
    .min(5, { message: 'Please describe the required service in detail' }),
  startTime: z
    .string()
    .min(1, { message: 'Slot start time is required' }),
  endTime: z
    .string()
    .min(1, { message: 'Slot end time is required' }),
  feeAmount: z
    .coerce
    .number()
    .min(0, { message: 'Deposit / fee amount must be non-negative' }),
  channel: z.enum(['WEB_CHATBOT', 'WHATSAPP', 'DIRECT'], {
    error: 'Please select a valid intake channel',
  }).default('WEB_CHATBOT'),
  notes: z.string().optional(),
});

export type BookingRequestSchemaType = z.infer<typeof bookingRequestSchema>;
export type BookingRequestInputType = z.input<typeof bookingRequestSchema>;
