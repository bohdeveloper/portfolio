interface Env { DB: D1Database; JWT_SECRET: string }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const url = new URL(request.url);
  const adminMode = url.searchParams.get('admin') === 'true';

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
    ? `id, slug, title, excerpt, cover_image, content, tags, published, views, reading_time, created_at, updated_at`
    : `id, slug, title, excerpt, cover_image, tags, published, views, reading_time, created_at, updated_at`;
  try {
    const { results } = await env.DB.prepare(
      `SELECT ${fields} FROM blog_posts ${where} ORDER BY created_at DESC`
    ).all();
    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers });
  }
};
