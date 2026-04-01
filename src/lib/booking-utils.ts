import { z } from 'zod';
import crypto from 'crypto';

export const bookingSchema = z.object({
  departure_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(42),
  children: z.number().int().min(0).max(42),
  children_free: z.number().int().min(0).max(10),
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().optional(),
  discount_code: z.string().optional(),
  gift_card_code: z.string().optional(),
  invoice: z.object({
    company_name: z.string().min(2),
    street: z.string().min(2),
    postal_code: z.string().min(4),
    city: z.string().min(2),
    vat_id: z.string().optional(),
  }).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export function calculateTotal(
  adults: number,
  children: number,
  priceAdult: number,
  priceChild: number,
  discount: number = 0
): number {
  const subtotal = adults * priceAdult + children * priceChild;
  return Math.max(0, subtotal - discount);
}

export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `IB-${year}-${suffix}`;
}

export function generateCancelToken(): string {
  return crypto.randomUUID();
}
