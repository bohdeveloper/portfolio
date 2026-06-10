interface Env { DB: D1Database; JWT_SECRET: string }

const CACHE_TTL = 300; // 5 min

export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  // CORS wildcard solo para el endpoint público; en modo admin no se envía (misma origen)
  const isAdmin = new URL(request.url).searchParams.get('admin') === 'true';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!isAdmin) headers['Access-Control-Allow-Origin'] = '*';
  const url = new URL(request.url);
  const adminMode = isAdmin;

  if (!adminMode) {
    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  if (adminMode) {
    const cookie = request.headers.get('Cookie') ?? '';
    const token = cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=').slice(1).join('=').trim();
    if (!token) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
    try {
      const { jwtVerify } = await import('jose');
      await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
    }
  }

  const where = adminMode ? '' : 'WHERE published = 1';
  const fields = adminMode
    ? `id, slug, title, excerpt, cover_image, content, tags, published, views, reading_time, ai_generated, created_at, updated_at`
    : `id, slug, title, excerpt, cover_image, tags, published, views, reading_time, ai_generated, created_at, updated_at`;
  try {
    const { results } = await env.DB.prepare(
      `SELECT ${fields} FROM blog_posts ${where} ORDER BY created_at DESC`
    ).all();
    const response = new Response(JSON.stringify({ ok: true, data: results }), {
      status: 200,
      headers: adminMode ? headers : { ...headers, 'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=60` },
    });
    if (!adminMode) waitUntil(caches.default.put(request, response.clone()));
    return response;
  } catch (err: unknown) {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers });
  }
};
