import { NextResponse } from 'next/server';
import { getSession } from '@/lib/dashboard-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: logs, error } = await supabase
      .from('operations_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Ops log fetch error:', error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err) {
    console.error('Ops history error:', err);
    return NextResponse.json({ logs: [] });
  }
}
