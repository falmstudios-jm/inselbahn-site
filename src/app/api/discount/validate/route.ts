import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string' || code.trim().length < 2) {
      return NextResponse.json(
        { valid: false, error: 'Ungültiger Rabattcode' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().slice(0, 10);

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discount) {
      return NextResponse.json({
        valid: false,
        error: 'Rabattcode nicht gefunden',
      });
    }

    // Check date range
    if (discount.valid_from && today < discount.valid_from) {
      return NextResponse.json({
        valid: false,
        error: 'Dieser Rabattcode ist noch nicht gültig',
      });
    }

    if (discount.valid_until && today > discount.valid_until) {
      return NextResponse.json({
        valid: false,
        error: 'Dieser Rabattcode ist abgelaufen',
      });
    }

    // Check max uses
    if (discount.max_uses !== null && discount.current_uses >= discount.max_uses) {
      return NextResponse.json({
        valid: false,
        error: 'Dieser Rabattcode wurde bereits zu oft eingelöst',
      });
    }

    return NextResponse.json({
      valid: true,
      type: discount.type as 'percentage' | 'fixed',
      value: Number(discount.value),
      description: discount.description || undefined,
    });
  } catch (err) {
    console.error('Discount validation error:', err);
    return NextResponse.json(
      { valid: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
