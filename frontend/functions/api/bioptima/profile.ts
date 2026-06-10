import { verifyAuth } from '../_auth-util';
import { validateInt, validateFloat } from '../_security';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

interface ProfileRow {
  id: number; user_id: number; sex: string; age: number;
  height_cm: number; activity_factor: number; updated_at: string;
}

/* ── GET /api/bioptima/profile — devuelve el perfil del usuario ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const { results } = await env.DB.prepare(
    'SELECT * FROM bioptima_profile WHERE user_id = ?'
  ).bind(auth.user_id).all<ProfileRow>();

  return new Response(JSON.stringify({ ok: true, profile: results[0] ?? null }), { status: 200, headers: H });
};

/* ── POST /api/bioptima/profile — UPSERT perfil del usuario ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  let body: { sex?: string; age?: number; height_cm?: number; activity_factor?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { sex, age, height_cm, activity_factor } = body;
  if (!sex || !age || !height_cm || !activity_factor)
    return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios' }), { status: 400, headers: H });

  if (!['male', 'female'].includes(sex))
    return new Response(JSON.stringify({ ok: false, error: 'sex debe ser male o female' }), { status: 400, headers: H });

  if (validateInt(age, 10, 120) === null)
    return new Response(JSON.stringify({ ok: false, error: 'age: entre 10 y 120 años' }), { status: 400, headers: H });
  if (validateFloat(height_cm, 100, 250) === null)
    return new Response(JSON.stringify({ ok: false, error: 'height_cm: entre 100 y 250 cm' }), { status: 400, headers: H });
  if (validateFloat(activity_factor, 1.0, 2.5) === null)
    return new Response(JSON.stringify({ ok: false, error: 'activity_factor: entre 1.0 y 2.5' }), { status: 400, headers: H });

  await env.DB.prepare(`
    INSERT INTO bioptima_profile (user_id, sex, age, height_cm, activity_factor, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      sex             = excluded.sex,
      age             = excluded.age,
      height_cm       = excluded.height_cm,
      activity_factor = excluded.activity_factor,
      updated_at      = excluded.updated_at
  `).bind(auth.user_id, sex, age, height_cm, activity_factor).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};
