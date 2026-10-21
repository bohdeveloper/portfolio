interface Env { DB: D1Database }

const CACHE_TTL = 300; // 5 min

/* ── GET /api/projects/list — proyectos publicados, con caché de edge ──
   La caché evita que los bots agoten la cuota de D1. El modo admin
   (borradores) se retiró con el panel el 21 oct 2026. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, slug, title, excerpt, cover_image, tags, github_url, demo_url, architecture, published, featured, views, created_at,
              (CASE WHEN content IS NOT NULL AND TRIM(content) != '' AND content != '<p></p>' THEN 1 ELSE 0 END) AS has_content
       FROM projects WHERE published = 1 ORDER BY featured DESC, created_at DESC`
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
