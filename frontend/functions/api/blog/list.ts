interface Env { DB: D1Database }

const CACHE_TTL = 300; // 5 min

/* ── GET /api/blog/list — posts publicados, con caché de edge ──
   El modo admin (borradores) se retiró con el panel el 21 oct 2026. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, slug, title, excerpt, cover_image, tags, published, views, reading_time, ai_generated, created_at, updated_at
       FROM blog_posts WHERE published = 1 ORDER BY created_at DESC`
    ).all();
    const response = new Response(JSON.stringify({ ok: true, data: results }), {
      status: 200,
      headers: { ...headers, 'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=60` },
    });
    waitUntil(cache.put(request, response.clone()));
    return response;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers });
  }
};
