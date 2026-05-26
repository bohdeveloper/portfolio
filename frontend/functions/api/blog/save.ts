import { jwtVerify } from 'jose';

interface Env { DB: D1Database; JWT_SECRET: string }

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

  let body: {
    id?: number; slug: string; title: string; excerpt?: string;
    content: string; tags?: string; published?: number; reading_time?: number;
  };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { id, slug, title, excerpt = '', content, tags = '', published = 0, reading_time = 0 } = body;
  if (!slug || !title || !content) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers });
  }

  if (id) {
    await env.DB.prepare(
      `UPDATE blog_posts SET slug=?, title=?, excerpt=?, content=?, tags=?, published=?, reading_time=?, updated_at=datetime('now')
       WHERE id=?`
    ).bind(slug, title, excerpt, content, tags, published, reading_time, id).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO blog_posts (slug, title, excerpt, content, tags, published, reading_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(slug, title, excerpt, content, tags, published, reading_time).run();
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
