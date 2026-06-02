import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

/* ── GET /api/tintai/progress?book_id=N — progreso de lectura de un libro ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const book_id = parseInt(new URL(request.url).searchParams.get('book_id') ?? '');
  if (!book_id)
    return new Response(JSON.stringify({ ok: false, error: 'book_id requerido' }), { status: 400, headers: H });

  const { results } = await env.DB.prepare(
    'SELECT current_chapter, last_read_at FROM tintai_progress WHERE user_id = ? AND book_id = ?'
  ).bind(auth.user_id, book_id).all<{ current_chapter: number; last_read_at: string }>();

  return new Response(JSON.stringify({
    ok: true,
    progress: results[0] ?? { current_chapter: 0, last_read_at: null },
  }), { status: 200, headers: H });
};

/* ── POST /api/tintai/progress — guardar capítulo actual ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  let body: { book_id?: number; current_chapter?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { book_id, current_chapter } = body;
  if (book_id === undefined || current_chapter === undefined)
    return new Response(JSON.stringify({ ok: false, error: 'book_id y current_chapter requeridos' }), { status: 400, headers: H });

  await env.DB.prepare(`
    INSERT INTO tintai_progress (user_id, book_id, current_chapter, last_read_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, book_id) DO UPDATE SET
      current_chapter = excluded.current_chapter,
      last_read_at    = excluded.last_read_at
  `).bind(auth.user_id, book_id, current_chapter).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};
