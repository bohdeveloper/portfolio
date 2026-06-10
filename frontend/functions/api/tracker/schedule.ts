import { verifyAuth } from '../_auth-util';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  // Migración idempotente: añade track a categorías si no existe
  try { await env.DB.exec('ALTER TABLE tracker_categories ADD COLUMN track INTEGER NOT NULL DEFAULT 1'); } catch {}

  const [cats, tasks, userRow] = await Promise.all([
    env.DB.prepare(
      'SELECT id, cat_key, label, color, sort_order, track FROM tracker_categories WHERE user_id = ? ORDER BY sort_order, id'
    ).bind(auth.user_id).all(),
    env.DB.prepare(
      'SELECT id, day_index, activity_id, name, cat_key, start_min, end_min, description, track FROM tracker_tasks WHERE user_id = ? ORDER BY day_index, start_min'
    ).bind(auth.user_id).all(),
    env.DB.prepare('SELECT username FROM admin_users WHERE id = ?').bind(auth.user_id).first<{ username: string }>(),
  ]);

  return new Response(JSON.stringify({
    ok: true,
    user_id: auth.user_id,
    username: userRow?.username ?? '',
    categories: cats.results,
    tasks: tasks.results,
  }), { status: 200, headers });
};
