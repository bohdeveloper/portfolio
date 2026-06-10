import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const RATE_LIMIT   = 5;            // max intentos fallidos antes de lockout
const RATE_WINDOW  = 15 * 60;      // ventana en segundos (15 min)
const CLEANUP_AGE  = 24 * 60 * 60; // limpiar intentos > 24h
// Hash ficticio válido para que bcrypt siempre se ejecute (evita timing attack de enumeración)
const DUMMY_HASH   = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh6C';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const ip  = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Math.floor(Date.now() / 1000);

  // ── Rate limiting ────────────────────────────────────────────────────────────
  const { results: attempts } = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM login_attempts WHERE ip = ? AND created_at > ?'
  ).bind(ip, now - RATE_WINDOW).all<{ count: number }>();

  if ((attempts[0]?.count ?? 0) >= RATE_LIMIT) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Demasiados intentos. Inténtalo en 15 minutos.' }),
      { status: 429, headers }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
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
  // Rechazar credenciales desproporcionadas antes de tocar la BD
  if (username.length > 100 || password.length > 200) {
    return new Response(JSON.stringify({ ok: false, error: 'Credenciales incorrectas' }), { status: 401, headers });
  }

  // ── Autenticación ────────────────────────────────────────────────────────────
  const row = await env.DB.prepare(
    'SELECT id, password_hash, role, active FROM admin_users WHERE username = ?'
  ).bind(username).first<{ id: number; password_hash: string; role: string; active: number }>();

  // Siempre ejecutar bcrypt para evitar timing attack de enumeración de usuarios
  const hashToCompare = row?.password_hash ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!valid || !row || !row.active) {
    // Registrar intento fallido + limpiar muy antiguos (async, no bloqueante)
    await env.DB.batch([
      env.DB.prepare('INSERT INTO login_attempts (ip, created_at) VALUES (?, ?)').bind(ip, now),
      env.DB.prepare('DELETE FROM login_attempts WHERE created_at < ?').bind(now - CLEANUP_AGE),
    ]);
    // Mensaje genérico para no revelar si el usuario existe o está inactivo
    return new Response(JSON.stringify({ ok: false, error: 'Credenciales incorrectas' }), { status: 401, headers });
  }

  // Login correcto — limpiar intentos fallidos de esta IP
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();

  // ── Emitir JWT ───────────────────────────────────────────────────────────────
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({ user_id: row.id, username: row.id === 1 ? username : username, role: row.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(secret);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=14400; Path=/`,
    },
  });
};
