import { jwtVerify } from 'jose';

interface Env { DB: D1Database; JWT_SECRET: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=').slice(1).join('=').trim();
  if (!token) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
  try {
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
  }

  let body: { id: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  if (!body.id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers });

  await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(body.id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
