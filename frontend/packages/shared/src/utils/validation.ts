// Validation utilities using Zod
import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(3).max(200),
});

export const ticketTemplateSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  price: z.string().regex(/^\d+$/),
  supply: z.number().int().positive(),
  isSoulbound: z.boolean(),
  royaltyPercentage: z.number().int().min(0).max(10),
});

export function validateEvent(data: unknown) {
  return eventSchema.safeParse(data);
}

export function validateTicketTemplate(data: unknown) {
  return ticketTemplateSchema.safeParse(data);
}
