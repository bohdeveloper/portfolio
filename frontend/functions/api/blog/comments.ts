import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const PH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const H  = { 'Content-Type': 'application/json' };

const COMMENT_RATE_LIMIT = 3;   // max comentarios por IP
const COMMENT_RATE_WINDOW = 10; // minutos

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode('boh_comments_' + ip);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/* ── GET /api/blog/comments ─────────────────────────────────────────────────
   ?slug=xxx            → comentarios aprobados del post (público)
   ?admin=1&filter=xxx  → lista para moderación (super_admin) */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url     = new URL(request.url);
  const isAdmin = url.searchParams.get('admin') === '1';

  if (isAdmin) {
    const auth = await verifyAuth(request, env.JWT_SECRET);
    if (!auth || auth.role !== 'super_admin') {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });
    }

    try {
      const filter = url.searchParams.get('filter') ?? 'pending';

      // Evitar interpolación de strings: consultas separadas por caso
      let query: ReturnType<D1Database['prepare']>;
      if (filter === 'all') {
        query = env.DB.prepare(`
          SELECT c.id, c.post_id, c.parent_id, c.alias, c.body, c.ip_hash,
                 c.created_at, c.approved, p.slug, p.title
          FROM blog_comments c
          JOIN blog_posts p ON p.id = c.post_id
          ORDER BY c.created_at DESC
        `);
      } else {
        query = env.DB.prepare(`
          SELECT c.id, c.post_id, c.parent_id, c.alias, c.body, c.ip_hash,
                 c.created_at, c.approved, p.slug, p.title
          FROM blog_comments c
          JOIN blog_posts p ON p.id = c.post_id
          WHERE c.approved = ?
          ORDER BY c.created_at DESC
        `).bind(filter === 'approved' ? 1 : 0);
      }

      const [{ results }, pendingRow] = await Promise.all([
        query.all(),
        env.DB.prepare('SELECT COUNT(*) as n FROM blog_comments WHERE approved = 0').first<{ n: number }>(),
      ]);

      return new Response(JSON.stringify({ ok: true, data: results, pending: pendingRow?.n ?? 0 }), { status: 200, headers: H });
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
    }
  }

  // Público: comentarios aprobados del post
  const slug = url.searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'Missing slug' }), { status: 400, headers: PH });

  try {
    const post = await env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? AND published = 1')
      .bind(slug).first<{ id: number }>();
    if (!post) return new Response(JSON.stringify({ ok: true, data: [] }), { status: 200, headers: PH });

    const { results } = await env.DB.prepare(
      'SELECT id, parent_id, alias, body, created_at FROM blog_comments WHERE post_id = ? AND approved = 1 ORDER BY created_at ASC'
    ).bind(post.id).all<{ id: number; parent_id: number | null; alias: string; body: string; created_at: string }>();

    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: PH });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: PH });
  }
};

/* ── POST /api/blog/comments — enviar comentario público ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Solo usar cf-connecting-ip (Cloudflare-controlled, no spoofeable)
  const ip     = request.headers.get('cf-connecting-ip') || 'unknown';
  const ipHash = await hashIp(ip);

  try {
    // Verificar ban
    const banned = await env.DB.prepare('SELECT 1 FROM blog_banned_ips WHERE ip_hash = ?').bind(ipHash).first();
    if (banned) return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: PH });

    // Rate limiting por IP: max COMMENT_RATE_LIMIT comentarios en COMMENT_RATE_WINDOW minutos
    const rateRow = await env.DB.prepare(
      `SELECT COUNT(*) as n FROM blog_comments WHERE ip_hash = ? AND created_at > datetime('now', '-${COMMENT_RATE_WINDOW} minutes')`
    ).bind(ipHash).first<{ n: number }>();
    if ((rateRow?.n ?? 0) >= COMMENT_RATE_LIMIT) {
      return new Response(
        JSON.stringify({ ok: false, error: `Demasiados comentarios. Espera ${COMMENT_RATE_WINDOW} minutos.` }),
        { status: 429, headers: PH }
      );
    }

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

    // Validar parent_id: solo respuestas a comentarios raíz aprobados del mismo post
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
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: PH });
  }
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

  // Validar que approved sea 0 o 1
  const approved = body.approved === 0 ? 0 : 1;

  try {
    await env.DB.prepare('UPDATE blog_comments SET approved = ? WHERE id = ?')
      .bind(approved, body.id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
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
  if (!id || isNaN(id)) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers: H });

  try {
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
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
