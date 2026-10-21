interface Env { DB: D1Database }

const CACHE_TTL = 300; // 5 min
const PH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

/* ── GET /api/blog/comments?slug=xxx — comentarios aprobados del post ──
   Comentarios cerrados desde el 21 oct 2026: se retiró el panel de
   administración y con él la moderación, así que no hay handler POST y ya
   no se aceptan nuevos. Los datos ya no cambian, así que la respuesta va a
   la caché de edge como el resto de lecturas públicas. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'Missing slug' }), { status: 400, headers: PH });

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const { results } = await env.DB.prepare(
      `SELECT c.id, c.parent_id, c.alias, c.body, c.created_at
       FROM blog_comments c JOIN blog_posts p ON p.id = c.post_id
       WHERE p.slug = ? AND p.published = 1 AND c.approved = 1
       ORDER BY c.created_at ASC`
    ).bind(slug).all<{ id: number; parent_id: number | null; alias: string; body: string; created_at: string }>();

    const response = new Response(JSON.stringify({ ok: true, data: results }), {
      status: 200,
      headers: { ...PH, 'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=60` },
    });
    waitUntil(cache.put(request, response.clone()));
    return response;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: PH });
  }
};
