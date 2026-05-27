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

  const row = await env.DB.prepare('SELECT id, password_hash, role, active FROM admin_users WHERE username = ?')
    .bind(username)
    .first<{ id: number; password_hash: string; role: string; active: number }>();

  const valid = row ? await bcrypt.compare(password, row.password_hash) : false;

  if (!valid) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 401, headers });
  }

  if (!row || !row.active) {
    return new Response(JSON.stringify({ ok: false, error: 'User is inactive' }), { status: 401, headers });
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({ user_id: row.id, username, role: row.role })
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
