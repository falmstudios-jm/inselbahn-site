import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Safety-net cleanup for expired pending bookings.
 * Deletes pending bookings older than 15 minutes to release capacity.
 * Triggered by Vercel Cron every 5 minutes.
 */
export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Delete pending bookings older than 15 minutes
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: expired, error } = await supabase
      .from('bookings')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', cutoff)
      .select('id');

    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    const count = expired?.length ?? 0;
    if (count > 0) {
      console.log(`Cleanup: deleted ${count} expired pending bookings`);
    }

    return NextResponse.json({ deleted: count });
  } catch (err) {
    console.error('Cleanup error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
