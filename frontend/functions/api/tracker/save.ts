import { jwtVerify } from 'jose';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=').slice(1).join('=').trim();
  if (!token) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  try {
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
  }

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
    `INSERT INTO tracker_records (date, activity_id, day_index, done, reason, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(date, activity_id) DO UPDATE SET done=excluded.done, reason=excluded.reason, updated_at=excluded.updated_at`
  ).bind(date, activity_id, day_index, done, reason ?? '').run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
