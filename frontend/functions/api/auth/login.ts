import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { username, password } = body;
  if (!username || !password) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing credentials' }), { status: 400, headers });
  }

  const row = await env.DB.prepare('SELECT password_hash FROM admin_users WHERE username = ?')
    .bind(username)
    .first<{ password_hash: string }>();

  const valid = row ? await bcrypt.compare(password, row.password_hash) : false;

  if (!valid) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 401, headers });
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`,
    },
  });
};
