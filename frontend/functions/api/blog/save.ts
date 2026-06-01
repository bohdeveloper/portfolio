import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers });
  }

  let body: {
    id?: number; slug: string; title: string; excerpt?: string; cover_image?: string;
    content: string; tags?: string; published?: number; reading_time?: number; ai_generated?: number;
  };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { id, slug, title, excerpt = '', cover_image = '', content, tags = '', published = 0, reading_time = 0, ai_generated = 0 } = body;
  if (!slug || !title || !content) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers });
  }

  // Sanity limits to prevent oversized payloads
  if (title.length > 500 || slug.length > 200 || tags.length > 500) {
    return new Response(JSON.stringify({ ok: false, error: 'Field too long' }), { status: 400, headers });
  }

  try {
    if (id) {
      await env.DB.prepare(
        `UPDATE blog_posts SET slug=?, title=?, excerpt=?, cover_image=?, content=?, tags=?, published=?, reading_time=?, ai_generated=?, updated_at=datetime('now') WHERE id=?`
      ).bind(slug, title, excerpt, cover_image, content, tags, published, reading_time, ai_generated, id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO blog_posts (slug, title, excerpt, cover_image, content, tags, published, reading_time, ai_generated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(slug, title, excerpt, cover_image, content, tags, published, reading_time, ai_generated).run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return new Response(JSON.stringify({ ok: false, error: 'Slug already exists' }), { status: 409, headers });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers });
  }
};
