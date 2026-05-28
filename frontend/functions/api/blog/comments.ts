import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const PH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const H  = { 'Content-Type': 'application/json' };

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode('boh_comments_' + ip);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/* ── GET /api/blog/comments ─────────────────────────────────────────────────
   ?slug=xxx            → comentarios aprobados del post (público)
   ?admin=1&filter=xxx  → todos los comentarios para moderación (super_admin) */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url     = new URL(request.url);
  const isAdmin = url.searchParams.get('admin') === '1';

  if (isAdmin) {
    const auth = await verifyAuth(request, env.JWT_SECRET);
    if (!auth || auth.role !== 'super_admin') {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });
    }
    const filter = url.searchParams.get('filter') ?? 'pending';
    const where  = filter === 'all' ? '' : filter === 'approved' ? 'WHERE c.approved = 1' : 'WHERE c.approved = 0';
    const { results } = await env.DB.prepare(`
      SELECT c.id, c.post_id, c.parent_id, c.alias, c.body, c.ip_hash,
             c.created_at, c.approved, p.slug, p.title
      FROM blog_comments c
      JOIN blog_posts p ON p.id = c.post_id
      ${where}
      ORDER BY c.created_at DESC
    `).all();

    const pending = await env.DB.prepare('SELECT COUNT(*) as n FROM blog_comments WHERE approved = 0').first<{ n: number }>();
    return new Response(JSON.stringify({ ok: true, data: results, pending: pending?.n ?? 0 }), { status: 200, headers: H });
  }

  // Public: approved comments for a post
  const slug = url.searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'Missing slug' }), { status: 400, headers: PH });

  const post = await env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? AND published = 1')
    .bind(slug).first<{ id: number }>();
  if (!post) return new Response(JSON.stringify({ ok: true, data: [] }), { status: 200, headers: PH });

  const { results } = await env.DB.prepare(
    'SELECT id, parent_id, alias, body, created_at FROM blog_comments WHERE post_id = ? AND approved = 1 ORDER BY created_at ASC'
  ).bind(post.id).all<{ id: number; parent_id: number | null; alias: string; body: string; created_at: string }>();

  return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: PH });
};

/* ── POST /api/blog/comments — enviar comentario público ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip     = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const ipHash = await hashIp(ip);

  const banned = await env.DB.prepare('SELECT 1 FROM blog_banned_ips WHERE ip_hash = ?').bind(ipHash).first();
  if (banned) return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: PH });

  let body: { slug?: string; parent_id?: number | null; alias?: string; body?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: PH });
  }

  const { slug, parent_id = null, alias, body: text } = body;
  if (!slug || !alias?.trim() || !text?.trim()) {
    return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios' }), { status: 400, headers: PH });
  }
  if (alias.trim().length > 50)  return new Response(JSON.stringify({ ok: false, error: 'Nombre demasiado largo' }), { status: 400, headers: PH });
  if (text.trim().length > 2000) return new Response(JSON.stringify({ ok: false, error: 'Comentario demasiado largo' }), { status: 400, headers: PH });
  if (text.trim().length < 3)    return new Response(JSON.stringify({ ok: false, error: 'Comentario demasiado corto' }), { status: 400, headers: PH });

  const post = await env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? AND published = 1')
    .bind(slug).first<{ id: number }>();
  if (!post) return new Response(JSON.stringify({ ok: false, error: 'Post not found' }), { status: 404, headers: PH });

  // Validar parent_id: solo permitir respuestas a comentarios raíz aprobados
  if (parent_id) {
    const parent = await env.DB.prepare(
      'SELECT id FROM blog_comments WHERE id = ? AND post_id = ? AND parent_id IS NULL AND approved = 1'
    ).bind(parent_id, post.id).first();
    if (!parent) return new Response(JSON.stringify({ ok: false, error: 'Invalid parent' }), { status: 400, headers: PH });
  }

  await env.DB.prepare(
    'INSERT INTO blog_comments (post_id, parent_id, alias, body, ip_hash, approved) VALUES (?, ?, ?, ?, ?, 0)'
  ).bind(post.id, parent_id ?? null, alias.trim(), text.trim(), ipHash).run();

  return new Response(JSON.stringify({ ok: true, pending: true }), { status: 200, headers: PH });
};

/* ── PATCH /api/blog/comments — aprobar / rechazar (admin) ── */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });
  }

  let body: { id?: number; approved?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }
  if (!body.id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers: H });

  await env.DB.prepare('UPDATE blog_comments SET approved = ? WHERE id = ?')
    .bind(body.approved ?? 1, body.id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};

/* ── DELETE /api/blog/comments?id=N&ban=1 — eliminar + opcional ban IP (admin) ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || auth.role !== 'super_admin') {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });
  }

  const url   = new URL(request.url);
  const id    = parseInt(url.searchParams.get('id') ?? '');
  const banIp = url.searchParams.get('ban') === '1';
  if (!id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers: H });

  if (banIp) {
    const comment = await env.DB.prepare('SELECT ip_hash FROM blog_comments WHERE id = ?')
      .bind(id).first<{ ip_hash: string }>();
    if (comment?.ip_hash) {
      await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO blog_banned_ips (ip_hash) VALUES (?)').bind(comment.ip_hash),
        env.DB.prepare('DELETE FROM blog_comments WHERE ip_hash = ?').bind(comment.ip_hash),
      ]);
      return new Response(JSON.stringify({ ok: true, banned: true }), { status: 200, headers: H });
    }
  }

  await env.DB.prepare('DELETE FROM blog_comments WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};
