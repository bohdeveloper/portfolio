interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'Missing slug' }), { status: 400, headers });

  const post = await env.DB.prepare(
    'SELECT * FROM blog_posts WHERE slug = ? AND published = 1'
  ).bind(slug).first();

  if (!post) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404, headers });

  /* increment views without awaiting — fire and forget */
  env.DB.prepare('UPDATE blog_posts SET views = views + 1 WHERE slug = ?').bind(slug).run().catch(() => {});

  return new Response(JSON.stringify({ ok: true, data: post }), { status: 200, headers });
};
