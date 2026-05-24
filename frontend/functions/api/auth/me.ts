import { jwtVerify } from 'jose';

interface Env {
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=').slice(1).join('=').trim();

  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'No session' }), { status: 401, headers });
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return new Response(JSON.stringify({ ok: true, username: payload.username }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid session' }), { status: 401, headers });
  }
};
