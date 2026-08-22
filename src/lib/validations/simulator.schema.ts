import { z } from 'zod';

export const chatbotFormSchema = z.object({
  traderId: z.string().min(1, 'Trader ID is required'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(5, 'Valid phone number is required'),
  message: z.string().min(3, 'Message must be at least 3 characters'),
  postcodeOrCity: z.string().min(2, 'Postcode or city is required'),
  preferredTimeSlot: z.string().min(1, 'Preferred time slot is required'),
});

export const whatsappFormSchema = z.object({
  fromPhone: z.string().min(5, 'Sender phone number is required'),
  toPhone: z.string().min(5, 'Business phone number is required'),
  messageBody: z.string().min(3, 'Message body must be at least 3 characters'),
  whatsappMessageId: z.string().min(1, 'Message ID is required'),
});

export type ChatbotFormValues = z.infer<typeof chatbotFormSchema>;
export type WhatsAppFormValues = z.infer<typeof whatsappFormSchema>;
