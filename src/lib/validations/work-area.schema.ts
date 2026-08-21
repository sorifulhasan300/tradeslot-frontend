import { z } from 'zod';

export const workAreaSchema = z.object({
  traderId: z.string().min(1, { message: 'Trader ID is required' }),
  postcodeOrCity: z
    .string()
    .min(2, { message: 'Postcode or City must be at least 2 characters' })
    .max(50, { message: 'Postcode or City cannot exceed 50 characters' }),
  radiusMiles: z
    .coerce
    .number()
    .min(1, { message: 'Coverage radius must be at least 1 mile' })
    .max(100, { message: 'Coverage radius cannot exceed 100 miles' }),
  date: z
    .string()
    .min(1, { message: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' }),
});

export type WorkAreaSchemaType = z.infer<typeof workAreaSchema>;
export type WorkAreaInputType = z.input<typeof workAreaSchema>;
