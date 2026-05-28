import { verifyAuth } from '../_auth-util';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role === 'viewer') return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  let body: { cat_key?: string; label?: string; color?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { cat_key, label, color } = body;
  if (!cat_key || !label || !color) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields: cat_key, label, color' }), { status: 400, headers });
  }

  const result = await env.DB.prepare(
    `INSERT INTO tracker_categories (user_id, cat_key, label, color, sort_order)
     VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM tracker_categories WHERE user_id = ?))`
  ).bind(auth.user_id, cat_key, label, color, auth.user_id).run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), { status: 200, headers });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role === 'viewer') return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  let body: { id?: number; label?: string; color?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { id, label, color } = body;
  if (!id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers });

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (label !== undefined) { sets.push('label = ?'); vals.push(label); }
  if (color !== undefined) { sets.push('color = ?'); vals.push(color); }
  if (sets.length === 0) return new Response(JSON.stringify({ ok: true }), { status: 200, headers });

  vals.push(id, auth.user_id);
  await env.DB.prepare(
    `UPDATE tracker_categories SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...vals).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role === 'viewer') return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers });

  await env.DB.prepare('DELETE FROM tracker_categories WHERE id = ? AND user_id = ?').bind(id, auth.user_id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
