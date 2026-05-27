import { verifyAuth } from '../_auth-util';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  const url    = new URL(request.url);
  const period = url.searchParams.get('period') ?? 'monthly';
  const date   = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const ref = new Date(date);
  let start: string, end: string;

  if (period === 'yearly') {
    start = `${ref.getFullYear()}-01-01`;
    end   = `${ref.getFullYear()}-12-31`;
  } else if (period === 'quarterly') {
    const q = Math.floor(ref.getMonth() / 3);
    start = new Date(ref.getFullYear(), q * 3, 1).toISOString().slice(0, 10);
    end   = new Date(ref.getFullYear(), q * 3 + 3, 0).toISOString().slice(0, 10);
  } else {
    start = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}-01`;
    end   = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).toISOString().slice(0, 10);
  }

  const { results } = await env.DB.prepare(
    `SELECT date, activity_id, day_index, done, reason
     FROM tracker_records WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date`
  ).bind(auth.user_id, start, end).all();

  const total = results.length;
  const done  = results.filter((r: unknown) => (r as { done: number }).done).length;

  return new Response(JSON.stringify({
    ok: true,
    data: { period, start, end, total, done, rate: total > 0 ? Math.round(done / total * 100) : 0, records: results },
  }), { status: 200, headers });
};
