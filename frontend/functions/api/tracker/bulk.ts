import { verifyAuth } from '../_auth-util';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface BulkRecord {
  date: string;
  activity_id: string;
  day_index: number;
  done: number;
  reason?: string;
}

/* POST /api/tracker/bulk — upsert múltiples registros de una vez */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  let body: { records?: BulkRecord[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { records } = body;
  if (!records?.length) return new Response(JSON.stringify({ ok: false, error: 'No records' }), { status: 400, headers });
  if (records.length > 365) return new Response(JSON.stringify({ ok: false, error: 'Too many records (max 365)' }), { status: 400, headers });

  const stmt = env.DB.prepare(
    `INSERT INTO tracker_records (date, activity_id, day_index, done, reason, user_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(date, activity_id) DO UPDATE SET done=excluded.done, reason=excluded.reason, updated_at=excluded.updated_at`
  );

  for (const rec of records) {
    if (!rec.date || !rec.activity_id || rec.day_index === undefined || rec.done === undefined) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)) continue;
    await stmt.bind(rec.date, rec.activity_id, rec.day_index, rec.done, rec.reason ?? '', auth.user_id).run();
  }

  return new Response(JSON.stringify({ ok: true, count: records.length }), { status: 200, headers });
};
