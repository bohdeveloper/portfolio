interface Env { DB: D1Database; JWT_SECRET: string }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const isAdmin = new URL(request.url).searchParams.get('admin') === 'true';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!isAdmin) headers['Access-Control-Allow-Origin'] = '*';

  if (isAdmin) {
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

  const where = isAdmin ? '' : 'WHERE published = 1';
  const fields = isAdmin
    ? 'id, slug, title, excerpt, cover_image, content, tags, github_url, demo_url, architecture, published, featured, views, created_at, updated_at'
    : "id, slug, title, excerpt, cover_image, tags, github_url, demo_url, architecture, published, featured, views, created_at, (CASE WHEN content IS NOT NULL AND TRIM(content) != '' AND content != '<p></p>' THEN 1 ELSE 0 END) AS has_content";

  try {
    const { results } = await env.DB.prepare(
      `SELECT ${fields} FROM projects ${where} ORDER BY featured DESC, created_at DESC`
    ).all();
    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers });
  }
};
