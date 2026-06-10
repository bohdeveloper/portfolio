import { verifyAuth } from '../_auth-util';
import { validateHttpsUrl } from '../_security';

interface Env { DB: D1Database; JWT_SECRET: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers });
  }

  let body: {
    id?: number; slug: string; title: string; excerpt?: string; cover_image?: string;
    content?: string; tags?: string; github_url?: string; demo_url?: string;
    architecture?: string; published?: number; featured?: number;
  };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const {
    id, slug, title,
    excerpt = '', cover_image = '', content = '', tags = '',
    github_url = '', demo_url = '', architecture = '',
    published = 0, featured = 0,
  } = body;

  if (!slug || !title) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers });
  }
  if (title.length > 500 || slug.length > 200 || tags.length > 500) {
    return new Response(JSON.stringify({ ok: false, error: 'Field too long' }), { status: 400, headers });
  }
  if (github_url && validateHttpsUrl(github_url) === null)
    return new Response(JSON.stringify({ ok: false, error: 'github_url debe ser una URL https válida' }), { status: 400, headers });
  if (demo_url && validateHttpsUrl(demo_url) === null)
    return new Response(JSON.stringify({ ok: false, error: 'demo_url debe ser una URL https válida' }), { status: 400, headers });

  try {
    if (id) {
      await env.DB.prepare(
        `UPDATE projects SET slug=?, title=?, excerpt=?, cover_image=?, content=?, tags=?, github_url=?, demo_url=?, architecture=?, published=?, featured=?, updated_at=datetime('now') WHERE id=?`
      ).bind(slug, title, excerpt, cover_image, content, tags, github_url, demo_url, architecture, published, featured, id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO projects (slug, title, excerpt, cover_image, content, tags, github_url, demo_url, architecture, published, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(slug, title, excerpt, cover_image, content, tags, github_url, demo_url, architecture, published, featured).run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return new Response(JSON.stringify({ ok: false, error: 'Slug already exists' }), { status: 409, headers });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers });
  }
};
