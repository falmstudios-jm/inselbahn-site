import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';

const giftCardSchema = z.object({
  amount: z.number().min(5).max(500),
  purchaser_name: z.string().min(2).max(100),
  purchaser_email: z.string().email(),
  recipient_name: z.string().max(100).optional(),
  recipient_message: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = giftCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: 'eur',
      metadata: {
        type: 'gift_card',
        amount: String(input.amount),
        purchaser_name: input.purchaser_name,
        purchaser_email: input.purchaser_email,
        recipient_name: input.recipient_name || '',
        recipient_message: input.recipient_message || '',
      },
      payment_method_types: ['card', 'paypal'],
      receipt_email: input.purchaser_email,
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Gift card error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
