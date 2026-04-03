import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length < 6) {
      return NextResponse.json(
        { error: 'Ungültiger Gutscheincode' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('code, initial_value, remaining_value, created_at, recipient_name, recipient_message, purchaser_name')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !giftCard) {
      return NextResponse.json(
        { error: 'Gutschein nicht gefunden' },
        { status: 404 }
      );
    }

    // Calculate validity: end of 3rd year after purchase (§195/§199 BGB)
    const purchaseYear = new Date(giftCard.created_at).getFullYear();
    const validUntil = `31.12.${purchaseYear + 3}`;

    return NextResponse.json({
      code: giftCard.code,
      amount: giftCard.initial_value,
      remaining: giftCard.remaining_value,
      validUntil,
      recipientName: giftCard.recipient_name || '',
      recipientMessage: giftCard.recipient_message || '',
      purchaserName: giftCard.purchaser_name || '',
    });
  } catch (err) {
    console.error('Gift card print API error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
