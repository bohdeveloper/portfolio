import { verifyAuth } from '../_auth-util';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  let body: { date?: string; activity_id?: string; day_index?: number; done?: number; reason?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { date, activity_id, day_index, done, reason } = body;
  if (!date || !activity_id || day_index === undefined || done === undefined) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers });
  }

  await env.DB.prepare(
    `INSERT INTO tracker_records (date, activity_id, day_index, done, reason, user_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(date, activity_id) DO UPDATE SET done=excluded.done, reason=excluded.reason, updated_at=excluded.updated_at`
  ).bind(date, activity_id, day_index, done, reason ?? '', auth.user_id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

/* ── DELETE /api/tracker/save?until=YYYY-MM-DD — vaciar historial hasta fecha ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  const until = new URL(request.url).searchParams.get('until') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing or invalid until date (YYYY-MM-DD)' }), { status: 400, headers });
  }

  await env.DB.prepare('DELETE FROM tracker_records WHERE user_id = ? AND date <= ?')
    .bind(auth.user_id, until).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
