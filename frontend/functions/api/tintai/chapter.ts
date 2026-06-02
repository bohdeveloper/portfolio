import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

/* ── GET /api/tintai/chapter?book_id=N&index=N — contenido de un capítulo ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const url     = new URL(request.url);
  const book_id = parseInt(url.searchParams.get('book_id') ?? '');
  const index   = parseInt(url.searchParams.get('index')   ?? '0');

  if (!book_id)
    return new Response(JSON.stringify({ ok: false, error: 'book_id requerido' }), { status: 400, headers: H });

  // Verificamos que el libro pertenece al usuario antes de devolver el capítulo
  const { results: bookCheck } = await env.DB.prepare(
    'SELECT id, title, num_chapters, toc FROM tintai_books WHERE id = ? AND user_id = ?'
  ).bind(book_id, auth.user_id).all<{ id: number; title: string; num_chapters: number; toc: string }>();

  if (!bookCheck[0])
    return new Response(JSON.stringify({ ok: false, error: 'Libro no encontrado' }), { status: 404, headers: H });

  const { results } = await env.DB.prepare(
    'SELECT chapter_index, title, content, word_count FROM tintai_chapters WHERE book_id = ? AND chapter_index = ?'
  ).bind(book_id, index).all<{ chapter_index: number; title: string; content: string; word_count: number }>();

  if (!results[0])
    return new Response(JSON.stringify({ ok: false, error: 'Capítulo no encontrado' }), { status: 404, headers: H });

  return new Response(JSON.stringify({
    ok: true,
    chapter: results[0],
    book: { title: bookCheck[0].title, num_chapters: bookCheck[0].num_chapters },
  }), { status: 200, headers: H });
};
