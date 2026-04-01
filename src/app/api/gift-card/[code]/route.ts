import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length < 5) {
      return NextResponse.json(
        { valid: false, error: 'Ungültiger Gutscheincode' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('remaining_value, expires_at, is_active')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !giftCard) {
      return NextResponse.json(
        { valid: false, error: 'Gutscheincode nicht gefunden' },
        { status: 404 }
      );
    }

    if (!giftCard.is_active) {
      return NextResponse.json({
        valid: false,
        error: 'Dieser Gutschein ist nicht mehr aktiv',
      });
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Dieser Gutschein ist abgelaufen',
      });
    }

    if (giftCard.remaining_value <= 0) {
      return NextResponse.json({
        valid: false,
        error: 'Dieser Gutschein hat kein Restguthaben',
      });
    }

    return NextResponse.json({
      valid: true,
      remaining_value: Number(giftCard.remaining_value),
      expires_at: giftCard.expires_at,
    });
  } catch (err) {
    console.error('Gift card validation error:', err);
    return NextResponse.json(
      { valid: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
