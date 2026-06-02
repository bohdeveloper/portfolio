import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

interface BookRow {
  id: number; title: string; category: string; description: string | null;
  level: string; language: string; num_chapters: number; cover_color: string;
  toc: string | null; status: string; word_count: number; created_at: string;
  chapters_done: number;
}

/* ── GET /api/tintai/books — lista de libros del usuario ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const { results } = await env.DB.prepare(`
    SELECT b.id, b.title, b.category, b.description, b.level, b.language,
           b.num_chapters, b.cover_color, b.toc, b.status, b.word_count, b.created_at,
           COUNT(c.id) AS chapters_done
    FROM tintai_books b
    LEFT JOIN tintai_chapters c ON c.book_id = b.id
    WHERE b.user_id = ?
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `).bind(auth.user_id).all<BookRow>();

  return new Response(JSON.stringify({ ok: true, books: results }), { status: 200, headers: H });
};

/* ── DELETE /api/tintai/books?id=N — eliminar libro (cascada a capítulos y progreso) ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id)
    return new Response(JSON.stringify({ ok: false, error: 'id requerido' }), { status: 400, headers: H });

  await env.DB.prepare(
    'DELETE FROM tintai_books WHERE id = ? AND user_id = ?'
  ).bind(id, auth.user_id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};
