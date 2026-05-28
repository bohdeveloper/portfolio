interface Env { DB: D1Database }

const VALID_EMOJIS = ['👍', '❤️', '🔥', '💡'];
const H = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok: false, error: 'Missing slug' }), { status: 400, headers: H });

  const post = await env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? AND published = 1')
    .bind(slug).first<{ id: number }>();
  if (!post) return new Response(JSON.stringify({ ok: true, data: {} }), { status: 200, headers: H });

  const { results } = await env.DB.prepare(
    'SELECT emoji, count FROM blog_reactions WHERE post_id = ?'
  ).bind(post.id).all<{ emoji: string; count: number }>();

  const data: Record<string, number> = {};
  for (const r of results) data[r.emoji] = r.count;
  return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: H });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { slug?: string; emoji?: string; delta?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { slug, emoji, delta = 1 } = body;
  if (!slug || !emoji) return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers: H });
  if (!VALID_EMOJIS.includes(emoji)) return new Response(JSON.stringify({ ok: false, error: 'Invalid emoji' }), { status: 400, headers: H });
  if (delta !== 1 && delta !== -1) return new Response(JSON.stringify({ ok: false, error: 'Invalid delta' }), { status: 400, headers: H });

  const post = await env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? AND published = 1')
    .bind(slug).first<{ id: number }>();
  if (!post) return new Response(JSON.stringify({ ok: false, error: 'Post not found' }), { status: 404, headers: H });

  if (delta === 1) {
    await env.DB.prepare(
      'INSERT INTO blog_reactions (post_id, emoji, count) VALUES (?, ?, 1) ON CONFLICT(post_id, emoji) DO UPDATE SET count = count + 1'
    ).bind(post.id, emoji).run();
  } else {
    await env.DB.prepare(
      'UPDATE blog_reactions SET count = MAX(0, count - 1) WHERE post_id = ? AND emoji = ?'
    ).bind(post.id, emoji).run();
  }

  const row = await env.DB.prepare('SELECT count FROM blog_reactions WHERE post_id = ? AND emoji = ?')
    .bind(post.id, emoji).first<{ count: number }>();

  return new Response(JSON.stringify({ ok: true, count: row?.count ?? 0 }), { status: 200, headers: H });
};
