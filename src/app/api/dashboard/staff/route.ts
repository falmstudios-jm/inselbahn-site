import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: staff, error } = await supabase
      .from('staff')
      .select('id, name, role')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Staff fetch error:', error);
      return NextResponse.json({ staff: [] });
    }

    return NextResponse.json({ staff: staff || [] });
  } catch (err) {
    console.error('Staff error:', err);
    return NextResponse.json({ staff: [] });
  }
}
