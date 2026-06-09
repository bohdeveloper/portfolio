import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };
const bad = (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: H });

/* Upsert last_modified en el resumen mensual del perfil/mes al que pertenece el ítem.
   Llamar siempre después de cualquier escritura (POST, PATCH, DELETE) para que la
   fecha de última modificación quede almacenada en la BBDD y sea consistente
   entre dispositivos, en lugar de depender de localStorage. */
async function touchLastModified(db: D1Database, profileId: number, year: number, month: number) {
  await db.prepare(`
    INSERT INTO moneta_monthly_summary (profile_id, year, month, last_modified)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(profile_id, year, month) DO UPDATE SET last_modified = CURRENT_TIMESTAMP
  `).bind(profileId, year, month).run();
}

/* ── POST /api/moneta/item — crear ítem ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    profile_id: number; year: number; month: number;
    name: string; amount: number; type: string; sort_order?: number;
  };
  const { profile_id, year, month, name, amount, type, sort_order = 99 } = body;
  if (!profile_id || !name || year == null || month == null) return bad('Faltan parámetros');

  const profileOwner = await env.DB.prepare(
    'SELECT id FROM moneta_profiles WHERE id = ? AND user_id = ?'
  ).bind(profile_id, auth.user_id).first<{ id: number }>();
  if (!profileOwner) {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });
  }

  try {
    const result = await env.DB.prepare(`
      INSERT INTO moneta_items (profile_id, year, month, name, amount, type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(profile_id, year, month, name, amount ?? 0, type, sort_order).run();

    await touchLastModified(env.DB, profile_id, year, month);

    return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── PATCH /api/moneta/item?id=N — actualizar nombre, importe y/o importe real ── */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta id');

  const body = await request.json() as { name?: string; amount?: number; real_amount?: number | null };

  const parts: string[] = [];
  const vals: unknown[] = [];
  if (body.name        !== undefined) { parts.push('name=?');        vals.push(body.name); }
  if (body.amount      !== undefined) { parts.push('amount=?');      vals.push(body.amount); }
  if ('real_amount' in body)          { parts.push('real_amount=?'); vals.push(body.real_amount ?? null); }
  if (parts.length === 0) return bad('Nada que actualizar');

  try {
    await env.DB.prepare(
      `UPDATE moneta_items SET ${parts.join(', ')}
       WHERE id=? AND profile_id IN (SELECT id FROM moneta_profiles WHERE user_id=?)`
    ).bind(...vals, id, auth.user_id).run();

    // Actualizar last_modified en el resumen mensual del ítem modificado
    const item = await env.DB.prepare(
      'SELECT profile_id, year, month FROM moneta_items WHERE id=?'
    ).bind(id).first<{ profile_id: number; year: number; month: number }>();
    if (item) await touchLastModified(env.DB, item.profile_id, item.year, item.month);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/moneta/item?id=N — borrar ítem ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta id');

  try {
    // Obtener datos del ítem antes de borrar para actualizar last_modified después
    const item = await env.DB.prepare(
      'SELECT profile_id, year, month FROM moneta_items WHERE id=? AND profile_id IN (SELECT id FROM moneta_profiles WHERE user_id=?)'
    ).bind(id, auth.user_id).first<{ profile_id: number; year: number; month: number }>();

    await env.DB.prepare(
      'DELETE FROM moneta_items WHERE id=? AND profile_id IN (SELECT id FROM moneta_profiles WHERE user_id=?)'
    ).bind(id, auth.user_id).run();

    if (item) await touchLastModified(env.DB, item.profile_id, item.year, item.month);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
