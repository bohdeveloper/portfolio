import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };
const bad = (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: H });
const forbidden = () => new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

/* ── POST /api/games/manage — crear o actualizar juego ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') return forbidden();

  let body: { id?: number; name?: string; slug?: string; description?: string; url?: string; screenshot?: string; is_top?: number };
  try { body = await request.json(); } catch { return bad('Invalid JSON'); }

  const { id, name, slug: rawSlug, description = '', url = '', screenshot = '', is_top = 0 } = body;
  if (!name?.trim()) return bad('Name is required');

  const slug = slugify(rawSlug || name);
  if (!slug) return bad('Invalid slug');

  if (is_top !== 0 && is_top !== 1) return bad('is_top must be 0 or 1');

  try {
    if (id) {
      await env.DB.prepare(
        `UPDATE games SET name = ?, slug = ?, description = ?, url = ?, screenshot = ?, is_top = ? WHERE id = ?`
      ).bind(name.trim(), slug, description, url, screenshot, is_top, id).run();
      // Si se marca como TOP, quitar el TOP de los demás
      if (is_top === 1) {
        await env.DB.prepare('UPDATE games SET is_top = 0 WHERE id != ?').bind(id).run();
      }
      return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers: H });
    } else {
      const result = await env.DB.prepare(
        `INSERT INTO games (name, slug, description, url, screenshot, is_top) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(name.trim(), slug, description, url, screenshot, is_top).run();
      const newId = Number(result.meta.last_row_id);
      if (is_top === 1) {
        await env.DB.prepare('UPDATE games SET is_top = 0 WHERE id != ?').bind(newId).run();
      }
      return new Response(JSON.stringify({ ok: true, id: newId }), { status: 200, headers: H });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) return bad('Slug already exists');
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/games/manage?id=N — eliminar juego ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') return forbidden();

  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id || isNaN(id)) return bad('Missing id');

  try {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM game_reactions WHERE game_id = ?').bind(id),
      env.DB.prepare('DELETE FROM game_scores WHERE game_id = ?').bind(id),
      env.DB.prepare('DELETE FROM games WHERE id = ?').bind(id),
    ]);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── PATCH /api/games/manage?id=N — marcar como TOP ── */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') return forbidden();

  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id || isNaN(id)) return bad('Missing id');

  try {
    await env.DB.batch([
      env.DB.prepare('UPDATE games SET is_top = 0').bind(),
      env.DB.prepare('UPDATE games SET is_top = 1 WHERE id = ?').bind(id),
    ]);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
