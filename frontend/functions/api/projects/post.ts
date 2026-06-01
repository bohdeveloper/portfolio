interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'Missing slug' }), { status: 400, headers });

  const project = await env.DB.prepare(
    'SELECT * FROM projects WHERE slug = ? AND published = 1'
  ).bind(slug).first();

  if (!project) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404, headers });

  env.DB.prepare('UPDATE projects SET views = views + 1 WHERE slug = ?').bind(slug).run().catch(() => {});

  return new Response(JSON.stringify({ ok: true, data: project }), { status: 200, headers });
};
